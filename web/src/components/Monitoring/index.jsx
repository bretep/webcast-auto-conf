import React from 'react';
import Paper from "@material-ui/core/Paper";
import {useEncoder} from "../../context/EncoderContext/useEncoder";
import {Sparklines, SparklinesBars} from "react-sparklines";
import Typography from "@material-ui/core/Typography";
import {readableBytes} from "../../uitl";
import {Grid} from "@material-ui/core";
import useTheme from "@material-ui/core/styles/useTheme";

const Monitoring = () => {
    const {status, sys, ready} = useEncoder()
    const theme = useTheme()
    return (
        <>
        <Paper
        square
        elevation={0}
        style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: theme.palette.secondary.main,
            boxShadow: '0px -2px -4px -1px rgba(0,0,0,0.2), 0px -4px -5px 0px rgba(0,0,0,0.14), 0px -1px -10px 0px rgba(0,0,0,0.12)'
        }}
        >
            <Typography variant="body1" style={{
                display: 'block',
                marginLeft: 5,
                marginRight: 5,
                marginTop: 5,
            }}>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                    <Grid
                        item
                    >
                        Video Frames:
                    </Grid>
                    <Grid
                        item
                    >
                        {status.int_cnt} Received
                    </Grid>
                    <Grid
                        item
                    >
                        {status.lost_int - 2}  Dropped
                    </Grid>
                </Grid>
            </Typography>
            <Typography variant="body1" style={{
                display: 'block',
                marginLeft: 5,
                marginRight: 5,
            }}>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                    <Grid
                        item
                    >
                        Memory:
                    </Grid>
                    <Grid
                        item
                    >
                        {readableBytes(status.memorytotal - status.memoryfree)} Used
                    </Grid>
                    <Grid
                        item
                    >
                {readableBytes(status.memoryfree)} Free
                    </Grid>
                        <Grid
                            item
                        >
                {readableBytes(status.memorytotal)} Total
                        </Grid>
                </Grid>
            </Typography>
            <Typography variant="body1" style={{
                display: 'block',
                marginLeft: 5,
                marginRight: 5,
            }}>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                    <Grid
                        item
                    >
                        Packets:
                    </Grid>
                    <Grid
                        item
                    >
                        {status.net_packet_sent} Sent
                    </Grid>
                    <Grid
                        item
                    >
                        {status.net_packet_dropped} Dropped
                    </Grid>
                </Grid>
            </Typography>
            <Typography variant="body1" style={{
                display: 'block',
                marginLeft: 5,
                marginRight: 5
            }}>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="center"
                    spacing={2}
                >
                    <Grid
                        item
                    >
                        CPU:
                    </Grid>
                    <Grid
                        item
                    >
                        {status.cpuusage[59]}%
                    </Grid>
                    <Grid
                        item
                    >
                        <Sparklines
                            data={status.cpuusage}
                            svgHeight={15} svgWidth={300}
                            min={0}
                            max={100}
                        >
                            <SparklinesBars
                                barWidth={2}
                                points={60}
                            />
                        </Sparklines>
                    </Grid>

                </Grid>
            </Typography>
            <Typography variant="body1" gutterBottom style={{
                display: 'block',
                marginLeft: 5,
                marginRight: 5,
            }}>
                <Grid
                    container
                    direction="row"
                    justify={"space-evenly"}
                    alignItems="center"
                    spacing={2}
                >
                    <Grid
                        item
                    >
                        {sys.ip}
                    </Grid>
                    <Grid
                        item
                    >
                        {sys.mac}
                    </Grid>
                    <Grid
                        item
                    >
                        {ready && `Uptime: ${status.upTime}`}
                        {!ready && `Offline`}
                    </Grid>
                    <Grid
                        item
                    >
                        {process.env.REACT_APP_UI_VERSION}
                    </Grid>
                </Grid>
            </Typography>

        </Paper>
            </>
    )
}

export default Monitoring