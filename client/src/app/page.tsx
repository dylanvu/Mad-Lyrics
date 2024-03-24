"use client";

import {
    useState,
    useEffect,
    ChangeEvent,
    useCallback,
    useContext,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { WebsocketContext } from "@/components/socket";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface LyricPart {
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

interface MadlibLineProps {
    verseIndex: number;
    inputIndex: number;
    numVerses: number;
    lyricIndex: number;
}

interface MadlibInputProps extends MadlibLineProps {
    updateValue: (
        props: MadlibLineProps,
        e: ChangeEvent<HTMLInputElement>,
    ) => void;
}

const InputComponent = (props: MadlibInputProps) => {
    const { verseIndex, inputIndex, numVerses, lyricIndex, updateValue } =
        props;

    return (
        <Input
            className="inline w-30 my-2 mx-1 h-9"
            onChange={(e) => {
                updateValue(
                    { verseIndex, inputIndex, numVerses, lyricIndex },
                    e,
                );
            }}
        />
    );
};

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

    // useEffect(() => {
    //     const decreaseTimer = () => {
    //         if (timer <= -1) {
    //             setTimer(15);
    //             setStage((prevStage) => prevStage + 1);
    //         } else {
    //             setTimer((prevTimer) => {
    //                 return prevTimer - 1;
    //             });
    //         }
    //     };

    //     const intervalId = setInterval(decreaseTimer, 100);

    //     return () => clearInterval(intervalId);
    // }, [timer]);

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
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            {true && feedback === "loading" ? (
                <div className="flex-center my-auto flex-col space-y-4 text-white">
                    <Loader className="animate-spin w-24 h-24 transition duration-3000" />
                    <span className="text-3xl font-semibold">
                        Generating your{" "}
                        <span className="text-jas-purple font-bold">
                            Mad Lyrics!
                        </span>{" "}
                        Hang tight 😼
                    </span>
                </div>
            ) : (
                <>
                    <div className="main-div space-y-8">
                        {lyrics.map((verse, verseIndex) => {
                            let lyricsComponents: JSX.Element[] = [];

                            // plan: split each string up by the inputRegex, and then insert a component between each
                            verse.lyrics.forEach((lyric, lyricIndex) => {
                                if (lyric.match(inputRegex)) {
                                    // split and generate static components
                                    const staticLyrics = lyric
                                        .split(inputRegex)
                                        .map((staticLyric) => {
                                            // TODO: replace with static lyric
                                            return (
                                                <span
                                                    key={
                                                        "" +
                                                        verseIndex +
                                                        lyricIndex +
                                                        staticLyric
                                                    }
                                                >
                                                    {staticLyric}
                                                </span>
                                            );
                                        });

                                    // Use flatMap to insert the separator component between each element
                                    const inputAndStaticArray =
                                        staticLyrics.flatMap(
                                            (component, index) =>
                                                index < staticLyrics.length - 1
                                                    ? [
                                                          component,
                                                          <InputComponent
                                                              verseIndex={
                                                                  verseIndex
                                                              }
                                                              inputIndex={index}
                                                              numVerses={
                                                                  lyrics.length
                                                              }
                                                              lyricIndex={
                                                                  lyricIndex
                                                              }
                                                              updateValue={
                                                                  handleInputChange
                                                              }
                                                              key={
                                                                  "" +
                                                                  index +
                                                                  lyricIndex
                                                              }
                                                          />,
                                                      ]
                                                    : [component],
                                        );

                                    // join the array
                                    lyricsComponents =
                                        lyricsComponents.concat(
                                            inputAndStaticArray,
                                        );
                                } else {
                                    // return just the text
                                    // TODO: replace with static lyric
                                    lyricsComponents.push(<span>{lyric}</span>);
                                }

                                // now push a break for fomatting
                                lyricsComponents.push(<br />);
                            });

                            /* If we're currently not on the verse, don't render */
                            if (verseIndex != stage) {
                                return null;
                            }

                            // now, render the whole lyric part
                            return (
                                <div key={`lyric-part-${verseIndex}`}>
                                    <div>
                                        <h6 className="text-2xl font-bold">
                                            {verse.part}
                                        </h6>
                                        {lyricsComponents.map(
                                            (component, index) => (
                                                <span key={index}>
                                                    {component}
                                                </span>
                                            ),
                                        )}
                                    </div>

                                    <div className="flex-center mx-auto pt-24">
                                        <p
                                            className={cn(
                                                "text-3xl",
                                                timer <= 5 && "text-[#FF0000]",
                                            )}
                                        >
                                            {Math.max(timer, 0)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </main>
    );
}
