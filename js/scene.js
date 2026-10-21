import * as THREE from 'three';

export class SpaceScene {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x010206, 0.0006);

        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 5000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        this.shakeIntensity = 0;
        this.shakeDecay = 8.0;

        this.initLighting();
        this.initEnvironment();
        this.initBlackHole();
        this.initEnvironmentalStorytelling();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initLighting() {
        const ambient = new THREE.AmbientLight(0x0c1428, 2.5);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffeedd, 3.2);
        sun.position.set(400, 500, 400);
        this.scene.add(sun);
    }

    initEnvironment() {
        // Multi-layered realistic starfield
        const starGeo = new THREE.BufferGeometry();
        const starCount = 5000;
        const posArray = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 4000;
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.8, sizeAttenuation: true });
        this.starField = new THREE.Points(starGeo, starMat);
        this.scene.add(this.starField);

        // Volumetric Nebula Background
        const nebulaGeo = new THREE.SphereGeometry(2000, 32, 32);
        const nebulaMat = new THREE.MeshBasicMaterial({
            color: 0x1b003a,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.55
        });
        const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
        this.scene.add(nebula);
    }

    initBlackHole() {
        this.blackHoleGroup = new THREE.Group();
        this.blackHoleGroup.position.set(0, 100, -1500);

        // Pitch Black Event Horizon Core
        const coreGeo = new THREE.SphereGeometry(120, 32, 32);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        this.blackHoleGroup.add(core);

        // Glowing Accretion Disk
        const diskGeo = new THREE.RingGeometry(140, 420, 64);
        diskGeo.rotateX(Math.PI / 2);
        const diskMat = new THREE.MeshBasicMaterial({
            color: 0xff7700,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.92
        });
        this.accretionDisk = new THREE.Mesh(diskGeo, diskMat);
        this.blackHoleGroup.add(this.accretionDisk);

        // Outer Plasma Ring
        const outerDiskGeo = new THREE.RingGeometry(430, 700, 64);
        outerDiskGeo.rotateX(Math.PI / 2);
        const outerDiskMat = new THREE.MeshBasicMaterial({
            color: 0xff0066,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        this.outerDisk = new THREE.Mesh(outerDiskGeo, outerDiskMat);
        this.blackHoleGroup.add(this.outerDisk);

        this.scene.add(this.blackHoleGroup);
    }

    initEnvironmentalStorytelling() {
        this.debrisGroup = new THREE.Group();
        const rockGeo = new THREE.DodecahedronGeometry(15, 1);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.8, metalness: 0.4 });

        for (let i = 0; i < 30; i++) {
            const mesh = new THREE.Mesh(rockGeo, rockMat);
            mesh.position.set(
                (Math.random() - 0.5) * 800,
                (Math.random() - 0.5) * 400,
                -300 - Math.random() * 1000
            );
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            this.debrisGroup.add(mesh);
        }
        this.scene.add(this.debrisGroup);
    }

    addCameraShake(amount) {
        this.shakeIntensity = Math.min(3.0, this.shakeIntensity + amount);
    }

    update(dt) {
        if (this.accretionDisk) this.accretionDisk.rotation.z += dt * 0.4;
        if (this.outerDisk) this.outerDisk.rotation.z -= dt * 0.25;
        if (this.starField) this.starField.rotation.y += dt * 0.005;

        if (this.shakeIntensity > 0) {
            this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * this.shakeDecay);
            this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
            this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
