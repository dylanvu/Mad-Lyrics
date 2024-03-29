"use client";
import { useRef, useState, useEffect } from "react";
import WaveForm from "./waveform";
import Waveform3D from "./waveform3d";
import Ballform3D from "./ballform";
import { cn } from "@/lib/utils";
import { PlayCircle } from "lucide-react";

interface VisualizerProps {
    audioRef: React.RefObject<HTMLAudioElement>;
}

const Visualizer: React.FC<VisualizerProps> = ({ audioRef }) => {
    const [analyzerData, setAnalyzerData] = useState<{
        analyzer: AnalyserNode;
        bufferLength: number;
        dataArray: Uint8Array;
    } | null>(null);
    const [playing, setPlaying] = useState(false);

    // audioAnalyzer function analyzes the audio and sets the analyzerData state
    const audioAnalyzer = () => {
        if (playing || !audioRef.current) return;
        setPlaying(true);

        // Play the audio
        audioRef.current
            .play()
            .catch((error) => console.error("Error playing audio:", error));

        const AudioContext = window.AudioContext;
        const audioCtx = new AudioContext();

        if (audioCtx.state === "suspended") {
            audioCtx.resume().then(() => {
                console.log("Audio Context resumed!");
            });
        }

        const analyzer = audioCtx.createAnalyser();
        analyzer.fftSize = 2048;

        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const source = audioCtx.createMediaElementSource(audioRef.current);
        source.connect(analyzer);
        analyzer.connect(audioCtx.destination);
        setAnalyzerData({ analyzer, bufferLength, dataArray });
    };

    return (
        <div className="flex-center flex-col space-y-4">
            {analyzerData ? (
                <Waveform3D analyzerData={analyzerData} />
            ) : (
                <button
                    onClick={audioAnalyzer}
                    className="border-jas-stroke flex-center h-[500px] w-[600px] border"
                >
                    <PlayCircle className="h-20 w-20" />
                </button>
            )}
            <audio ref={audioRef} controls></audio>
        </div>
    );
};

export { Visualizer };
