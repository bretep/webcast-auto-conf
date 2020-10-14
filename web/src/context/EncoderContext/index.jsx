import React, {createContext, useCallback, useContext, useEffect, useReducer} from 'react';
import {formatDuration} from "date-fns";
import {encoderAPIURL, timeoutPromise, wsURL} from "../../uitl";
import useWebSocket, {ReadyState} from "react-use-websocket";

const EncoderContext = createContext(null);

const encoderReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_STATE':

            return {
                ...state,
                status: {...state.status, ...action.data.status},
                sys: {...state.sys, ...action.data.sys},
                stream0: {...state.stream0, ...action.data.stream0},
                osd30: {...state.osd30, ...action.data.osd30},
                osd31: {...state.osd31, ...action.data.osd31},
                ready: true
            };

        case 'NOT_READY':

            return {
                ...state,
                ready: false
            };

        default:
            return state;
    }
};

const useEncoderState = () => {
    return useReducer(encoderReducer, {
        status: {
            cpuusage: new Array(60).fill(0),
            memoryfree: 100000000,
            memorytotal: 100000000

        },
        sys: {},
        stream0: {},
        osd30: {},
        osd31: {},
    })
}

const useContextValue = () => {
    const [encoderState, encoderStateDispatch] = useEncoderState()

    useEffect(() => {
        const getStatus = async () => {
            return timeoutPromise(1500, fetch(`${encoderAPIURL}/get_status?_=${Date.now()}`)
                .then(res => res.text())
                .then(str => {
                    return (new window.DOMParser()).parseFromString(str, "text/xml")
                })
                .then(data => {
                    const status = data.querySelector('status')
                    const dhcp = data.querySelector('lan_dhcp')
                    return ((data && dhcp && status && {
                        version: status.querySelector('version') && status.querySelector('version').innerHTML.trim() || null,
                        runtime: status.querySelector('runtime') && status.querySelector('runtime').innerHTML.trim() || null,
                        cpuusage: status.querySelector('cpuusage') && status.querySelector('cpuusage').innerHTML.trim() || null,
                        memoryfree: status.querySelector('memoryfree') && status.querySelector('memoryfree').innerHTML.trim() || null,
                        memorytotal: status.querySelector('memorytotal') && status.querySelector('memorytotal').innerHTML.trim() || null,
                        int_cnt: status.querySelector('int_cnt') && status.querySelector('int_cnt').innerHTML.trim() || null,
                        lost_int: status.querySelector('lost_int') && status.querySelector('lost_int').innerHTML.trim() || null,
                        net_packet_sent: status.querySelector('net_packet_sent') && status.querySelector('net_packet_sent').innerHTML.trim() || null,
                        net_packet_dropped: status.querySelector('net_packet_dropped') && status.querySelector('net_packet_dropped').innerHTML.trim() || null,
                        dhcp_enable: dhcp.querySelector('enable') && dhcp.querySelector('enable').innerHTML.trim() || null,
                        dhcp_ip: dhcp.querySelector('ip') && dhcp.querySelector('ip').innerHTML.trim() || null,
                        dhcp_mask: dhcp.querySelector('mask') && dhcp.querySelector('mask').innerHTML.trim() || null,
                        dhcp_route: dhcp.querySelector('route') && dhcp.querySelector('route').innerHTML.trim() || null,
                    }) || {})
                }));
        }
        const getSystem = async () => {
            return timeoutPromise(1500, fetch(`${encoderAPIURL}/get_sys?_=${Date.now()}`)
                .then(res => res.text())
                .then(str => {
                    return (new window.DOMParser()).parseFromString(str, "text/xml")
                })
                .then(data => {
                    const system = data.querySelector('sys')
                    return ((data && system && {
                        http_port: system.querySelector('http_port') && system.querySelector('http_port').innerHTML.trim(),
                        rtsp_port: system.querySelector('rtsp_port') && system.querySelector('rtsp_port').innerHTML.trim() || null,
                        rtsp_g711: system.querySelector('rtsp_g711') && system.querySelector('rtsp_g711').innerHTML.trim() || null,
                        rtsp_g711_8k: system.querySelector('rtsp_g711_8k') && system.querySelector('rtsp_g711_8k').innerHTML.trim() || null,
                        rtsp_g711_mu: system.querySelector('rtsp_g711_mu') && system.querySelector('rtsp_g711_mu').innerHTML.trim() || null,
                        audio_left_right: system.querySelector('audio_left_right') && system.querySelector('audio_left_right').innerHTML.trim() || null,
                        pte_g711: system.querySelector('pte_g711') && system.querySelector('pte_g711').innerHTML.trim() || null,
                        ts_over_rtsp: system.querySelector('ts_over_rtsp') && system.querySelector('ts_over_rtsp').innerHTML.trim() || null,
                        rtp_multicast: system.querySelector('rtp_multicast') && system.querySelector('rtp_multicast').innerHTML.trim() || null,
                        udp_ttl: system.querySelector('udp_ttl') && system.querySelector('udp_ttl').innerHTML.trim() || null,
                        udp_sock_buf_size: system.querySelector('udp_sock_buf_size') && system.querySelector('udp_sock_buf_size').innerHTML.trim() || null,
                        ip: system.querySelector('ip') && system.querySelector('ip').innerHTML.trim() || null,
                        netmask: system.querySelector('netmask') && system.querySelector('netmask').innerHTML.trim() || null,
                        gateway: system.querySelector('gateway') && system.querySelector('gateway').innerHTML.trim() || null,
                        dns0: system.querySelector('dns0') && system.querySelector('dns0').innerHTML.trim() || null,
                        dns1: system.querySelector('dns1') && system.querySelector('dns1').innerHTML.trim() || null,
                        dhcp_enable: system.querySelector('dhcp_enable') && system.querySelector('dhcp_enable').innerHTML.trim() || null,
                        mac: system.querySelector('mac') && system.querySelector('mac').innerHTML.trim() || null,
                        hostname: system.querySelector('hostname') && system.querySelector('hostname').innerHTML.trim() || null,
                    }) || {})
                }));
        }
        const getStream0 = async () => {
            return timeoutPromise(1500, fetch(`${encoderAPIURL}/get_output?input=0&output=0&_=${Date.now()}`)
                .then(res => res.text())
                .then(str => {
                    return (new window.DOMParser()).parseFromString(str, "text/xml")
                })
                .then(data => {
                    const output = data.querySelector('output')
                    return ((data && output && {
                        input: output.querySelector('input') && output.querySelector('input').innerHTML.trim() || null,
                        output: output.querySelector('output') && output.querySelector('output').innerHTML.trim() || null,
                        aenc_codec: output.querySelector('aenc_codec') && output.querySelector('aenc_codec').innerHTML.trim() || null,
                        aenc_bitrate: output.querySelector('aenc_bitrate') && output.querySelector('aenc_bitrate').innerHTML.trim() || null,
                        venc_enable: output.querySelector('venc_enable') && output.querySelector('venc_enable').innerHTML.trim() || null,
                        venc_codec: output.querySelector('venc_codec') && output.querySelector('venc_codec').innerHTML.trim() || null,
                        venc_codec_supported: output.querySelector('venc_codec_supported') && output.querySelector('venc_codec_supported').innerHTML.trim() || null,
                        venc_gop: output.querySelector('venc_gop') && output.querySelector('venc_gop').innerHTML.trim() || null,
                        vi_cap_width: output.querySelector('vi_cap_width') && output.querySelector('vi_cap_width').innerHTML.trim() || null,
                        vi_cap_height: output.querySelector('vi_cap_height') && output.querySelector('vi_cap_height').innerHTML.trim() || null,
                        venc_width_height_same_as_input: output.querySelector('venc_width_height_same_as_input') && output.querySelector('venc_width_height_same_as_input').innerHTML.trim() || null,
                        venc_width: output.querySelector('venc_width') && output.querySelector('venc_width').innerHTML.trim() || null,
                        venc_height: output.querySelector('venc_height') && output.querySelector('venc_height').innerHTML.trim() || null,
                        venc_framerate: output.querySelector('venc_framerate') && output.querySelector('venc_framerate').innerHTML.trim() || null,
                        venc_profile: output.querySelector('venc_profile') && output.querySelector('venc_profile').innerHTML.trim() || null,
                        venc_rc_mode: output.querySelector('venc_rc_mode') && output.querySelector('venc_rc_mode').innerHTML.trim() || null,
                        venc_bitrate: output.querySelector('venc_bitrate') && output.querySelector('venc_bitrate').innerHTML.trim() || null,
                        ts_muxrate: output.querySelector('ts_muxrate') && output.querySelector('ts_muxrate').innerHTML.trim() || null,
                        http_private_enable: output.querySelector('http_private_enable') && output.querySelector('http_private_enable').innerHTML.trim() || null,
                        http_private_uri: output.querySelector('http_private_uri') && output.querySelector('http_private_uri').innerHTML.trim() || null,
                        http_ts_enable: output.querySelector('http_ts_enable') && output.querySelector('http_ts_enable').innerHTML.trim() || null,
                        http_ts_uri: output.querySelector('http_ts_uri') && output.querySelector('http_ts_uri').innerHTML.trim() || null,
                        http_jpg_enable: output.querySelector('http_jpg_enable') && output.querySelector('http_jpg_enable').innerHTML.trim() || null,
                        http_jpg_uri: output.querySelector('http_jpg_uri') && output.querySelector('http_jpg_uri').innerHTML.trim() || null,
                        http_mjpg_enable: output.querySelector('http_mjpg_enable') && output.querySelector('http_mjpg_enable').innerHTML.trim() || null,
                        http_mjpg_uri: output.querySelector('http_mjpg_uri') && output.querySelector('http_mjpg_uri').innerHTML.trim() || null,
                        http_hls_enable: output.querySelector('http_hls_enable') && output.querySelector('http_hls_enable').innerHTML.trim() || null,
                        http_hls_uri: output.querySelector('http_hls_uri') && output.querySelector('http_hls_uri').innerHTML.trim() || null,
                        http_flv_enable: output.querySelector('http_flv_enable') && output.querySelector('http_flv_enable').innerHTML.trim() || null,
                        http_flv_uri: output.querySelector('http_flv_uri') && output.querySelector('http_flv_uri').innerHTML.trim() || null,
                        rtsp_enable: output.querySelector('rtsp_enable') && output.querySelector('rtsp_enable').innerHTML.trim() || null,
                        rtsp_uri: output.querySelector('rtsp_uri') && output.querySelector('rtsp_uri').innerHTML.trim() || null,
                        rtmp_enable: output.querySelector('rtmp_enable') && output.querySelector('rtmp_enable').innerHTML.trim() || null,
                        rtmp_publish_enable: output.querySelector('rtmp_publish_enable') && output.querySelector('rtmp_publish_enable').innerHTML.trim() || null,
                        rtmp_publish_uri: output.querySelector('rtmp_publish_uri') && output.querySelector('rtmp_publish_uri').innerHTML.trim() || null,
                        multicast_enable: output.querySelector('multicast_enable') && output.querySelector('multicast_enable').innerHTML.trim() || null,
                        multicast_ip: output.querySelector('multicast_ip') && output.querySelector('multicast_ip').innerHTML.trim() || null,
                        multicast_port: output.querySelector('multicast_port') && output.querySelector('multicast_port').innerHTML.trim() || null,
                        unicast_enable: output.querySelector('unicast_enable') && output.querySelector('unicast_enable').innerHTML.trim() || null,
                        unicast_ip: output.querySelector('unicast_ip') && output.querySelector('unicast_ip').innerHTML.trim() || null,
                        unicast_port: output.querySelector('unicast_port') && output.querySelector('unicast_port').innerHTML.trim() || null,
                    }) || {})
                }));
        }
        const getOSD30 = async () => {
            return timeoutPromise(1500, fetch(`${encoderAPIURL}/get_osd?enc_chn=3&osd_chn=0&_=${Date.now()}`)
                .then(res => res.text())
                .then(str => {
                    return (new window.DOMParser()).parseFromString(str, "text/xml")
                })
                .then(data => {
                    const osd = data.querySelector('osd')
                    return ((data && osd && {
                        enable: osd.querySelector('enable') && osd.querySelector('enable').innerHTML.trim() || null,
                        type: osd.querySelector('type') && osd.querySelector('type').innerHTML.trim() || null,
                        x: osd.querySelector('x') && osd.querySelector('x').innerHTML.trim() || null,
                        y: osd.querySelector('y') && osd.querySelector('y').innerHTML.trim() || null,
                        alpha: osd.querySelector('alpha') && osd.querySelector('alpha').innerHTML.trim() || null,
                        font_size: osd.querySelector('font_size') && osd.querySelector('font_size').innerHTML.trim() || null,
                        color: osd.querySelector('color') && osd.querySelector('color').innerHTML.trim() || null,
                        bcolor: osd.querySelector('bcolor') && osd.querySelector('bcolor').innerHTML.trim() || null,
                        txt: osd.querySelector('txt') && osd.querySelector('txt').innerHTML.trim() || null,
                        bmp: osd.querySelector('bmp') && osd.querySelector('bmp').innerHTML.trim() || null,
                    }) || {})
                }));
        }
        const getOSD31 = async () => {
            return timeoutPromise(1500, fetch(`${encoderAPIURL}/get_osd?enc_chn=3&osd_chn=1&_=${Date.now()}`)
                .then(res => res.text())
                .then(str => {
                    return (new window.DOMParser()).parseFromString(str, "text/xml")
                })
                .then(data => {
                    const osd = data.querySelector('osd')
                    return ((data && osd && {
                        enable: osd.querySelector('enable') && osd.querySelector('enable').innerHTML.trim() || null,
                        type: osd.querySelector('type') && osd.querySelector('type').innerHTML.trim() || null,
                        x: osd.querySelector('x') && osd.querySelector('x').innerHTML.trim() || null,
                        y: osd.querySelector('y') && osd.querySelector('y').innerHTML.trim() || null,
                        alpha: osd.querySelector('alpha') && osd.querySelector('alpha').innerHTML.trim() || null,
                        font_size: osd.querySelector('font_size') && osd.querySelector('font_size').innerHTML.trim() || null,
                        color: osd.querySelector('color') && osd.querySelector('color').innerHTML.trim() || null,
                        bcolor: osd.querySelector('bcolor') && osd.querySelector('bcolor').innerHTML.trim() || null,
                        txt: osd.querySelector('txt') && osd.querySelector('txt').innerHTML.trim() || null,
                        bmp: osd.querySelector('bmp') && osd.querySelector('bmp').innerHTML.trim() || null,
                    }) || {})
                }));
        }

        const updateState = async () => {
            const status = await getStatus().catch(() => {
                encoderStateDispatch({
                    type: 'NOT_READY'
                })
            })
            const sys = await getSystem().catch(() => {
            })
            const stream0 = await getStream0().catch(() => {
            })
            const osd30 = await getOSD30().catch(() => {
            })
            const osd31 = await getOSD31().catch(() => {
            })

            if (status && sys && stream0 && osd30 && osd31) {
                let upTime = ''
                if (status && status.runtime) {
                    const [yearMonthDay, hourMinutesSeconds] = status.runtime.split(' ')
                    const [years = 0, months = 0, days = 0] = yearMonthDay.split('-')
                    const [hours = 0, minutes = 0, seconds = 0] = hourMinutesSeconds.split(':')
                    upTime = formatDuration({
                        years: parseInt(years, 10),
                        months: parseInt(months, 10),
                        days: parseInt(days, 10),
                        hours: parseInt(hours, 10),
                        minutes: parseInt(minutes, 10),
                        seconds: parseInt(seconds, 10)
                    })
                }
                let cpuusage = encoderState.status.cpuusage || []
                if (cpuusage.length === 60) {
                    cpuusage.shift()
                }

                const currentUsage = parseInt(status.cpuusage, 10) || 0
                cpuusage.push(currentUsage)

                const memoryfree = parseInt(status.memoryfree, 10) * 1000 || 0
                const memorytotal = parseInt(status.memorytotal, 10) * 1000 || 0

                encoderStateDispatch({
                    type: 'UPDATE_STATE',
                    data: {
                        status: {...status, upTime, cpuusage, memoryfree, memorytotal},
                        sys: {...sys},
                        stream0: {...stream0},
                        osd30: {...osd30},
                        osd31: {...osd31},
                    }
                })
            }
        }
        updateState()


        let interval = setInterval(async () => {
            await updateState()
        }, 1000);
        return () => {
            clearInterval(interval)
            interval = null
        };


    }, []);

    // In functional React component
    const getSocketUrl = useCallback(() => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(wsURL);
            }, 2000);
        });
    }, []);


    const {sendJsonMessage, readyState} = useWebSocket(getSocketUrl, {
        shouldReconnect: (closeEvent) => {
            return true
        },
        reconnectAttempts: 99999,
        reconnectInterval: 1000,
    });

    const reboot = () => {

        if (readyState === ReadyState.OPEN) {
            sendJsonMessage({reboot: true})
        } else {
            fetch(`${encoderAPIURL}/reboot?_=${Date.now()}`)
        }
    }
    return {
        encoderState,
        reboot
    }
}

export const EncoderProvider = ({children}) => {
    const value = useContextValue()
    return <EncoderContext.Provider value={value}>{children}</EncoderContext.Provider>
}

export const useEncoderContext = () => {
    return useContext(EncoderContext)
}