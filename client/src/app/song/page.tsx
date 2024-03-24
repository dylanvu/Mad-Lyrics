"use client";

import { WebsocketContext } from "@/components/socket";
import { Loader } from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";

const Base64AudioPlayer = ({ base64String }: { base64String: string }) => {
    const dataUrl = `data:audio/mp3;base64,${base64String}`;

    return (
        <div>
            <audio controls autoPlay={true}>
                <source src={dataUrl} type="audio/mp3" />
                Your browser does not support the audio element.
            </audio>
        </div>
    );
};

const Page = () => {
    const ws = useContext(WebsocketContext);

    const isPlaying = useRef(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const audioContext = useRef();

    const [audioChunk, setAudioChunk] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (ws.valueQueue.length) {
            setAudioChunk(ws.valueQueue[0]);
            setLoading(false);
        }
    }, [ws.valueQueue]);

    useEffect(() => {
        playNextAudio();
    }, [ws.audioQueueRef.current]);

    useEffect(() => {
        audioContext.current = new (window.AudioContext ||
            window.webkitAudioContext)();
    }, []);

    const playNextAudio = () => {
        // Function to play a chunk immediately
        const playChunk = (buffer) => {
            const source = audioContext.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.current.destination);
            source.start(audioContext.current.currentTime);
            return source;
        };

        // Function to schedule a chunk to play after the current one
        const scheduleChunk = (buffer, time) => {
            const source = audioContext.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.current.destination);
            source.start(time);
            return source;
        };

        // Start playing the next chunk or schedule it if something is already playing
        if (ws.audioQueueRef.current.length > 0) {
            const audioBlob = ws.audioQueueRef.current.shift();
            const reader = new FileReader();

            reader.onload = function () {
                const arrayBuffer = this.result;
                audioContext.current.decodeAudioData(arrayBuffer, (buffer) => {
                    let source;
                    if (!isPlaying.current) {
                        // If nothing is playing, play immediately
                        source = playChunk(buffer);
                        isPlaying.current = true;
                    } else {
                        // If something is playing, schedule to play after the last chunk
                        const lastEndTime =
                            audioChunksRef.current.length > 0
                                ? audioChunksRef.current[
                                      audioChunksRef.current.length - 1
                                  ].endTime
                                : audioContext.current.currentTime;
                        source = scheduleChunk(buffer, lastEndTime);
                    }

                    // Update the end time for the current chunk
                    const endTime =
                        audioContext.current.currentTime + buffer.duration;
                    audioChunksRef.current.push({ source, endTime });

                    source.onended = () => {
                        // Remove the chunk that just ended from the reference
                        audioChunksRef.current.shift();
                        if (audioChunksRef.current.length === 0) {
                            isPlaying.current = false;
                        }
                        // Try to play the next audio if available
                        playNextAudio();
                    };
                });
            };

            reader.readAsArrayBuffer(audioBlob);
        }
    };

    return (
        <div>
            {/* {loading ||
            audioChunk === undefined ||
            audioChunk === null ||
            audioChunk.length === 0 ? (
                <Loader className="h-20 w-20 animate-spin transition duration-3000" />
            ) : (
                // <Base64AudioPlayer base64String={audioChunk} />
            )} */}

            {/* <button
                onClick={() => {
                    const jsonString: string = JSON.stringify({
                        event: "sample_song",
                    });
                    ws.send(jsonString);
                }}
            >
                TEST
            </button> */}
        </div>
    );
};

export default Page;
