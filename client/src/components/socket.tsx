"use client";
import { createContext, useEffect, useState, useRef } from "react";

interface ISocketContext {
    /**
     * if the socket is connected
     */
    ready: boolean;
    /**
     * what you are receiving
     */
    value: any;
    /**
     * function to send data to the server
     * @param data
     * @returns
     */
    send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
}

export const WebsocketContext = createContext<ISocketContext>({
    ready: false,
    value: null,
    send: () => {},
});

export const WebsocketProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [isReady, setIsReady] = useState(false);
    const [val, setVal] = useState(null);

    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket("wss://localhost:8000/");

        socket.onopen = () => setIsReady(true);
        socket.onclose = () => setIsReady(false);
        socket.onmessage = (event) => setVal(event.data);

        ws.current = socket;

        return () => {
            socket.close();
        };
    }, []);

    const ret: ISocketContext = {
        ready: isReady,
        value: val,
        // send: ws.current ? ws.current!.send.bind(ws.current) : () => {},
        send: ws.current
            ? () => {
                  console.log(ws.current);
              }
            : () => {
                  console.log(ws.current);
                  return;
              },
    };

    return (
        <WebsocketContext.Provider value={ret}>
            {children}
        </WebsocketContext.Provider>
    );
};
