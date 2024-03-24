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

type validPhases = "lobby" | "input" | "waiting" | "song" | "lobby_wait";
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
    mediaSource: MediaSource | null;
    sourceBuffer: SourceBuffer | null;
    finishedSongData: { title: string; lyrics: string };
    players: string[];
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
    mediaSource: null,
    sourceBuffer: null,
    finishedSongData: {
        title: "",
        lyrics: "",
    },
    players: [],
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
    const [finishedSongData, setFinishedSongData] = useState({
        title: "",
        lyrics: "",
    });
    const [players, setPlayers] = useState<string[]>([]);

    const ws = useRef<WebSocket | null>(null);

    const [mediaSource, setMediaSource] = useState<MediaSource | null>(null);
    const sourceBuffer = useRef<SourceBuffer | null>(null);
    const [audioDataQueue, setAudioDataQueue] = useState([]);

    useEffect(() => {
        const ms = new MediaSource();
        setMediaSource(ms);

        ms.addEventListener("sourceopen", () => {
            try {
                const mimeType = "audio/mpeg";
                const sb = ms.addSourceBuffer(mimeType);
                sourceBuffer.current = sb;
                console.log("SourceBuffer created:", sb);

                // Once the SourceBuffer is ready, process any queued audio data
                audioDataQueue.forEach((data) => {
                    console.log("Processing queued audio data");
                    sb.appendBuffer(data);
                });
                // Clear the queue
                setAudioDataQueue([]);

                // Listen for when the SourceBuffer is ready for more data
                sb.addEventListener("updateend", () => {
                    if (audioDataQueue.length > 0) {
                        console.log("Processing queued audio data");
                        const nextData = audioDataQueue.shift();
                        sb.appendBuffer(nextData);
                        setAudioDataQueue(audioDataQueue.slice(1)); // Update the queue state
                    }
                });
            } catch (e) {
                console.error("Error creating SourceBuffer:", e);
            }
        });
    }, []);

    useEffect(() => {
        const id = v4();
        setClientId(id);
        const socket = new WebSocket(`ws://localhost:8000/ws?client_id=${id}`);
        console.log(id);

        socket.onopen = () => {
            console.log("Connected");
            setIsReady(true);
        };
        socket.onclose = () => setIsReady(false);
        // socket.onmessage = (event) => setVal(event.data);
        socket.onmessage = (event) => {
            const eventObject = JSON.parse(event.data);
            if (eventObject.event === "audio") {
                console.log("audio event");
                const audioArrayBuffer = base64ToArrayBuffer(
                    eventObject.audio_data,
                );
                console.log(sourceBuffer.current);
                if (sourceBuffer.current && !sourceBuffer.current.updating) {
                    sourceBuffer.current.appendBuffer(audioArrayBuffer);
                } else {
                    // Queue the data if the SourceBuffer isn't ready
                    console.log("Queueing audio data");
                    setAudioDataQueue([...audioDataQueue, audioArrayBuffer]);
                }
                setFinishedSongData({
                    title: eventObject.title,
                    lyrics: eventObject.lyrics,
                });
            } else if (eventObject.event === "phase_change") {
                setPhase(eventObject.data);
            } else if (eventObject.event === "lyrics") {
                setSongData(eventObject.lyrics);
            } else if (eventObject.event === "connection") {
                setPlayers(eventObject.players);
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
        mediaSource: mediaSource,
        sourceBuffer: sourceBuffer.current,
        finishedSongData: finishedSongData,
        players: players,
    };

    return (
        <WebsocketContext.Provider value={ret}>
            {children}
        </WebsocketContext.Provider>
    );
};
