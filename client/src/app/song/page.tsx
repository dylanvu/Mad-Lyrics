/* eslint-disable @next/next/no-img-element */
"use client";

import { WebsocketContext } from "@/components/socket";
import { Loader } from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import Visualizer from "../visualizer/page";

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
        <div className="flex max-h-screen min-h-screen flex-row gap-20 px-32 pb-9 pt-12 text-white">
            <div className="max-h-full min-h-[calc(100vh-80px)] w-[50%] grow">
                <h1 className="text-center text-5xl font-bold">
                    Your Mad Lyrics
                </h1>

                <div className="flex-between mt-8 min-h-[calc(100vh-164px)] grow flex-col rounded-2xl border-4 border-jas-gray bg-jas-card px-14 py-8">
                    {/* <img
                        src="https://media.swncdn.com/via/images/2023/08/11/32042/32042-seraphim_source_file.jpg"
                        alt="visualizer placeholder"
                        className="h-[400px] w-full rounded-2xl object-cover"
                    /> */}

                    <div className="flex-center h-[500px] w-[600px] rounded-xl pt-16">
                        <Visualizer />
                    </div>

                    <h6 className="py-4 text-center text-6xl font-bold">
                        the roblox song
                    </h6>

                    {/* <div className="mb-8 mt-auto">
                        <Base64AudioPlayer base64String={audioChunk} />
                    </div> */}
                </div>
            </div>

            <div className="w-[50%] rounded-2xl bg-jas-card p-16">
                <div className="h-full space-y-10 overflow-auto">
                    <h2
                        className="text-left text-4xl font-extrabold text-jas-purple"
                        style={{
                            WebkitTextStroke: "white",
                            WebkitTextStrokeWidth: 2,
                        }}
                    >
                        Lyrics &nbsp;🎶
                    </h2>

                    <div className="flex flex-col space-y-8 text-2xl font-medium">
                        <p>
                            Cupidatat adipisicing voluptate minim aliquip
                            aliquip velit nulla qui officia reprehenderit
                            voluptate. Et ut occaecat ea elit dolore veniam
                            dolor.
                        </p>
                        <p>
                            Cupidatat adipisicing voluptate minim aliquip
                            aliquip velit nulla qui officia reprehenderit
                            voluptate.
                        </p>
                        <p>
                            Cupidatat adipisicing voluptate minim aliquip
                            aliquip velit nulla qui officia reprehenderit
                            voluptate. Et ut occaecat ea elit dolore veniam
                            dolor. Ut ipsum aliquip cupidatat Lorem dolor mollit
                            qui exercitation et.
                        </p>
                        <p>
                            Cupidatat adipisicing voluptate minim aliquip
                            aliquip velit nulla qui officia reprehenderit
                            voluptate. Et ut occaecat ea elit dolore veniam
                            dolor. Ut ipsum aliquip cupidatat Lorem dolor mollit
                            qui exercitation et.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
