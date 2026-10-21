import * as THREE from 'three';

export class SpaceScene {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x020815, 0.0005);

        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 6000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        this.shakeIntensity = 0;
        this.shakeDecay = 8.0;

        this.initLighting();
        this.initEnvironment();
        this.initPlanetsAndAsteroidBelt();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initLighting() {
        const ambient = new THREE.AmbientLight(0x112244, 2.5);
        this.scene.add(ambient);

        // Bright Star Flare Light matching the image
        const sun = new THREE.DirectionalLight(0xccffff, 3.5);
        sun.position.set(-500, 300, -800);
        this.scene.add(sun);
    }

    initEnvironment() {
        // Starfield
        const starGeo = new THREE.BufferGeometry();
        const starCount = 5000;
        const posArray = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 5000;
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.8, sizeAttenuation: true });
        this.starField = new THREE.Points(starGeo, starMat);
        this.scene.add(this.starField);

        // Deep Cyan-Blue Nebula Glow Background
        const nebulaGeo = new THREE.SphereGeometry(2500, 32, 32);
        const nebulaMat = new THREE.MeshBasicMaterial({
            color: 0x0a1a3a,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.6
        });
        const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
        this.scene.add(nebula);
    }

    initPlanetsAndAsteroidBelt() {
        this.planetGroup = new THREE.Group();

        // 1. Giant Planet with Atmosphere Glow in background
        const planetGeo = new THREE.SphereGeometry(350, 64, 64);
        const planetMat = new THREE.MeshStandardMaterial({
            color: 0x224466,
            roughness: 0.8,
            metalness: 0.2
        });
        const planet = new THREE.Mesh(planetGeo, planetMat);
        planet.position.set(600, 250, -2000);
        this.planetGroup.add(planet);

        // Planet Atmosphere Ring
        const atmosGeo = new THREE.RingGeometry(355, 420, 64);
        atmosGeo.rotateX(Math.PI / 3);
        const atmosMat = new THREE.MeshBasicMaterial({
            color: 0x00aaff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.35
        });
        const ring = new THREE.Mesh(atmosGeo, atmosMat);
        ring.position.copy(planet.position);
        this.planetGroup.add(ring);

        // 2. Distant Moon
        const moonGeo = new THREE.SphereGeometry(80, 32, 32);
        const moonMat = new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.9 });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(-700, 400, -2500);
        this.planetGroup.add(moon);

        // 3. Dense Asteroid Belt Field (Matching the image's floating rock belt)
        this.asteroidBelt = new THREE.Group();
        const rockGeo = new THREE.DodecahedronGeometry(14, 1);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x3a4555, roughness: 0.9, metalness: 0.3 });

        for (let i = 0; i < 70; i++) {
            const rock = new THREE.Mesh(rockGeo, rockMat);
            const angle = (i / 70) * Math.PI * 2;
            const radius = 300 + Math.random() * 250;
            rock.position.set(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 120,
                Math.sin(angle) * radius - 800
            );
            rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            this.asteroidBelt.add(rock);
        }

        this.planetGroup.add(this.asteroidBelt);
        this.scene.add(this.planetGroup);
    }

    addCameraShake(amount) {
        this.shakeIntensity = Math.min(3.0, this.shakeIntensity + amount);
    }

    update(dt) {
        if (this.starField) this.starField.rotation.y += dt * 0.003;
        if (this.asteroidBelt) this.asteroidBelt.rotation.y += dt * 0.02;

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
