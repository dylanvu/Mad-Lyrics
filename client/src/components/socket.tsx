"use client";
import {
    createContext,
    useEffect,
    useState,
    useRef,
    Dispatch,
    SetStateAction,
} from "react";

import { v4 } from "uuid";

type validPhases = "lobby" | "input" | "waiting" | "song";
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
    phase: validPhases;
    id: string;
    songData: string;
    audioQueueRef: any;
}

const startingPhase = "lobby";

export const WebsocketContext = createContext<ISocketContext>({
    ready: false,
    valueQueue: [],
    send: () => {},
    setQueue: () => {},
    phase: startingPhase,
    id: "",
    songData: "",
    audioQueueRef: [],
});

export const WebsocketProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [isReady, setIsReady] = useState(false);
    const [valQueue, setValQueue] = useState<string[]>([]);
    const [client_id, setClientId] = useState("");
    const [currentPhase, setPhase] = useState<validPhases>(startingPhase);
    const [songData, setSongData] = useState("");
    const audioQueueRef = useRef<any>([]);

    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const id = v4();
        setClientId(id);
        const socket = new WebSocket(`ws://localhost:8000/ws?client_id=${id}`);
        console.log(id);

        socket.onopen = () => setIsReady(true);
        socket.onclose = () => setIsReady(false);
        // socket.onmessage = (event) => setVal(event.data);
        socket.onmessage = (event) => {
            const eventObject = JSON.parse(event.data);
            if (eventObject.event === "audio") {
                console.log("audio received");
                // if this is audio data, add it to the audio queue
                // Emit a custom event with the audio data that the AudioPlayer can listen to
                const audioArrayBuffer = base64ToArrayBuffer(
                    eventObject.audio_data
                );
                const audioBlob = new Blob([audioArrayBuffer], {
                    type: "audio/mp3",
                });
                audioQueueRef.current.push(audioBlob);
            } else if (eventObject.event === "phase_change") {
                setPhase(eventObject.data);
            } else if (eventObject.event === "lyrics") {
                setSongData(eventObject.lyrics);
            }
        };

        ws.current = socket;

        return () => {
            socket.close();
        };
    }, []);

    function base64ToArrayBuffer(base64: string) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    const ret: ISocketContext = {
        ready: isReady,
        valueQueue: valQueue,
        send: ws.current
            ? ws.current!.send.bind(ws.current)
            : () => {
                  console.error("cannot send because not connected");
                  return;
              },
        // send: ws.current
        //     ? () => {
        //           console.log("success:", ws.current);
        //       }
        //     : () => {
        //           console.error("cannot send because not connected");
        //           return;
        //       },
        setQueue: setValQueue,
        phase: currentPhase,
        id: client_id,
        songData: songData,
        audioQueueRef: audioQueueRef,
    };

    return (
        <WebsocketContext.Provider value={ret}>
            {children}
        </WebsocketContext.Provider>
    );
};
