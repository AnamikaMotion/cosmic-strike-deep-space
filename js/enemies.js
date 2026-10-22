import * as THREE from 'three';

export function createEnemyMesh(type = 'scout') {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(1.4, 0.7, 2.0);
    const mat = new THREE.MeshStandardMaterial({ 
        color: type === 'heavy' ? 0xff5500 : 0xff0066, 
        metalness: 0.8, 
        roughness: 0.2 
    });
    group.add(new THREE.Mesh(geo, mat));
    return group;
}
