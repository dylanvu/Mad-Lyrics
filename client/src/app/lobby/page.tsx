/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useContext } from "react";

import { WebsocketContext } from "@/components/socket";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Dices, User } from "lucide-react";

export default function Lobby() {
    const ws = useContext(WebsocketContext);
    const router = useRouter();

    const handleStart = () => {
        // send start event to all clients
        const jsonString: string = JSON.stringify({
            event: "start",
        });
        ws.send(jsonString);
    };

    useEffect(() => {
        if (ws.phase === "input") {
            router.push("/"); // FIXME: When we swap URLs, make sure to update this too
        }
    }, [router, ws.phase]);

    return (
        <main className="flex-between min-h-screen h-screen p-16">
            {/* <div className="main-div">lobby</div>

            <Button onClick={handleStart}>Start Game</Button>
            <p>{ws.ready ? "Connected!" : "Not connected )="}</p> */}

            <div className="min-w-[500px] bg-[#191B21] text-white px-9 pt-12 pb-9 rounded-3xl h-full flex-between flex-col">
                <div className="w-full">
                    <div className="flex-between pb-8">
                        <h2
                            className="h-full text-4xl font-black text-jas-purple"
                            style={{
                                WebkitTextStroke: "white",
                                WebkitTextStrokeWidth: 2,
                            }}
                        >
                            Lobby
                        </h2>
                        <p className="font-bold text-2xl">3 players</p>
                    </div>

                    <div className="space-y-4 mb-auto">
                        <div className="bg-jas-card border-4 border-jas-gray hover:border-jas-purple text-white p-4 py-1 rounded-2xl flex-between">
                            <img
                                src="./images/cat.svg"
                                alt="cat"
                                className="scale-90"
                            />
                            <p className="font-bold text-3xl">SuperEpicGamer</p>
                        </div>
                        <div className="bg-jas-card border-4 border-jas-gray hover:border-jas-purple text-white p-4 py-1 rounded-2xl flex-between">
                            <img
                                src="./images/bird.svg"
                                alt="cat"
                                className="scale-90"
                            />
                            <p className="font-bold text-3xl">SuperEpicGamer</p>
                        </div>
                        <div className="bg-jas-card border-4 border-jas-gray hover:border-jas-purple text-white p-4 py-1 rounded-2xl flex-between">
                            <img
                                src="./images/mouse.svg"
                                alt="cat"
                                className="scale-90"
                            />
                            <p className="font-bold text-3xl">SuperEpicGamer</p>
                        </div>

                        <p className="text-white text-opacity-75 font-bold text-xl text-center pt-2">
                            waiting for more players...
                        </p>
                    </div>
                </div>

                <Button className="bg-jas-purple py-6 px-8 rounded-2xl w-full h-20 hover:bg-jas-purple/80">
                    <p className="font-bold text-3xl text-center">Start game</p>
                </Button>
            </div>

            <div className="flex-center w-full flex-col mb-auto">
                <h1
                    className="text-8xl font-black text-jas-purple text-center"
                    style={{
                        WebkitTextStroke: "white",
                        WebkitTextStrokeWidth: 5,
                    }}
                >
                    MadLyrics
                </h1>

                <div className="flex-center flex-col space-y-2">
                    <h3 className="font-bold text-5xl text-white mt-12">
                        Randomize your profile
                    </h3>

                    <img
                        src="./images/big_cat.svg"
                        alt="big cat"
                        className="scale-75"
                    />

                    <div className="flex space-x-4">
                        <div className="bg-jas-card border-4 border-jas-gray hover:border-jas-purple text-white p-4 rounded-2xl flex-between space-x-2">
                            <div className="w-12 h-12 flex-center rounded-2xl bg-jas-gray">
                                <User fill="white" className="w-8 h-8" />
                            </div>
                            <p className="font-bold text-3xl">SuperCoolGamer</p>
                        </div>

                        <div className="bg-jas-purple w-[88px] h-[88px] rounded-2xl flex-center">
                            <Dices className="w-14 h-14" stroke="white" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
