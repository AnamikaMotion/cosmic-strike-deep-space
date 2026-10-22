import * as THREE from 'three';

export function createCinematicPlanet(scene) {
    const group = new THREE.Group();

    // Giant Gas/Terrestrial Planet
    const planetGeo = new THREE.SphereGeometry(180, 64, 64);
    
    // Procedural canvas texture for realistic banded planet surface
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0a1525');
    grad.addColorStop(0.3, '#103050');
    grad.addColorStop(0.5, '#1e4060');
    grad.addColorStop(0.7, '#0d2238');
    grad.addColorStop(1, '#050c18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Add planetary bands & storm details
    for (let i = 0; i < 40; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0, 255, 255, 0.05)' : 'rgba(0, 100, 200, 0.08)';
        ctx.fillRect(0, Math.random() * 512, 1024, Math.random() * 25 + 5);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const planetMat = new THREE.MeshStandardMaterial({ 
        map: texture, 
        roughness: 0.8,
        metalness: 0.1
    });

    const planet = new THREE.Mesh(planetGeo, planetMat);
    group.add(planet);

    // Atmospheric Glow Mesh
    const atmosGeo = new THREE.SphereGeometry(188, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    group.add(atmosphere);

    group.position.set(400, 100, -1200);
    scene.add(group);

    return {
        update(delta) {
            planet.rotation.y += delta * 0.02;
        }
    };
}
