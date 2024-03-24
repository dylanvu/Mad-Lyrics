"use client";
import { useRef, useState, useEffect } from "react";
import WaveForm from "../../components/ui/waveform";
import Waveform3D from "../../components/ui/waveform3d";
import Ballform3D from "../../components/ui/ballform";

export default function App() {
    const [analyzerData, setAnalyzerData] = useState(null);
    const [playing, setPlaying] = useState(false);
    const audioElmRef = useRef(null);

    useEffect(() => {
        // Set the audio URL to the predefined file in the public folder
        const audioUrl = "/1.mp3";
        if (audioElmRef.current) {
            audioElmRef.current.src = audioUrl;
        }
    }, []);

    // audioAnalyzer function analyzes the audio and sets the analyzerData state
    const audioAnalyzer = () => {
        if (playing) return;
        setPlaying(true);
        if (!audioElmRef.current) return;

        // Play the audio
        audioElmRef.current
            .play()
            .catch((error) => console.error("Error playing audio:", error));

        // Create a new AudioContext or use the existing one if it's already created
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();

        // Make sure the AudioContext is in running state
        if (audioCtx.state === "suspended") {
            audioCtx.resume().then(() => {
                console.log("Audio Context resumed!");
            });
        }

        const analyzer = audioCtx.createAnalyser();
        analyzer.fftSize = 2048;

        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const source = audioCtx.createMediaElementSource(audioElmRef.current);
        source.connect(analyzer);
        analyzer.connect(audioCtx.destination);
        source.onended = () => {
            source.disconnect();
            analyzer.disconnect();
            console.log("Audio and analyzer nodes disconnected on audio end");
        };

        // Set the analyzerData state with the analyzer, bufferLength, and dataArray
        setAnalyzerData({ analyzer, bufferLength, dataArray });
    };

    return (
        <div className="App">
            <h1>Audio Visualizer</h1>
            {analyzerData && <Waveform3D analyzerData={analyzerData} />}
            <div
                style={{
                    height: 80,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-around",
                }}
            >
                <button onClick={audioAnalyzer}>Start Visualization</button>
                <audio controls ref={audioElmRef} style={{ marginTop: 20 }} />
            </div>
        </div>
    );
}
