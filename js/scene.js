import * as THREE from 'three';

// Cinematic Space Environment & Starfield Generator
export class SpaceScene {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x05070f, 0.0015);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        this.initLighting();
        this.initEnvironment();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initLighting() {
        const ambient = new THREE.AmbientLight(0x223355, 1.5);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 2.0);
        sun.position.set(100, 200, 100);
        this.scene.add(sun);
    }

    initEnvironment() {
        // Starfield
        const starGeo = new THREE.BufferGeometry();
        const starCount = 2000;
        const posArray = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 1500;
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: true });
        const starField = new THREE.Points(starGeo, starMat);
        this.scene.add(starField);

        // Distant Nebula / Planet Backdrop
        const planetGeo = new THREE.SphereGeometry(80, 32, 32);
        const planetMat = new THREE.MeshStandardMaterial({ color: 0x112244, roughness: 0.8, metalness: 0.2 });
        this.planet = new THREE.Mesh(planetGeo, planetMat);
        this.planet.position.set(300, 100, -800);
        this.scene.add(this.planet);
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
