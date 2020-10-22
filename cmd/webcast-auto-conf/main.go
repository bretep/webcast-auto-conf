package main

import (
	"bufio"
	"bytes"
	"crypto/tls"
	"encoding/xml"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"runtime"
	"strconv"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
	"github.com/natefinch/lumberjack"
	"github.com/papertrail/go-tail/follower"
	"github.com/sirupsen/logrus"
	"gopkg.in/ini.v1"
)

const (
	numPollers                    = 1                // number of Poller goroutines to launch
	pollInterval                  = 10 * time.Second // how often to poll each URL
	statusInterval                = 10 * time.Second // how often to log status to stdout
	LinuxRebootMagic1     uintptr = 0xfee1dead
	LinuxRebootMagic2     uintptr = 672274793
	LinuxRebootCmdRestart uintptr = 0x1234567
	writeWait                     = 10 * time.Second
	pongWait                      = 60 * time.Second
	pingPeriod                    = (pongWait * 9) / 10
	maxMessageSize                = 1100000
)

var (
	enableReboot    = false
	configLocation  = "sample_box_ini"
	logFileLocation = "auto_config.log"
	upgrader        = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	urls = []string{
		"https://webcast.churchofjesuschrist.org/encoder/2180",
	}
	newline = []byte{'\n'}
	space   = []byte{' '}
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

type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
}

func (c *Client) reader() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		var command Command
		err := c.conn.ReadJSON(&command)
		if err == nil {
			if command.Reboot {
				reboot()
			}
		} else {
			_, message, err := c.conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Printf("error: %v", err)
				}
				break
			}
			message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
			c.hub.broadcast <- message
		}
	}
}

func (c *Client) writer() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	logfile    string
}

func newHub(logFile string) *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
		logfile:    logFile,
	}
}
type Command struct {
	Reboot bool `json:"reboot"`
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			sendLogs(client, h.logfile)
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

// State represents the last-known state of a URL.
type State struct {
	statusUrl string
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
	statusUrl string
	url      string
	errCount int
}

func (r *Resource) GetStats() string {
	config, _ := GetEncoderConfig()

	statusURL := config.Section("").Key("s3_osd1_txt").String()
	statusEnabled := config.Section("").Key("s3_osd1_enable").String()
	if statusEnabled != "1" {
		return "200"
	}
	if statusURL != r.statusUrl {
		reboot()
	}

	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
	resp, err := http.Get("http://admin:admin@127.0.0.1/get_status")
	if err != nil {
		log.Println("Error", r.url, err)
		logrus.Error(err.Error())
		r.errCount++
		return err.Error()
	}
	defer resp.Body.Close()
	logrus.Info("Fetched local status.")

	contentType := resp.Header.Get("Content-Type")

	uploadResp, err := http.Post(r.statusUrl,contentType, resp.Body)
	if err != nil {
		log.Println("Error", r.url, err)
		logrus.Error(err.Error())
		r.errCount++
		return err.Error()
	}
	defer uploadResp.Body.Close()
	logrus.Info("Posted status upstream.")

	r.errCount = 0
	return uploadResp.Status
}

// Poll executes an HTTP HEAD request for url
// and returns the HTTP status string or an error string.
func (r *Resource) Poll() string {

	config, _ := GetEncoderConfig()

	remoteURL := config.Section("").Key("s3_osd0_txt").String()
	remoteEnabled := config.Section("").Key("s3_osd0_enable").String()
	if remoteURL != r.url && remoteEnabled == "1" {
		reboot()
	}

	if remoteEnabled == "0" {
		logrus.Info("Auto configuration not enabled.")
		return ""
	}

	logrus.Info("Checking remote configuration...")
	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
	resp, err := http.Get(r.url)
	if err != nil {
		log.Println("Error", r.url, err)
		logrus.Error(err.Error())
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
	time.Sleep(pollInterval)
	done <- r
}

func Poller(in <-chan *Resource, out chan<- *Resource, status chan<- State) {
	for r := range in {
		s := r.Poll()
		status <- State{r.statusUrl, r.url, s}
		out <- r
		r.GetStats()
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
			logrus.Info("Enabling RTMP publish...")
			config.Section("").Key("s0_rtmp_publish_enable").SetValue("1")
			configChanges = true
		}

		if localRTMP != remoteRTMP {
			log.Println("Config does not match: Updating RTMP URI")
			logrus.Infof("Updating RTMP publish URL to: %s", remoteRTMP)
			config.Section("").Key("s0_rtmp_publish_uri").SetValue(remoteRTMP)
			configChanges = true
		}

		if localVideoBitrateKilobits != remoteVideoBitrateKilobits {
			log.Println("Config does not match: Updating Video Bitrate")
			logrus.Infof("Updating Video Bitrate to: %s", strconv.Itoa(remoteVideoBitrateKilobits))
			config.Section("").Key("s0_venc_bitrate").SetValue(strconv.Itoa(remoteVideoBitrateKilobits))
			configChanges = true
		}

		if localAudioBitrateKilobits != remoteAudioBitrateBits {
			log.Println("Config does not match: Updating Audio Bitrate")
			logrus.Infof("Updating Audio Bitrate to: %s", strconv.Itoa(remoteAudioBitrateBits))
			config.Section("").Key("aenc_bitrate").SetValue(strconv.Itoa(remoteAudioBitrateBits))
			configChanges = true
		}

	} else {
		RTMPEnabled := config.Section("").Key("s0_rtmp_publish_enable").String()
		if RTMPEnabled != "0" {
			log.Println("Config does not match: Disabling RTMP Publish")
			logrus.Info("Disabling RTMP publish... Remote is not ready to receive stream.")
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
	logrus.Info("Rebooting device...")
	time.Sleep(5 * time.Second)
	syscall.Syscall(syscall.SYS_REBOOT,
		LinuxRebootMagic1,
		LinuxRebootMagic2,
		LinuxRebootCmdRestart)
}

func sendLogs(client *Client, logFile string) (logs []byte) {
	file, err := os.Open(logFile)
	if err != nil {
		return nil
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		client.send <- scanner.Bytes()
	}
	return logs
}

func tailLog(hub *Hub) {

	t, _ := follower.New(hub.logfile, follower.Config{
		Whence: io.SeekEnd,
		Offset: 0,
		Reopen: true,
	})

	for line := range t.Lines() {
		hub.broadcast <- line.Bytes()
	}

	if t.Err() != nil {
		logrus.Error(t.Err())
	}
}

func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256)}
	client.hub.register <- client

	go client.writer()
	go client.reader()
}

