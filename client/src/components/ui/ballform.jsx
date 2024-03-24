import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import AudioSphere from "./audiosphere";

const BallForm3D = ({ analyzerData }) => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const audioSphereRef = useRef(null);

    useEffect(() => {
        // Three.js setup code
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        );
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.domElement);

        // Camera rotation
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.autoRotate = true;
        controls.enableZoom = true;
        controls.target = new THREE.Vector3(0, 7, 0);

        // Position the camera (initial)
        camera.position.z = 35;
        camera.position.y = 8;

        // Create the audio sphere
        const audioSphere = new AudioSphere(10, 35, 30);
        audioSphere.addToScene(scene);

        // Store references
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        controlsRef.current = controls;
        audioSphereRef.current = audioSphere;

        // Resizing renderer on window resize
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener("resize", handleResize);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            // Cleanup code
            window.removeEventListener("resize", handleResize);
            containerRef.current.removeChild(renderer.domElement);
        };
    }, []);

    useEffect(() => {
        if (analyzerData) {
            console.log("analyzerData", analyzerData);
            const animate = () => {
                requestAnimationFrame(animate);
                audioSphereRef.current.update(analyzerData.dataArray);
            };
            animate();
        }
    }, [analyzerData]);

    return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default BallForm3D;
