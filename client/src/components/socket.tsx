"use client";
import {
    createContext,
    useEffect,
    useState,
    useRef,
    Dispatch,
    SetStateAction,
} from "react";

interface ISocketContext {
    /**
     * if the socket is connected
     */
    ready: boolean;
    /**
     * what you are receiving
     */
    valueQueue: string[];
    /**
     * function to send data to the server
     * @param data
     * @returns
     */
    send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
    setQueue: Dispatch<SetStateAction<string[]>>;
}

export const WebsocketContext = createContext<ISocketContext>({
    ready: false,
    valueQueue: [],
    send: () => {},
    setQueue: () => {},
});

export const WebsocketProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [isReady, setIsReady] = useState(false);
    const [valQueue, setValQueue] = useState<string[]>([]);

    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket("wss://localhost:8000/");

        socket.onopen = () => setIsReady(true);
        socket.onclose = () => setIsReady(false);
        // socket.onmessage = (event) => setVal(event.data);
        socket.onmessage = (event) =>
            // TODO: figure out what we sent
            // if this is audio data, add it to the audio queue
            setValQueue((prevValQueue) => [...prevValQueue, event.data]);

        ws.current = socket;

        return () => {
            socket.close();
        };
    }, []);

    const ret: ISocketContext = {
        ready: isReady,
        valueQueue: valQueue,
        // send: ws.current ? ws.current!.send.bind(ws.current) : () => {},
        send: ws.current
            ? () => {
                  console.log(ws.current);
              }
            : () => {
                  console.log(ws.current);
                  return;
              },
        setQueue: setValQueue,
    };

    return (
        <WebsocketContext.Provider value={ret}>
            {children}
        </WebsocketContext.Provider>
    );
};
