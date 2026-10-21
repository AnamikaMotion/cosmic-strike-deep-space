import * as THREE from 'three';

// Cinematic Space Environment with Environmental Storytelling & Cosmic Debris
export class SpaceScene {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x020408, 0.0008);

        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 4000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        this.initLighting();
        this.initEnvironment();
        this.initBlackHole();
        this.initEnvironmentalStorytelling();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initLighting() {
        const ambient = new THREE.AmbientLight(0x112244, 2.2);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffeedd, 2.8);
        sun.position.set(300, 400, 300);
        this.scene.add(sun);
    }

    initEnvironment() {
        // Multi-layered Starfield
        const starGeo = new THREE.BufferGeometry();
        const starCount = 4000;
        const posArray = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 3000;
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: true });
        this.starField = new THREE.Points(starGeo, starMat);
        this.scene.add(this.starField);

        // Deep Nebula Backdrop
        const nebulaGeo = new THREE.SphereGeometry(1500, 32, 32);
        const nebulaMat = new THREE.MeshBasicMaterial({
            color: 0x220055,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.4
        });
        const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
        this.scene.add(nebula);
    }

    initBlackHole() {
        this.blackHoleGroup = new THREE.Group();
        this.blackHoleGroup.position.set(0, 80, -1200);

        // Event Horizon Core
        const coreGeo = new THREE.SphereGeometry(90, 32, 32);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        this.blackHoleGroup.add(core);

        // Rotating Accretion Disk (High Cinematic Scale)
        const diskGeo = new THREE.RingGeometry(110, 350, 64);
        diskGeo.rotateX(Math.PI / 2);
        const diskMat = new THREE.MeshBasicMaterial({
            color: 0xff8800,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        this.accretionDisk = new THREE.Mesh(diskGeo, diskMat);
        this.blackHoleGroup.add(this.accretionDisk);

        // Outer Plasma Ring
        const outerDiskGeo = new THREE.RingGeometry(360, 580, 64);
        outerDiskGeo.rotateX(Math.PI / 2);
        const outerDiskMat = new THREE.MeshBasicMaterial({
            color: 0xff0055,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.45
        });
        this.outerDisk = new THREE.Mesh(outerDiskGeo, outerDiskMat);
        this.blackHoleGroup.add(this.outerDisk);

        this.scene.add(this.blackHoleGroup);
    }

    initEnvironmentalStorytelling() {
        this.debrisGroup = new THREE.Group();

        // Asteroids & Drifting Wreckage
        const rockGeo = new THREE.DodecahedronGeometry(12, 1);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.9, metalness: 0.3 });

        for (let i = 0; i < 25; i++) {
            const mesh = new THREE.Mesh(rockGeo, rockMat);
            mesh.position.set(
                (Math.random() - 0.5) * 600,
                (Math.random() - 0.5) * 300,
                -200 - Math.random() * 800
            );
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            this.debrisGroup.add(mesh);
        }

        // Abandoned Capital Ship Hull Fragment (Scale Reference)
        const hullGeo = new THREE.BoxGeometry(40, 15, 120);
        const hullMat = new THREE.MeshStandardMaterial({ color: 0x1a2233, roughness: 0.7, metalness: 0.8 });
        const giantWreckage = new THREE.Mesh(hullGeo, hullMat);
        giantWreckage.position.set(250, -60, -500);
        giantWreckage.rotation.set(0.3, 0.8, 0.1);
        this.debrisGroup.add(giantWreckage);

        this.scene.add(this.debrisGroup);
    }

    update(dt) {
        if (this.accretionDisk) this.accretionDisk.rotation.z += dt * 0.35;
        if (this.outerDisk) this.outerDisk.rotation.z -= dt * 0.2;
        if (this.starField) this.starField.rotation.y += dt * 0.008;

        // Slow rotation of debris to give life to space
        this.debrisGroup.children.forEach((mesh, index) => {
            mesh.rotation.x += dt * 0.1 * (index % 2 === 0 ? 1 : -1);
            mesh.rotation.y += dt * 0.15;
        });
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
