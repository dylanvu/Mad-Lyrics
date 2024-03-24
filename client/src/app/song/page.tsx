/* eslint-disable @next/next/no-img-element */
"use client";

import { WebsocketContext } from "@/components/socket";
import { Loader } from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import Visualizer from "../visualizer/page";

const Page = () => {
    const ws = useContext(WebsocketContext);

    const isPlaying = useRef(false);
    const audioContext = useRef();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        playNextAudio();
    }, [ws.audioQueueRef.current, ws.data]);

    useEffect(() => {
        audioContext.current = new (window.AudioContext ||
            window.webkitAudioContext)();
    }, []);

    const playNextAudio = () => {
        console.log("called function");
        console.log("len check", ws.audioQueueRef.current.length > 0);
        console.log("playing check", !isPlaying.current);

        if (ws.audioQueueRef.current.length > 0 && !isPlaying.current) {
            console.log("playing");
            isPlaying.current = true;
            const audioBlob = ws.audioQueueRef.current.shift(); // Get the next audio blob from the queue
            const reader = new FileReader();
            reader.onload = function () {
                const arrayBuffer = this.result;
                console.log(arrayBuffer);
                audioContext.current.decodeAudioData(arrayBuffer, (buffer) => {
                    const source = audioContext.current.createBufferSource();
                    source.buffer = buffer;
                    source.connect(audioContext.current.destination);
                    source.onended = () => {
                        isPlaying.current = false; // Reset the flag when audio ends
                        playNextAudio(); // Try to play the next audio
                    };
                    source.start(0);
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
                        {/* <Visualizer /> */}
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
                            qui exercitation et.test
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
