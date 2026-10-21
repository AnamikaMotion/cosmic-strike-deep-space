import * as THREE from 'three';

export function createPlayerShip() {
    const group = new THREE.Group();

    // Fuselage
    const bodyGeo = new THREE.ConeGeometry(0.8, 3, 4);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x112233, metalness: 0.8, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Wings
    const wingGeo = new THREE.BoxGeometry(3.5, 0.1, 1.2);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, metalness: 0.5, roughness: 0.3 });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 0, 0.2);
    group.add(wings);

    // Cockpit Canopy
    const cockpitGeo = new THREE.SphereGeometry(0.4, 8, 8);
    cockpitGeo.scale(1, 0.8, 2);
    const cockpitMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x004466, roughness: 0.1 });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 0.3, 0.2);
    group.add(cockpit);

    group.position.set(0, 0, 0);
    return group;
}
