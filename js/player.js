import * as THREE from 'three';

// Detailed Procedural Player Interceptor Ship
export class PlayerShip {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();

        // Hull Body
        const bodyGeo = new THREE.ConeGeometry(1.2, 4, 4);
        bodyGeo.rotateX(Math.PI / 2);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x102030, metalness: 0.8, roughness: 0.2 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        this.mesh.add(body);

        // Wings
        const wingGeo = new THREE.BoxGeometry(4.5, 0.1, 1.5);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.5, roughness: 0.3 });
        const wings = new THREE.Mesh(wingGeo, wingMat);
        wings.position.set(0, 0, 0.5);
        this.mesh.add(wings);

        // Cockpit Canopy
        const cockpitGeo = new THREE.SphereGeometry(0.6, 16, 16);
        cockpitGeo.scale(0.8, 0.6, 1.5);
        const cockpitMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00f0ff, emissiveIntensity: 0.5, transparent: true, opacity: 0.7 });
        const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
        cockpit.position.set(0, 0.4, 0);
        this.mesh.add(cockpit);

        scene.add(this.mesh);

        this.velocity = new THREE.Vector3();
        this.speed = 35;
        this.maxHealth = 100;
        this.health = 100;
        this.boostEnergy = 100;
    }

    reset() {
        this.mesh.position.set(0, 0, 0);
        this.mesh.rotation.set(0, 0, 0);
        this.health = this.maxHealth;
        this.boostEnergy = 100;
    }

    update(dt, input, camera) {
        const hAxis = input.getAxis('horizontal');
        const vAxis = input.getAxis('vertical');

        const targetX = this.mesh.position.x + hAxis * this.speed * dt;
        const targetY = this.mesh.position.y + vAxis * this.speed * dt;

        // Boundaries
        this.mesh.position.x = Math.max(-30, Math.min(30, targetX));
        this.mesh.position.y = Math.max(-20, Math.min(20, targetY));

        // Banking tilt rotation
        this.mesh.rotation.z = -hAxis * 0.6;
        this.mesh.rotation.x = vAxis * 0.4;

        // Follow camera behind player
        camera.position.x += (this.mesh.position.x - camera.position.x) * 5 * dt;
        camera.position.y += (this.mesh.position.y + 3 - camera.position.y) * 5 * dt;
        camera.position.z = this.mesh.position.z + 12;
        camera.lookAt(this.mesh.position.clone().add(new THREE.Vector3(0, 0, -10)));
    }
}
