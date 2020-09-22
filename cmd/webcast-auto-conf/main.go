package main

import (
	"crypto/tls"
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"runtime"
	"strconv"
	"syscall"
	"time"

	"gopkg.in/ini.v1"
)

const (
	numPollers                    = 1                // number of Poller goroutines to launch
	pollInterval                  = 10 * time.Second // how often to poll each URL
	statusInterval                = 10 * time.Second // how often to log status to stdout
	errTimeout                    = 10 * time.Second // back-off timeout on error
	LinuxRebootMagic1     uintptr = 0xfee1dead
	LinuxRebootMagic2     uintptr = 672274793
	LinuxRebootCmdRestart uintptr = 0x1234567
)

type TeradekEncoder struct {
	XMLName xml.Name `xml:"teradek_encoder"`
	Text    string   `xml:",chardata"`
	Encode  struct {
		Text  string `xml:",chardata"`
		Video struct {
			Text              string `xml:",chardata"`
			Quality           string `xml:"quality"`
			CustomResolution  string `xml:"custom_resolution"`
			CustomBitrate     string `xml:"custom_bitrate"`
			Aspect            string `xml:"aspect"`
			FrameRateFraction string `xml:"frame_rate_fraction"`
		} `xml:"video"`
		Audio struct {
			Text          string `xml:",chardata"`
			Quality       string `xml:"quality"`
			CustomBitrate string `xml:"custom_bitrate"`
		} `xml:"audio"`
	} `xml:"encode"`
	Output struct {
		Text string `xml:",chardata"`
		Rtmp struct {
			Text               string `xml:",chardata"`
			URL                string `xml:"url"`
			Stream             string `xml:"stream"`
			Username           string `xml:"username"`
			Password           string `xml:"password"`
			AdaptiveBitrate    string `xml:"adaptive_bitrate"`
			AutoReconnect      string `xml:"auto_reconnect"`
			AutoStartBroadcast string `xml:"auto_start_broadcast"`
		} `xml:"rtmp"`
	} `xml:"output"`
}

var enableReboot = false
var configLocation = "sample_box_ini"

var urls = []string{
	"https://webcast.churchofjesuschrist.org/encoder/2180",
}

// State represents the last-known state of a URL.
type State struct {
	url    string
	status string
}

// StateMonitor maintains a map that stores the state of the URLs being
// polled, and prints the current state every updateInterval nanoseconds.
// It returns a chan State to which resource state should be sent.
func StateMonitor(updateInterval time.Duration) chan<- State {
	updates := make(chan State)
	urlStatus := make(map[string]string)
	ticker := time.NewTicker(updateInterval)
	go func() {
		for {
			select {
			case <-ticker.C:
				logState(urlStatus)
			case s := <-updates:
				urlStatus[s.url] = s.status
			}
		}
	}()
	return updates
}

// logState prints a state map.
func logState(s map[string]string) {
	log.Println("Current state:")
	for k, v := range s {
		log.Printf(" %s %s", k, v)
	}
}

// Resource represents an HTTP URL to be polled by this program.
type Resource struct {
	url      string
	errCount int
}

// Poll executes an HTTP HEAD request for url
// and returns the HTTP status string or an error string.
func (r *Resource) Poll() string {

	config, _ := GetEncoderConfig()

	remoteURL := config.Section("").Key("s3_osd0_txt").String()
	if remoteURL != r.url {
		reboot()
	}

	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
	resp, err := http.Get(r.url)
	if err != nil {
		log.Println("Error", r.url, err)
		r.errCount++
		return err.Error()
	}
	defer resp.Body.Close()

	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error", r.url, err)
		r.errCount++
		return err.Error()
	}

	var encoderData TeradekEncoder
	xml.Unmarshal(data, &encoderData)

	log.Printf("RTMP URL: %s/%s\n", encoderData.Output.Rtmp.URL, encoderData.Output.Rtmp.Stream)
	UpdateEncoderConfig(&encoderData)
	r.errCount = 0
	return resp.Status
}

// Sleep sleeps for an appropriate interval (dependent on error state)
// before sending the Resource to done.
func (r *Resource) Sleep(done chan<- *Resource) {
	time.Sleep(pollInterval + errTimeout*time.Duration(r.errCount))
	done <- r
}

func Poller(in <-chan *Resource, out chan<- *Resource, status chan<- State) {
	for r := range in {
		s := r.Poll()
		status <- State{r.url, s}
		out <- r
	}
}

