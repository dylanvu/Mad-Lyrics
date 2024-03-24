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
        <main className="flex-between h-screen min-h-screen bg-[url('/images/lobbyBackground.svg')] p-16">
            {/* <div className="main-div">lobby</div>

            <Button onClick={handleStart}>Start Game</Button>
            <p>{ws.ready ? "Connected!" : "Not connected )="}</p> */}

            <div className="flex-between h-full min-w-[500px] flex-col rounded-3xl bg-[#191B21] px-9 pb-9 pt-12 text-white">
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
                        <p className="text-2xl font-bold">3 players</p>
                    </div>

                    <div className="mb-auto space-y-4">
                        <div className="flex-between rounded-2xl border-4 border-jas-gray bg-jas-card p-4 py-1 text-white hover:border-jas-purple">
                            <img
                                src="./images/cat.svg"
                                alt="cat"
                                className="scale-90"
                            />
                            <p className="text-3xl font-bold">SuperEpicGamer</p>
                        </div>
                        <div className="flex-between rounded-2xl border-4 border-jas-gray bg-jas-card p-4 py-1 text-white hover:border-jas-purple">
                            <img
                                src="./images/bird.svg"
                                alt="cat"
                                className="scale-90"
                            />
                            <p className="text-3xl font-bold">SuperEpicGamer</p>
                        </div>
                        <div className="flex-between rounded-2xl border-4 border-jas-gray bg-jas-card p-4 py-1 text-white hover:border-jas-purple">
                            <img
                                src="./images/mouse.svg"
                                alt="cat"
                                className="scale-90"
                            />
                            <p className="text-3xl font-bold">SuperEpicGamer</p>
                        </div>

                        <p className="pt-2 text-center text-xl font-bold text-white text-opacity-75">
                            waiting for more players...
                        </p>
                    </div>
                </div>

                <Button
                    className="h-20 w-full rounded-2xl bg-jas-purple px-8 py-6 hover:bg-jas-purple/80"
                    onClick={handleStart}
                >
                    <p className="text-center text-3xl font-bold">Start game</p>
                </Button>
            </div>

            <div className="flex-center mb-auto w-full flex-col">
                <h1
                    className="text-center text-8xl font-black text-jas-purple"
                    style={{
                        WebkitTextStroke: "white",
                        WebkitTextStrokeWidth: 5,
                    }}
                >
                    MadLyrics
                </h1>

                <div className="flex-center flex-col space-y-2">
                    <h3 className="mt-12 text-5xl font-bold text-white">
                        Randomize your profile
                    </h3>

                    <img
                        src="./images/big_cat.svg"
                        alt="big cat"
                        className="scale-75"
                    />

                    <div className="flex space-x-4">
                        <div className="flex-between space-x-2 rounded-2xl border-4 border-jas-gray bg-jas-card p-4 text-white hover:border-jas-purple">
                            <div className="flex-center h-12 w-12 rounded-2xl bg-jas-gray">
                                <User fill="white" className="h-8 w-8" />
                            </div>
                            <p className="text-3xl font-bold">SuperCoolGamer</p>
                        </div>

                        <div className="flex-center h-[88px] w-[88px] rounded-2xl bg-jas-purple">
                            <Dices className="h-14 w-14" stroke="white" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
