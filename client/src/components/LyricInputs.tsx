import { LyricPart, MadlibLineProps } from "@/app/page";
import React, { ChangeEvent } from "react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

/* checks if line contains brackets (input fields) */
const inputRegex = /\{.*?\}/g;

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
            className="my-2 inline h-12 w-48 rounded-lg border-2 border-jas-gray bg-jas-card text-3xl text-white ring-offset-jas-purple"
            onChange={(e) => {
                updateValue(
                    { verseIndex, inputIndex, numVerses, lyricIndex },
                    e,
                );
            }}
        />
    );
};

const LyricInputs = ({
    lyrics,
    stage,
    handleUpdate,
}: {
    lyrics: LyricPart[];
    stage: number;
    handleUpdate: (
        props: MadlibLineProps,
        e: ChangeEvent<HTMLInputElement>,
    ) => void;
}) => {
    return (
        <div className="flex h-full w-full grow space-y-8">
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
                        const inputAndStaticArray = staticLyrics.flatMap(
                            (component, index) =>
                                index < staticLyrics.length - 1
                                    ? [
                                          component,
                                          <InputComponent
                                              verseIndex={verseIndex}
                                              inputIndex={index}
                                              numVerses={lyrics.length}
                                              lyricIndex={lyricIndex}
                                              updateValue={handleUpdate}
                                              key={"" + index + lyricIndex}
                                          />,
                                      ]
                                    : [component],
                        );

                        // join the array
                        lyricsComponents =
                            lyricsComponents.concat(inputAndStaticArray);
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
                    <div
                        key={`lyric-part-${verseIndex}`}
                        className="flex-center w-full rounded-2xl border-8 border-jas-gray bg-jas-card transition duration-500 animate-in fade-in-50"
                    >
                        <div className="text-center">
                            {lyricsComponents.map((component, index) => (
                                <span
                                    key={index}
                                    className={cn(
                                        "text-4xl font-bold leading-loose text-white text-opacity-75",
                                        component.type == InputComponent &&
                                            "focus-visible:outline-jas-purple focus-visible:ring-jas-purple",
                                    )}
                                >
                                    {component}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default LyricInputs;
