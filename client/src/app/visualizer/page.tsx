"use client";
import { useRef, useState, useEffect } from "react";
import WaveForm from "../../components/ui/waveform";
import Waveform3D from "../../components/ui/waveform3d";
import Ballform3D from "../../components/ui/ballform";
import { cn } from "@/lib/utils";
import { PlayCircle } from "lucide-react";

const Visualizer: React.FC<VisualizerProps> = ({ audioRef }) => {
    const [analyzerData, setAnalyzerData] = useState(null);
    const [playing, setPlaying] = useState(false);

    // audioAnalyzer function analyzes the audio and sets the analyzerData state
    const audioAnalyzer = () => {
        if (playing || !audioRef.current) return;
        setPlaying(true);

        // Play the audio
        audioRef.current
            .play()
            .catch((error) => console.error("Error playing audio:", error));

        const AudioContext = window.AudioContext || window.webkitAudioContext;
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
        source.onended = () => {
            setPlaying(false);
            source.disconnect();
            analyzer.disconnect();
            console.log("Audio and analyzer nodes disconnected on audio end");
        };

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

interface VisualizerProps {
    audioRef: React.RefObject<HTMLAudioElement>;
}

export default Visualizer;
