import { useRef, useEffect } from "react";

// Function to animate the circular waveform
function animateCircularWaveform(analyser, canvas, canvasCtx, dataArray) {
    // Clear the canvas for the next frame
    canvasCtx.fillStyle = "#0f1012"; // Background color (darker)
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Resize dataArray to first 60% (adjust as needed)
    dataArray = dataArray.slice(0, Math.floor(dataArray.length * 0.6));

    // Center and radius for the circular visualization
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 4; // Adjust the base radius here

    // Get frequency data
    analyser.getByteFrequencyData(dataArray);

    // Calculate the average value of the first few elements for bass
    const bassIndexRange = Math.floor(dataArray.length * 0.1);
    const bassData = dataArray.slice(0, bassIndexRange);
    const averageBass = bassData.reduce((a, b) => a + b, 0) / bassData.length;

    // Dynamically adjust the radius of the center dot based on bass intensity.
    const bassRadius = radius * 0.2 + (averageBass / 255) * radius * 0.6;
    canvasCtx.beginPath();
    canvasCtx.arc(centerX, centerY, bassRadius, 0, 2 * Math.PI);
    canvasCtx.fillStyle = "#f7941d"; // Center dot color (orange)
    canvasCtx.fill();

    // Calculate the angle step per data point to ensure 180-degree coverage
    const angleStep = Math.PI / dataArray.length;

    // Begin path for the waveform
    canvasCtx.beginPath();
    for (let i = 0; i < dataArray.length; i++) {
        // Convert the data point to a radius modifier
        const modifier = (dataArray[i] / 255.0) * radius; // Scale modifier based on data value
        const angle = i * angleStep; // Current angle for the data point

        // Calculate position for the end point based on data
        const x = centerX + (radius + modifier) * Math.cos(angle);
        const y = centerY + (radius + modifier) * Math.sin(angle);

        // Move to center for the first point or line to for subsequent points
        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }
    }

    // Mirror the waveform
    for (let i = dataArray.length - 1; i >= 0; i--) {
        const modifier = (dataArray[i] / 255.0) * radius;
        const angle = Math.PI + i * angleStep;

        const x = centerX + (radius + modifier) * Math.cos(angle);
        const y = centerY + (radius + modifier) * Math.sin(angle);

        canvasCtx.lineTo(x, y);
    }

    // Close the path to complete the waveform
    canvasCtx.closePath();

    // Create a gradient for the waveform
    const gradient = canvasCtx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
    );
    gradient.addColorStop(0, "#f7941d"); // Start color (orange)
    gradient.addColorStop(1, "#0096ff"); // End color (blue)

    // Style the waveform
    canvasCtx.strokeStyle = gradient;
    canvasCtx.lineWidth = 3; // Waveform width (thicker)
    canvasCtx.stroke();
}

// Component to render the circular waveform
const WaveForm = ({ analyzerData }) => {
    const canvasRef = useRef(null);
    const { dataArray, analyzer } = analyzerData;

    // Function to draw the waveform
    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas || !analyzer) return;
        const canvasCtx = canvas.getContext("2d");

        const animate = () => {
            requestAnimationFrame(animate);
            animateCircularWaveform(analyzer, canvas, canvasCtx, dataArray);
        };
        animate();
    };

    // Effect to draw the waveform on mount and update
    useEffect(() => {
        draw();
        console.log("WaveForm useEffect");
    }, [dataArray, analyzer]);

    return (
        <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            style={{
                position: "absolute",
                top: "0",
                left: "0",
                zIndex: "-10",
            }}
        />
    );
};

export default WaveForm;
