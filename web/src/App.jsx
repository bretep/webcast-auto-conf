import React, {useEffect, useState} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import {Toolbar, Paper, Grid} from "@material-ui/core";
import {useEncoder} from "./context/EncoderContext/useEncoder";
import Button from "@material-ui/core/Button";
import Monitoring from "./components/Monitoring";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import {buildQueryString, encoderAPIURL, reboot} from "./uitl";
import LinearProgress from "@material-ui/core/LinearProgress";
import LiveTvIcon from '@material-ui/icons/LiveTv';
import useTheme from "@material-ui/core/styles/useTheme";

export default function App() {
    const {stream0, osd3, ready} = useEncoder()
    const theme = useTheme()
    const toolbarIcon = `${process.env.PUBLIC_URL}/lightbar-drk-blue.png`
    const [formData, setFormData] = useState({
        remoteConfigUrl: '',
        autoEnabled: false
    })
    const [savingData, setSavingData] = useState(false)
    const handleChange = (prop) => (event) => {
        setFormData((prevState => ({...prevState, [prop]: event.target.value})));
    };

    const handleToggleChange = (prop) => (event) => {
        setFormData((prevState => ({...prevState, [prop]: !prevState.autoEnabled})));
    };

    useEffect(() => {
        if (osd3) {
            setFormData((prevState => ({...prevState, autoEnabled: osd3.enable === "1"})));
        }
    }, [osd3.enable])

    useEffect(() => {
        if (osd3) {
            setFormData((prevState => ({...prevState, remoteConfigUrl: osd3.txt})));
        }
    }, [osd3.txt])

    useEffect(() => {
        if (ready && savingData) {
            setSavingData(false)
        }
    }, [ready])

    const saveConfiguration = () => {
        setSavingData(true)
        const data = {
            enc_chn: '3',
            osd_chn: '0',
            txt: formData.remoteConfigUrl,
            type: '1',
            enable: formData.autoEnabled ? '1' : '0',
            _: `${Date.now()}`
        }

        fetch(`${encoderAPIURL}/set_osd?${buildQueryString(data)}`)
            .then(async res => {
                const result = await res.text()
                if (result === 'succeed') {
                    reboot()
                } else {
                    setSavingData(false)
                }
            })
    }

    return (
        <>
            <div style={{flexGrow: 1,}}>
                <AppBar style={{height: 45}}>
                    <Toolbar variant="dense" style={{alignItems: 'flex-start',}}>
                        <box style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                        }}>
                            <img src={toolbarIcon}/>
                        </box>
                        <Typography variant="body1" gutterBottom style={{
                            paddingLeft: 20,
                            marginTop: 10,
                            flexGrow: 1,
                        }}>
                            Webcast Auto Configuration
                        </Typography>
                        <Button color="inherit" style={{
                            right: 0,
                            marginTop: 5,
                            width: 115
                        }}
                                onClick={() => window.location.href = '/'}
                        >
                            Main Config
                        </Button>
                    </Toolbar>
                </AppBar>
                {(savingData || !ready) && <LinearProgress style={{
                    top: 45,
                    position: "fixed",
                    width: "100%"
                }}/>}
            </div>
            <Container style={{
                marginTop: 50,
                // padding: 15
            }}>
                <Paper
                    elevation={0}
                    square
                >
                    <Grid
                        container
                        direction="column"
                        justify="flex-start"
                        alignItems="flex-start"
                        spacing={2}
                    >
                        <Grid
                            item
                        >
                            <box >
                            <LiveTvIcon style={{
                                fontSize: 100,
                                color: stream0.rtmp_publish_enable === "1" ? 'green' : theme.palette.primary.main
                            }}/>
                            <Typography variant="h6" gutterBottom>
                            Webcast {(stream0 && stream0.rtmp_publish_enable === "1") ? 'On' : 'Off'}
                            </Typography>
                            </box>
                        </Grid>
                        <Grid
                            item
                        >
                            <FormControl fullWidth variant="filled">
                                {(stream0 && stream0.rtmp_publish_uri) &&
                                    <TextField
                                        id="outlined-multiline-static"
                                        label="Configured RTMP"
                                        helperText="Displays the configured RTMP stream. This will update only when remote configuration is enabled and the remote config is ready to receive a RTMP stream."
                                        multiline
                                        rows={3}
                                        value={stream0.rtmp_publish_uri}
                                        variant="outlined"
                                        inputProps={{
                                            disabled: true
                                        }}
                                        style={{
                                            paddingBottom: 16
                                        }}
                                    />}
                                <TextField
                                    id="outlined-helperText"
                                    label="Remote Configuration URL"
                                    helperText="Teredek > Registered Devices >  Remote Config URL at https://webcast.churchofjesuschrist.org/"
                                    variant="outlined"
                                    multiline
                                    rows={2}
                                    value={formData.remoteConfigUrl}
                                    onChange={handleChange('remoteConfigUrl')}
                                />
                                <FormControlLabel
                                    control={<Checkbox
                                        checked={formData.autoEnabled}
                                        onChange={handleToggleChange('autoEnabled')}
                                        name="autoEnabled"
                                        color="primary"
                                    />}
                                    label="Auto configuration enabled"
                                />
                            </FormControl>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={saveConfiguration}
                                disabled={savingData}
                            >
                                {!savingData && <>Save Configuration</>}
                                {savingData && <>
                                    Saving Configuration...
                                </>}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
                <Monitoring/>
            </Container>
            <div style={{height: 600}}/>
        </>
    );
}