func GetEncoderConfig() (config *ini.File, err error) {

	if runtime.GOOS == "linux" {
		configLocation = "/box/box.ini"
		enableReboot = true
	}

	config, err = ini.LoadSources(ini.LoadOptions{
		KeyValueDelimiters:       ":",
		KeyValueDelimiterOnWrite: ":",
	}, configLocation)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %v", err)
	}
	return config, nil
}

func UpdateEncoderConfig(encoderData *TeradekEncoder) {

	var configChanges = false
	ini.PrettyFormat = false

	config, err := GetEncoderConfig()
	if err != nil {
		log.Printf("Fail to read file: %v", err)
		return
	}

	if fmt.Sprintf("%s", encoderData.Output.Rtmp.URL) != "RTMPURL" {
		remoteRTMP := fmt.Sprintf("%s/%s", encoderData.Output.Rtmp.URL, encoderData.Output.Rtmp.Stream)
		localRTMP := config.Section("").Key("s0_rtmp_publish_uri").String()
		remoteVideoBitrateBits, _ := strconv.Atoi(fmt.Sprintf("%s", encoderData.Encode.Video.CustomBitrate))
		remoteVideoBitrateKilobits := remoteVideoBitrateBits / 1024
		localVideoBitrateKilobits, _ := strconv.Atoi(config.Section("").Key("s0_venc_bitrate").String())

		remoteAudioBitrateBits, _ := strconv.Atoi(fmt.Sprintf("%s", encoderData.Encode.Audio.CustomBitrate))
		//remoteAudioBitrateKilobits := remoteAudioBitrateBits / 1024
		localAudioBitrateKilobits, _ := strconv.Atoi(config.Section("").Key("aenc_bitrate").String())

		RTMPEnabled := config.Section("").Key("s0_rtmp_publish_enable").String()
		if RTMPEnabled != "1" {
			log.Println("Config does not match: Enabling RTMP Publish")
			config.Section("").Key("s0_rtmp_publish_enable").SetValue("1")
			configChanges = true
		}

		if localRTMP != remoteRTMP {
			log.Println("Config does not match: Updating RTMP URI")
			config.Section("").Key("s0_rtmp_publish_uri").SetValue(remoteRTMP)
			configChanges = true
		}

		if localVideoBitrateKilobits != remoteVideoBitrateKilobits {
			log.Println("Config does not match: Updating Video Bitrate")
			config.Section("").Key("s0_venc_bitrate").SetValue(strconv.Itoa(remoteVideoBitrateKilobits))
			configChanges = true
		}

		if localAudioBitrateKilobits != remoteAudioBitrateBits {
			log.Println("Config does not match: Updating Audio Bitrate")
			config.Section("").Key("aenc_bitrate").SetValue(strconv.Itoa(remoteAudioBitrateBits))
			configChanges = true
		}

	} else {
		RTMPEnabled := config.Section("").Key("s0_rtmp_publish_enable").String()
		if RTMPEnabled != "0" {
			log.Println("Config does not match: Disabling RTMP Publish")
			config.Section("").Key("s0_rtmp_publish_enable").SetValue("0")
			configChanges = true
		}
	}

	if configChanges {
		config.SaveTo(configLocation)
		if enableReboot {
			reboot()
		}
	}

}

func reboot() {
	syscall.Syscall(syscall.SYS_REBOOT,
		LinuxRebootMagic1,
		LinuxRebootMagic2,
		LinuxRebootCmdRestart)
}

func main() {
	// Create our input and output channels.
	pending, complete := make(chan *Resource), make(chan *Resource)

	// Launch the StateMonitor.
	status := StateMonitor(statusInterval)

	// Launch some Poller goroutines.
	for i := 0; i < numPollers; i++ {
		go Poller(pending, complete, status)
	}

	for {
		log.Print("Checking for remote URL.")
		config, _ := GetEncoderConfig()
		remoteURL := config.Section("").Key("s3_osd0_txt").String()
		_, err := url.ParseRequestURI(remoteURL)
		if err == nil {
			break
		}
		time.Sleep(10 * time.Second)
	}

	config, _ := GetEncoderConfig()

	remoteURL := config.Section("").Key("s3_osd0_txt").String()

	// Send some Resources to the pending queue.
	go func() {
			pending <- &Resource{url: remoteURL}
	}()

	for r := range complete {
		go r.Sleep(pending)
	}
}
