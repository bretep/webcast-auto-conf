import React, {useEffect, useState} from "react";
import {LazyLog, ScrollFollow} from "react-lazylog";
import {wsURL} from "./uitl";

const Logs = () => {
    const [isConnected, setIsConnected] = useState(false)
    const [lazyLogState, setLazyLogState] = useState(Date.now())

    useEffect(() => {

        let interval = setInterval(() => {
            if (!isConnected) {
                setLazyLogState(Date.now())
            }
        }, 1000)
        return () => {
            clearInterval(interval)
            interval = null
        }
    }, [isConnected])

    const formatLogMessage = (e) => {
        const lines = e.split("\n")
        const logLines = lines.map((line) => {
                try {
                    line = JSON.parse(line)
                    const date = new Date(line.time).toLocaleString()
                    return `[${date}] ${line.msg}`
                } catch {
                    return ''
                }
            }
        ).filter((ll)=> !!ll).join('\n')

        return logLines
    }


    return (
        <ScrollFollow
            key={`lazy-log-${lazyLogState}`}
            startFollowing={true}
            render={({follow, onScroll}) => (
                <LazyLog
                    enableSearch
                    height={200}
                    url={wsURL}
                    follow={follow}
                    onScroll={onScroll}
                    selectableLines
                    websocket
                    websocketOptions={{
                        onOpen: () => {
                            setIsConnected(true)
                        },
                        onClose: () => {
                            setIsConnected(false)
                        },
                        formatMessage: e => formatLogMessage(e),
                    }}
                />
            )}
        />
    )
}
export default Logs