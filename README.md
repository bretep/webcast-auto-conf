# Church of Jesus Christ of Latter-day Saints Webcast Autoconfig

## About
During these latter-days we have a requirement to webcast worship meetings.
To make this process easier I've created a firmware for devices that use the 
[J-Tech Digital H.264 IP Encoder](https://www.amazon.com/dp/B0761X6L3C/ref=cm_sw_em_r_mt_dp_3.LAFbFG2AWGG)
which takes advantage of the Remote Config URL that is provided by the [Meetinghouse Webcast](https://webcast.churchofjesuschrist.org/)
portal.   

## Contributions
Please feel free to improve on this firmware. I accept pull requests.

## Requirements
1. [J-Tech Digital H.264 IP Encoder](https://www.amazon.com/dp/B0761X6L3C/ref=cm_sw_em_r_mt_dp_3.LAFbFG2AWGG)
2. Stake Technology Specialist, Assistant Stake Technology Specialist, Stake Clerk, or Assistant Stake Clerk LCR Permissions
3. HDMI Feed from a computer or camera

## What is auto configured
1. RTMP URL and Stream
2. Video bitrate
3. Audio bitrate

## Will installing this firmware reset all my settings?
No, all settings are left untouched. The only time a setting is changed is if all of the following are true:
 - __Auto configuration__ is enalbed
 - A valid __Auto configuration URL__ is configured 
 - The __Auto configuration URL__ tells this firmware to change any of the above 3 settings. (changes are checked every 10 seconds)

## How to install
1. Configure the network settings as required for your meeting house using the instructions that
came with your device. 
2. Download the current github release or checkout this repository and create your own build.
3. Upload the `up.rar` file to the encoder. Note: this file MUST be named `up.rar` else the upgrade fails.
    1. In the H264 Encoder webpage navigate to System > Upgrade
    2. Select Choose File and click Upload
        1. When the upload is successful you must reboot the encoder to install the update.
    3. System > Reboot
4. Configure the encoder.
    1. Click on `Auto Configuration` menu item.
    2. Add the auto config URL        
            This URL is found in the [Meetinghouse Webcast](https://webcast.churchofjesuschrist.org/) portal
            under the `Teradek` menu located at the top of the page. If you have not registered your device, now
            is a good time to do so. __Serial Number will be set by the webcast encoder, no need to configure.__
       
    3. Click the `Enable` checkbox
    4. Click `Save Configuration` button
            
## How to use after firmware install
1. Schedule an event in the [Meetinghouse Webcast](https://webcast.churchofjesuschrist.org/) portal.
    1. Select the encoder you registered in __Select Your Encoder__
2. Your device will now auto configure when the [Meetinghouse Webcast](https://webcast.churchofjesuschrist.org/)
starts the event.

## Notes about running multiple meetings in the same meetinghouse using the same encoder
- You can only webcast 1 meeting at a time. The auto configuration system handles this well and will tell
your device what to do.
- Options to stop the webcast:
    1. Unplugging the encoder.
    2. Unplug the HDMI input or power off the HDMI device. __This option will display the church logo__
    
    ![Screenshot](https://raw.githubusercontent.com/bretep/webcast-auto-conf/master/assets/screenshot-nosig.png?sanitize=true&raw=true)

## Optional setup
- Some meetinghouses have an `recording output` from the meetinghouse sound system. I've found this output
in these locations:
    - Under the sacrament table. Find where the microphone is plugged in. You may have to get under the table
    and look around. I had to use a flashlight as it was well hidden in one of my buildings.
    - Podium
    - Wall
    
    The meetinghouse sound system is monophone and you should use a Female to Male RCA splitter to take the
    left channel and split it to the right. I had a lot of feedback about only having the left channel working. 
- I use a cheap $15 camera from Amazon. It is RCA based and has a builtin micropohone. The microphone does
 not work well. I use a  RCA to HDMI converter which costs $16.

## User Interface Images
### Webcast Button
![webcastButton](https://raw.githubusercontent.com/bretep/webcast-auto-conf/master/assets/screenshot-webcast-button.png?sanitize=true&raw=true)

### Configuration (webcast off)
![webcastOff](https://raw.githubusercontent.com/bretep/webcast-auto-conf/master/assets/screenshot-webcast-off.png?sanitize=true&raw=true)

### Configuration (webcast on)
![webcastOn](https://raw.githubusercontent.com/bretep/webcast-auto-conf/master/assets/screenshot-webcast-on.png?sanitize=true&raw=true)

### Configuration (encoder off-line or rebooting)
![offline](https://raw.githubusercontent.com/bretep/webcast-auto-conf/master/assets/screenshot-webcast-offline.png?sanitize=true&raw=true)
