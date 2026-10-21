import * as THREE from 'three';

export function createBossMesh() {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(8, 3, 12);
    const mat = new THREE.MeshStandardMaterial({ color: 0x331111, metalness: 0.9, roughness: 0.2 });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    // Glowing core
    const coreGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 0, -2);
    group.add(core);

    return group;
}
