/* eslint-disable @next/next/no-img-element */
"use client";

import {
    useState,
    useEffect,
    ChangeEvent,
    useCallback,
    useContext,
} from "react";

import { Progress } from "@/components/ui/progress";

import { Loader, Star } from "lucide-react";
import { WebsocketContext } from "@/components/socket";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import LyricInputs from "@/components/LyricInputs";

export interface LyricPart {
    part: string;
    lyrics: string[];
}

export interface MadlibLineProps {
    verseIndex: number;
    inputIndex: number;
    numVerses: number;
    lyricIndex: number;
}

export default function Home() {
    const ws = useContext(WebsocketContext);
    const [feedback, setFeedback] = useState<"loading" | "done">("loading");

    useEffect(() => {
        if (ws.songData.length > 0) {
            setFeedback("done");
        }
    }, [ws.songData]);

    const lyrics = JSON.parse(ws.songData) as LyricPart[];

    const router = useRouter();

    /* checks if line contains brackets (input fields) */
    const inputRegex = /\{.*?\}/g;

    /* Initializes a 2d array representing the state of the inputs */
    let inputMap: string[][] = [];
    for (const part of lyrics) {
        for (const lyric of part.lyrics) {
            const matches = lyric.match(inputRegex)?.length ?? 0;
            inputMap.push(Array(matches).fill(""));
        }
    }

    const [inputs, setInputs] = useState<string[][]>(inputMap);
    const [stage, setStage] = useState(0);
    const [isFilled, setIsFilled] = useState(false);
    const secPerRound = 15;
    const [timer, setTimer] = useState(secPerRound);

    const handleInputChange = (
        props: MadlibLineProps,
        e: ChangeEvent<HTMLInputElement>,
    ) => {
        const { verseIndex, inputIndex, numVerses, lyricIndex } = props;

        setInputs((prevInputs) => {
            const newInputs = [...prevInputs];

            newInputs[verseIndex * numVerses + lyricIndex][inputIndex] =
                e.target.value;

            return newInputs;
        });
    };

    const checkIsFilled = useCallback(() => {
        if (stage >= lyrics.length) {
            return true;
        }

        let prevLines = 0;
        for (let i = 0; i < stage; i++) {
            prevLines += lyrics[i].lyrics.length;
        }

        for (
            let i = prevLines;
            i < prevLines + lyrics[stage].lyrics.length;
            i++
        ) {
            if (inputs[i].includes("")) return false;
        }

        return true;
    }, [inputs, lyrics, stage]);

    useEffect(() => {
        setIsFilled(checkIsFilled());
    }, [checkIsFilled, inputs]);

    useEffect(() => {
        const decreaseTimer = () => {
            if (timer <= -1) {
                setTimer(secPerRound);
                setStage((prevStage) => prevStage + 1);
            } else {
                setTimer((prevTimer) => {
                    return prevTimer - 1;
                });
            }
        };

        const intervalId = setInterval(decreaseTimer, 1000);

        return () => clearInterval(intervalId);
    }, [timer]);

    useEffect(() => {
        if (stage >= lyrics.length) {
            const jsonString: string = JSON.stringify({
                event: "finished",
                id: ws.id,
                libs: inputs,
            });
            ws.send(jsonString);
        }
    }, [inputs, lyrics.length, router, stage, ws]);

    useEffect(() => {
        if (stage >= lyrics.length) {
            router.push("/song");
        }
    }, [lyrics.length, router, stage]);

    return (
        <main className="flex min-h-screen flex-col px-32 pb-9 pt-12">
            {false && feedback === "loading" ? (
                <div className="flex-center my-auto flex-col space-y-4 text-white">
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
                    <div>
                        <div className="flex-center w-full rounded-2xl bg-jas-card p-6 text-4xl font-bold text-white">
                            <h6>Enter song lyrics for the&nbsp;</h6>
                            <span className="text-jas-purple">
                                {lyrics[stage]?.part}&nbsp;
                            </span>
                            <span>{`(${stage + 1}/${lyrics.length})`}</span>
                        </div>

                        <div className="space-y-4 pt-8">
                            <h1
                                className={cn(
                                    "text-center text-7xl font-extrabold text-jas-purple",
                                    timer <= 5 && "text-red-500",
                                )}
                                style={{
                                    WebkitTextStroke: "white",
                                    WebkitTextStrokeWidth: 4,
                                }}
                            >
                                {Math.max(0, timer)} seconds
                            </h1>
                            <p className="text-center text-4xl font-bold text-white text-opacity-75">
                                until next round
                            </p>
                        </div>

                        <div className="relative px-16 py-8">
                            <Progress
                                value={stage * 33}
                                className="h-8 transition duration-2000"
                            />
                            <div className="absolute w-[calc(100vw-24rem)] translate-y-[-75%]">
                                <div className="flex justify-between">
                                    <Star
                                        className={cn(
                                            "h-20 w-20 stroke-white stroke-[1.5]",
                                            stage >= 0 && "fill-[#FF9CEF]",
                                        )}
                                    />
                                    <Star
                                        className={cn(
                                            "h-20 w-20 stroke-white",
                                            stage >= 1 && "fill-[#FF9CEF]",
                                        )}
                                    />
                                    <Star
                                        className={cn(
                                            "h-20 w-20 stroke-white",
                                            stage >= 2 && "fill-[#FF9CEF]",
                                        )}
                                    />
                                    <Star
                                        className={cn(
                                            "h-20 w-20 stroke-white",
                                            stage >= 3 && "fill-[#FF9CEF]",
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <LyricInputs
                        lyrics={lyrics}
                        stage={stage}
                        handleUpdate={handleInputChange}
                    />
                </>
            )}
        </main>
    );
}
