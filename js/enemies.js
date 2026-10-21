import * as THREE from 'three';

export function createEnemyMesh(type = 'scout') {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(1.2, 0.6, 1.8);
    const mat = new THREE.MeshStandardMaterial({ 
        color: type === 'heavy' ? 0xff4400 : 0xff0055, 
        metalness: 0.6, 
        roughness: 0.3 
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);
    return group;
}