func startWs(hub *Hub, ) {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})
	err := http.ListenAndServe(":8088", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func main() {
	// Setup logging
	if runtime.GOOS == "linux" {
		logFileLocation = "/box/auto_config.log"
	}
	lumberjackLogrotate := &lumberjack.Logger{
		Filename:   logFileLocation,
		MaxSize:    1,  // Max megabytes before log is rotated
		MaxBackups: 0,  // Max number of old log files to keep
		MaxAge:     90, // Max number of days to retain log files
		Compress:   false,
	}

	logrus.SetFormatter(&logrus.JSONFormatter{})
	logMultiWriter := io.MultiWriter(os.Stdout, lumberjackLogrotate)
	logrus.SetOutput(logMultiWriter)
	logrus.WithFields(logrus.Fields{
		"version": runtime.Version(),
		"cpus":    runtime.NumCPU(),
		"arch":    runtime.GOARCH,
	}).Info("Application Initializing")
	hub := newHub(logFileLocation)
	go hub.run()
	go startWs(hub)

	go tailLog(hub)

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
		logrus.Info("Waiting for valid remote configuration URL to be configured...")
		config, _ := GetEncoderConfig()
		remoteURL := config.Section("").Key("s3_osd0_txt").String()
		_, err := url.ParseRequestURI(remoteURL)
		if err == nil {
			break
		}
		time.Sleep(10 * time.Second)
	}

	statusURL := ""
	config, _ := GetEncoderConfig()
	if config.Section("").Key("s3_osd0_txt").String() == "1" {
		for {
			log.Print("Checking for remote URL.")
			logrus.Info("Waiting for valid status URL to be configured...")
			config, _ := GetEncoderConfig()
			statusURL := config.Section("").Key("s3_osd1_txt").String()
			_, err := url.ParseRequestURI(statusURL)
			if err == nil {
				break
			}
			time.Sleep(10 * time.Second)
		}
	} else {
		statusURL = config.Section("").Key("s3_osd1_txt").String()
	}

	logrus.Info("Found configured remote configuration URL!")

	remoteURL := config.Section("").Key("s3_osd0_txt").String()
	statusURL = config.Section("").Key("s3_osd1_txt").String()

	// Send some Resources to the pending queue.
	go func() {
		pending <- &Resource{statusUrl: statusURL, url: remoteURL}
	}()

	for r := range complete {
		go r.Sleep(pending)
	}
}
