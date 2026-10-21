import * as THREE from 'three';

export class SpaceScene {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x020815, 0.0004);

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
        // Strong ambient light so nothing is pitch black
        const ambient = new THREE.AmbientLight(0x335588, 3.0);
        this.scene.add(ambient);

        // Powerful Sun Light pointing directly at planets & asteroids to illuminate them clearly
        const sun = new THREE.DirectionalLight(0xffffff, 4.5);
        sun.position.set(800, 400, 400);
        this.scene.add(sun);

        const secondaryLight = new THREE.DirectionalLight(0x00aaff, 2.0);
        secondaryLight.position.set(-800, -200, -400);
        this.scene.add(secondaryLight);
    }

    initEnvironment() {
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

        const nebulaGeo = new THREE.SphereGeometry(2500, 32, 32);
        const nebulaMat = new THREE.MeshBasicMaterial({
            color: 0x0f2550,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.7
        });
        const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
        this.scene.add(nebula);
    }

    initPlanetsAndAsteroidBelt() {
        this.planetGroup = new THREE.Group();

        // 1. Giant Illuminated Planet
        const planetGeo = new THREE.SphereGeometry(350, 64, 64);
        const planetMat = new THREE.MeshStandardMaterial({
            color: 0x3b6e8c,
            roughness: 0.5,
            metalness: 0.3
        });
        const planet = new THREE.Mesh(planetGeo, planetMat);
        planet.position.set(500, 200, -1800);
        this.planetGroup.add(planet);

        // Glowing Atmosphere Ring
        const atmosGeo = new THREE.RingGeometry(355, 430, 64);
        atmosGeo.rotateX(Math.PI / 3);
        const atmosMat = new THREE.MeshBasicMaterial({
            color: 0x00d8ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        const ring = new THREE.Mesh(atmosGeo, atmosMat);
        ring.position.copy(planet.position);
        this.planetGroup.add(ring);

        // 2. Asteroid Belt Field with brighter material
        this.asteroidBelt = new THREE.Group();
        const rockGeo = new THREE.DodecahedronGeometry(14, 1);
        const rockMat = new THREE.MeshStandardMaterial({ 
            color: 0x667788, 
            roughness: 0.7, 
            metalness: 0.4 
        });

        for (let i = 0; i < 70; i++) {
            const rock = new THREE.Mesh(rockGeo, rockMat);
            const angle = (i / 70) * Math.PI * 2;
            const radius = 280 + Math.random() * 220;
            rock.position.set(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 100,
                Math.sin(angle) * radius - 700
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
