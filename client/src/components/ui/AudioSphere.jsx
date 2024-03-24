import * as THREE from "three";

export default class AudioSphere {
    constructor(radius, widthSegments, heightSegments) {
        this.radius = radius;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
        this.refSphereGeometry = new THREE.SphereGeometry(
            radius,
            widthSegments,
            heightSegments
        );
        this.refSphere = new THREE.Mesh(
            this.refSphereGeometry,
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );

        let positionAttributes =
            this.refSphereGeometry.getAttribute("position");

        this.meshes = [];
        for (let i = this.widthSegments; i < positionAttributes.count; i++) {
            const sphereGeometry = new THREE.SphereGeometry(0.2, 7, 7);
            const sphere = new THREE.Mesh(
                sphereGeometry,
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            sphere.position.set(
                positionAttributes.getX(i),
                positionAttributes.getY(i),
                positionAttributes.getZ(i)
            );
            sphere.scale.set(0.1, 0.1, 0.1);
            this.meshes.push(sphere);
        }

        this.rotation = this.refSphere.rotation;
        this.scale = this.refSphere.scale;
        this.position = this.refSphere.position;
    }

    addToScene(scene) {
        this.meshes.forEach((mesh) => scene.add(mesh));
    }

    update(freqData) {
        console.log(freqData);
        const positionAttributes =
            this.refSphereGeometry.getAttribute("position");
        let freqIndex = 0;

        for (let i = this.widthSegments; i < this.meshes.length; i++) {
            let freqDataFreq = freqData[freqIndex + 20];
            const sphere = this.meshes[i - this.widthSegments];
            const newPosition = new THREE.Vector3(
                positionAttributes.getX(i),
                positionAttributes.getY(i),
                positionAttributes.getZ(i)
            );

            const audioMove = freqDataFreq ** 3 / 10000000;
            newPosition.multiplyScalar(audioMove + 1);
            sphere.position.set(newPosition.x, newPosition.y, newPosition.z);

            const audioSize = freqDataFreq / 100 + 0.1;
            sphere.scale.set(audioSize, audioSize, audioSize);

            if (i % 2 == 0) {
                freqIndex++;
            }
        }
    }
}
