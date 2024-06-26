/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useContext, useState } from "react";

import { WebsocketContext } from "@/components/socket";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Check, Dices, User, Loader, X } from "lucide-react";

function uuidToNumber(uuid: string) {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
        hash += uuid.charCodeAt(i);
    }
    return hash;
}

export default function Lobby() {
    const ws = useContext(WebsocketContext);
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const handleStart = () => {
        // send start event to all clients
        const jsonString: string = JSON.stringify({
            event: "start",
        });
        ws.send(jsonString);
    };

    useEffect(() => {
        if (ws.phase === "input") {
            router.push("/game"); // FIXME: When we swap URLs, make sure to update this too
        } else if (ws.phase === "lobby_wait") {
            setLoading(true);
        }
    }, [router, ws.phase]);

    function handleGenreChange(newVal: string) {
        // send to backend to update
        ws.send(
            JSON.stringify({
                event: "genre",
                genre: newVal,
                id: ws.id,
            }),
        );
    }

    function handleEmotionChange(newVal: string) {
        // send to backend to update
        ws.send(
            JSON.stringify({
                event: "emotion",
                emotion: newVal,
                id: ws.id,
            }),
        );
    }

    function handleTopicChange(newVal: string) {
        // send to backend to update
        ws.send(
            JSON.stringify({
                event: "topic",
                topic: newVal,
                id: ws.id,
            }),
        );
    }

    return (
        <main className="flex-between h-screen min-h-screen bg-[url('/images/lobbyBackground.svg')] p-16">
            {/* <div className="main-div">lobby</div>
            <Button onClick={handleStart}>Start Game</Button>
            <p>{ws.ready ? "Connected!" : "Not connected )="}</p> */}
            {loading ? (
                <div className="flex-center mx-auto my-auto flex-col space-y-4 text-white">
                    <Loader className="h-24 w-24 animate-spin transition duration-3000" />
                    <span className="text-3xl font-semibold">
                        Generating your{" "}
                        <span className="font-bold text-jas-purple">
                            Mad Lyrics!
                        </span>{" "}
                        Hang tight 😼
                    </span>
                </div>
            ) : (
                <>
                    <div className="column">
                        <div className="flex-between h-full w-[36vw] flex-col rounded-3xl bg-[#191B21] px-9 pb-9 pt-12 text-white">
                            {/* lobby tag */}
                            <div className="w-full">
                                <div className="flex-between pb-8">
                                    <h2
                                        className="flex h-full items-center space-x-2 text-4xl font-black text-jas-purple"
                                        style={{
                                            WebkitTextStroke: "white",
                                            WebkitTextStrokeWidth: 1.5,
                                        }}
                                    >
                                        <p>Lobby</p>
                                        {ws.ready ? (
                                            <Check className="h-8 w-8 text-green-500" />
                                        ) : (
                                            <X className="h-8 w-8 text-red-500" />
                                        )}
                                    </h2>
                                    <p className="text-2xl font-bold">
                                        {ws.players.length} players
                                    </p>
                                </div>

                                <div className="mb-auto space-y-4">
                                    {ws.players.map((player) => (
                                        <div
                                            className="flex-between rounded-2xl border-4 border-jas-gray bg-jas-card p-4 py-1 text-white hover:border-jas-purple"
                                            key={player}
                                        >
                                            <img
                                                src={
                                                    uuidToNumber(player) % 3 ==
                                                    0
                                                        ? "./images/cat.svg"
                                                        : uuidToNumber(player) %
                                                                3 ==
                                                            1
                                                          ? "./images/bird.svg"
                                                          : "./images/mouse.svg"
                                                }
                                                alt="cat"
                                                className="scale-90"
                                            />
                                            <p className="text-3xl font-bold">
                                                {player}
                                            </p>
                                        </div>
                                    ))}

                                    <p className="pt-2 text-center text-xl font-bold text-white text-opacity-75">
                                        waiting for more players...
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="profile-contain">
                            <div className="heading">
                                <h2>Customize profile</h2>
                                <div className="flex-center hover:bg-[# h-[48px] w-[48px] rounded-2xl bg-jas-purple hover:cursor-pointer">
                                    <Dices
                                        className="h-[30px] w-[30px] p-[2px]"
                                        stroke="white"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <img
                                    src="./images/cat.svg"
                                    alt="cat"
                                    style={{ height: "40px" }}
                                />
                                <p
                                    className="text-3xl font-bold"
                                    style={{ color: "#fff", fontSize: "22px" }}
                                >
                                    SuperEpicGamer
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-center mb-auto w-full flex-col">
                        <h1
                            className="text-center text-6xl font-black text-jas-purple"
                            style={{
                                WebkitTextStroke: "white",
                                WebkitTextStrokeWidth: 3,
                                marginBottom: "28px",
                            }}
                        >
                            MadLyrics
                        </h1>

                        <div className="flex-center flex-col space-y-2">
                            <div className="filters-contain">
                                <div className="heading">
                                    <h2>Set music filters</h2>
                                    <div className="flex-center hover:bg-[# h-[48px] w-[48px] rounded-2xl bg-jas-purple hover:cursor-pointer">
                                        <Dices
                                            className="h-[30px] w-[30px] p-[2px]"
                                            stroke="white"
                                        />
                                    </div>
                                </div>
                                {/* genre and emotion */}
                                <div className="row">
                                    <form action="/submit-genre" method="post">
                                        <label htmlFor="music-genre">
                                            Genre
                                        </label>{" "}
                                        <input
                                            type="text"
                                            id="music-genre"
                                            name="music-genre"
                                            placeholder="edm"
                                            onChange={(e) =>
                                                handleGenreChange(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </form>
                                    <form
                                        action="/submit-emotion"
                                        method="post"
                                    >
                                        <label htmlFor="music-genre">
                                            Emotion
                                        </label>{" "}
                                        <input
                                            type="text"
                                            id="music-emotion"
                                            name="music-emotion"
                                            placeholder="exciting"
                                            onChange={(e) =>
                                                handleEmotionChange(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </form>
                                </div>
                                <form action="/submit-topic" method="post">
                                    <label htmlFor="music-topic">Topic</label>{" "}
                                    <input
                                        type="text"
                                        id="music-topic"
                                        name="music-topic"
                                        placeholder="funny bunnies"
                                        onChange={(e) =>
                                            handleTopicChange(e.target.value)
                                        }
                                    />
                                </form>
                                <Button
                                    className="h-20 w-full rounded-2xl bg-jas-purple px-8 py-6 hover:bg-jas-purple/80"
                                    onClick={handleStart}
                                >
                                    <p className="text-center text-3xl font-bold">
                                        Start game
                                    </p>
                                </Button>
                            </div>

                            {/* <img
                        src="./images/big_cat.svg"
                        alt="big cat"
                        className="scale-75"
                    /> */}

                            <div className="flex space-x-4">
                                {/* <div className="flex-between space-x-2 rounded-2xl border-4 border-jas-gray bg-jas-card p-4 text-white hover:border-jas-purple">
                            <div className="flex-center h-12 w-12 rounded-2xl bg-jas-gray">
                                <User fill="white" className="h-8 w-8" />
                            </div>
                            <p className="text-3xl font-bold">SuperCoolGamer</p>
                        </div>

                        <div className="flex-center h-[88px] w-[88px] rounded-2xl bg-jas-purple">
                            <Dices className="h-14 w-14" stroke="white" />
                        </div> */}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}
