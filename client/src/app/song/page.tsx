/* eslint-disable @next/next/no-img-element */
"use client";

import { WebsocketContext } from "@/components/socket";
import { Loader } from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import Visualizer from "../visualizer/page";
import { Progress } from "@/components/ui/progress";

const LoadingPage = () => {
    const [progress, setProgress] = useState(7);

    useEffect(() => {
        const interval = setInterval(
            () => {
                setProgress((prevProgress) =>
                    prevProgress >= 80
                        ? prevProgress
                        : prevProgress + Math.random() * 10,
                );
            },
            Math.random() * 1500 + 1000,
        );

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed left-0 top-0 z-50 flex min-h-screen w-full flex-col items-center justify-center bg-black px-32 pb-9 pt-12 text-white">
            <div className="flex-center w-full rounded-2xl bg-jas-card p-6 text-2xl font-bold text-white">
                <h6>Generating your next favorite tune...</h6>
            </div>
            <div className="flex-center flex-col pt-6">
                <img
                    src="./loading_cat.gif"
                    alt="loading cat"
                    className="h-56"
                />
                <div className="flex-center w-[700px] flex-col space-y-4 rounded-2xl bg-jas-card p-6 px-14 py-6 text-3xl font-bold text-white">
                    <p className="text-xl text-white text-opacity-50">
                        did you know...
                    </p>
                    <p className="text-center">
                        Sunt in aliquip aute duis officia minim ex ad officia
                        id.
                    </p>
                </div>
            </div>
            <Progress
                value={progress}
                className="my-8 h-8 w-[700px] transition duration-2000"
            />
            <div className="h-[300px] w-[700px] space-y-4 rounded-2xl border-4 border-jas-gray py-7">
                <h6 className="text-center text-3xl font-semibold">
                    # of Mad Lyrics
                </h6>

                <div className="flex-center space-x-8">
                    <div className="space-y-2">
                        <img
                            src="./images/cat.svg"
                            alt="cat"
                            className="w-36"
                        />
                        <p className="text-center text-2xl font-bold">
                            14 Words
                        </p>
                    </div>
                    <div className="space-y-2">
                        <img
                            src="./images/bird.svg"
                            alt="bird"
                            className="w-36"
                        />
                        <p className="text-center text-2xl font-bold">
                            11 Words
                        </p>
                    </div>
                    <div className="space-y-2">
                        <img
                            src="./images/mouse.svg"
                            alt="mouse"
                            className="w-36"
                        />
                        <p className="text-center text-2xl font-bold">
                            7 Words
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Page = () => {
    const ws = useContext(WebsocketContext);
    const [loading, setLoading] = useState(true);
    const audioElementRef = useRef(null);

    useEffect(() => {
        if (ws.phase === "song") {
            setLoading(false);
        }
    }, [ws.phase]);

    useEffect(() => {
        if (ws.mediaSource && audioElementRef.current) {
            const objectURL = URL.createObjectURL(ws.mediaSource);
            audioElementRef.current.src = objectURL;

            return () => {
                URL.revokeObjectURL(objectURL); // Clean up when the component unmounts or the source changes
            };
        }
    }, [ws.mediaSource, audioElementRef.current]);

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
                        
                        <Visualizer audioRef={audioElementRef} />
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
            {loading && <LoadingPage />}
        </div>
    );
};

export default Page;
