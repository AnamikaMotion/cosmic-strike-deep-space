import * as THREE from 'three';

export function createBossMesh() {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(10, 4, 16);
    const mat = new THREE.MeshStandardMaterial({ color: 0x221111, metalness: 0.9, roughness: 0.15 });
    group.add(new THREE.Mesh(geo, mat));

    const coreGeo = new THREE.SphereGeometry(2, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 0, -3);
    group.add(core);

    return group;
}

