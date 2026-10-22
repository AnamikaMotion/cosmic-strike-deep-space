import * as THREE from 'three';

export function createSceneSetup() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010204, 0.0012);

    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 3000);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0x112233, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffeedd, 2.5);
    sunLight.position.set(300, 400, 200);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x0088ff, 1.5);
    rimLight.position.set(-300, -200, -200);
    scene.add(rimLight);

    // Layered Starfield
    const starsGeo = new THREE.BufferGeometry();
    const count = 3000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 2000;
        positions[i + 1] = (Math.random() - 0.5) * 2000;
        positions[i + 2] = (Math.random() - 0.5) * 2000;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.8, sizeAttenuation: true });
    scene.add(new THREE.Points(starsGeo, starsMat));

    return { scene, camera, renderer };
}
