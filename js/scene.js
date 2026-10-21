import * as THREE from 'three';

export function createSceneSetup() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020408, 0.0015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0x223344, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(100, 200, 100);
    scene.add(dirLight);

    // Starfield Background
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 1500;
        starPositions[i + 1] = (Math.random() - 0.5) * 1500;
        starPositions[i + 2] = (Math.random() - 0.5) * 1500;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: true });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    return { scene, camera, renderer };
}
