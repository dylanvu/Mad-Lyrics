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

const example = `
[
  {
    "part": "Verse",
    "lyrics": [
      "The stars at night, they shine so {adjective},",
      "Guiding me through the {noun} so {adjective}.",
      "My {noun} by my side, steady and {adjective},",
      "Through the silent streets, our spirits {verb}."
    ]
  },
  {
    "part": "Chorus",
    "lyrics": [
      "With every heartbeat, I feel {adjective},",
      "In a world where {noun} often {verb}.",
      "But in your {noun}, I find my {noun},",
      "And in your eyes, the {noun} I've always {verb}."
    ]
  },
  {
    "part": "Bridge",
    "lyrics": [
      "In the quiet of the {noun}, we {verb},",
      "To the music that makes our souls {verb},",
      "Hand in hand, we {verb} and {verb},",
      "In our {noun} world, where love never {verb}."
    ]
  },
  {
    "part": "Outro",
    "lyrics": [
      "So here's to our {noun}, our bond, and our {noun},",
      "In this journey, we're never {adjective}.",
      "From {noun} to {noun}, under the {noun}'s glow,",
      "Together, into the future we {verb}."
    ]
  }
]
`;

export interface MadlibLineProps {
    verseIndex: number;
    inputIndex: number;
    numVerses: number;
    lyricIndex: number;
}

export default function Home() {
    const [songData, setSongData] = useState<string>(example);
    const [feedback, setFeedback] = useState<"loading" | "done">("loading");

    // useEffect(() => {
    //     fetch("http://localhost:8000/lyricstemplate", {
    //         method: "GET",
    //     })
    //         .then(async (res) => {
    //             const resBody = await res.json();
    //             console.log(resBody.lyrics);
    //             setSongData(resBody.lyrics);
    //             setFeedback("done");
    //         })
    //         .catch((reason: any) => {
    //             console.error(reason);
    //             setFeedback("done");
    //         });
    // }, []);

    const lyrics = JSON.parse(songData) as LyricPart[];

    const ws = useContext(WebsocketContext);
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

    const [timer, setTimer] = useState(15);

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
                setTimer(15);
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
                                {lyrics[stage].part}&nbsp;
                            </span>
                            <span>{`(${stage + 1}/${lyrics.length})`}</span>
                        </div>

                        <div className="space-y-4 pt-8">
                            <h1
                                className="text-center text-8xl font-black text-jas-purple"
                                style={{
                                    WebkitTextStroke: "white",
                                    WebkitTextStrokeWidth: 5,
                                }}
                            >
                                {Math.max(0, timer)} seconds
                            </h1>
                            <p className="text-center text-4xl font-bold text-white text-opacity-75">
                                until next round
                            </p>
                        </div>

                        <div className="relative px-16 py-16">
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
