import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const WaveForm3D = ({ analyzerData }) => {
    const mountRef = useRef(null);

    useEffect(() => {
        if (!analyzerData) return;

        let { analyzer, dataArray } = analyzerData;
        dataArray = dataArray.slice(0, Math.floor(dataArray.length * 0.6));

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 100);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.autoRotate = true;

        // Enhanced lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft white light
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1, 100); // Brighter point light
        pointLight.position.set(50, 50, 50);
        scene.add(pointLight);

        const spikes = [];

        const spikeRadius = 2;
        const sphereRadius = 20; // Radius of the sphere that the spikes will cover
        const ringRadius = 20; // Radius of the ring that the spikes will cover
        const numSpikes = 200; // Total number of spikes
        const numSpikesRing = 20;

        const sphereGeometry = new THREE.SphereGeometry(10, 32, 32);
        const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const pulsingSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(pulsingSphere);
        // Determine how many frequency data points each spike will represent
        const dataPointsPerSpike = Math.floor(dataArray.length / numSpikes);

        // for (let i = 0; i < numSpikes; i++) {
        //     const geometry = new THREE.ConeGeometry(spikeRadius, 1, 32);
        //     const material = new THREE.MeshPhongMaterial({
        //         color: new THREE.Color(
        //             `hsl(${(i * 360) / numSpikes}, 100%, 70%)`
        //         ),
        //         emissive: new THREE.Color(
        //             `hsl(${(i * 360) / numSpikes}, 100%, 50%)`
        //         ),
        //     });
        //     const spike = new THREE.Mesh(geometry, material);

        //     // Use spherical coordinates to position the spikes evenly on the sphere surface
        //     const theta = Math.acos(1 - (2 * i) / numSpikes);
        //     const phi = Math.sqrt(numSpikes * Math.PI) * theta;
        //     spike.position.setFromSphericalCoords(sphereRadius, theta, phi);

        //     spike.lookAt(new THREE.Vector3(0, 0, 0));
        //     spike.rotateX(Math.PI / 2);
        //     spike.rotateZ(Math.PI);

        //     scene.add(spike);
        //     spikes.push(spike);
        // }

        const numOrbits = 3; // Number of orbits

        let spikeIndex = 0;
        for (let i = 0; i < numOrbits; i++) {
            const orbitRadius = ringRadius + i * 20; // Adjust the orbit radius as needed
            const orbitAngle = Math.random() * Math.PI * 2; // Random starting angle for each orbit
            const spikesPerOrbit = numSpikesRing * (i + 1); // Increase spikes per orbit for each orbit

            for (let j = 0; j < spikesPerOrbit; j++) {
                const geometry = new THREE.ConeGeometry(
                    spikeRadius,
                    0.4 * (i + 1),
                    32
                );
                const material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(
                        `hsl(${(spikeIndex * 360) / numSpikesRing}, 100%, 70%)`
                    ),
                    emissive: new THREE.Color(
                        `hsl(${(spikeIndex * 360) / numSpikesRing}, 100%, 50%)`
                    ),
                });
                const spike = new THREE.Mesh(geometry, material);

                const angle = orbitAngle + (j / spikesPerOrbit) * Math.PI * 2;
                spike.position.x = Math.cos(angle) * orbitRadius;
                spike.position.y = Math.sin(angle) * orbitRadius;

                spike.lookAt(new THREE.Vector3(0, 0, 0));
                spike.rotateX(Math.PI / 2);
                spike.rotateY(Math.PI);
                spike.rotateZ(Math.PI);

                scene.add(spike);
                spikes.push(spike);

                spikeIndex++;
            }
        }

        window.addEventListener("resize", () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });

        const animate = () => {
            requestAnimationFrame(animate);

            analyzer.getByteFrequencyData(dataArray);

            // Update each spike based on the average value of its corresponding frequency data points
            spikes.forEach((spike, index) => {
                let sum = 0;
                for (let j = 0; j < dataPointsPerSpike; j++) {
                    sum += dataArray[index * dataPointsPerSpike + j];
                }
                const average = sum / dataPointsPerSpike;
                const height = (average / 128.0) * 10 + 1; // Dynamic height based on frequency data
                spike.scale.set(1, height, 1); // Animate height, keeping base size fixed
            });

            // Color cycle logic for rainbow effect
            const time = Date.now() * 0.0001; // Time in seconds
            const hue = time % 1; // Cycle hue between 0.0 and 1.0
            const color = new THREE.Color();
            color.setHSL(hue, 1, 0.5); // Set hue, saturation, and lightness
            sphereMaterial.color = color; // Update the sphere's material color

            // Update the pulsing sphere based on overall average
            const overallAverage =
                dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
            const sphereScale = overallAverage / 128.0 + 0.5; // Adjust scale factor as needed
            pulsingSphere.scale.set(sphereScale, sphereScale, sphereScale);

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            mountRef.current.removeChild(renderer.domElement);
        };
    }, [analyzerData]);

    return <div ref={mountRef} style={{ width: "100%", height: "100%" }}></div>;
};

export default WaveForm3D;
