import * as THREE from 'three';

export function createPlayerShip() {
    const group = new THREE.Group();

    // Sleek Futuristic Interceptor Fuselage
    const bodyGeo = new THREE.ConeGeometry(0.7, 3.8, 6);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({ 
        color: 0x182438, 
        metalness: 0.9, 
        roughness: 0.15,
        color: 0x223344
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Swept Wings
    const wingGeo = new THREE.BoxGeometry(4.2, 0.08, 1.4);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x0ef2ff, metalness: 0.7, roughness: 0.2 });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 0, 0.3);
    group.add(wings);

    // Cockpit Canopy
    const cockpitGeo = new THREE.SphereGeometry(0.35, 12, 12);
    cockpitGeo.scale(0.9, 0.7, 2.2);
    const cockpitMat = new THREE.MeshStandardMaterial({ 
        color: 0x00ffff, 
        emissive: 0x006688, 
        roughness: 0.1,
        transparent: true,
        opacity: 0.8
    });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 0.3, 0.1);
    group.add(cockpit);

    // Glowing Engine Exhaust Nacelles
    const engineGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.2, 12);
    engineGeo.rotateX(Math.PI / 2);
    const engineMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    
    const leftEngine = new THREE.Mesh(engineGeo, engineMat);
    leftEngine.position.set(-0.6, 0, -1.6);
    group.add(leftEngine);

    const rightEngine = new THREE.Mesh(engineGeo, engineMat);
    rightEngine.position.set(0.6, 0, -1.6);
    group.add(rightEngine);

    group.position.set(0, 0, 0);
    return group;
}
