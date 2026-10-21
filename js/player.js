import * as THREE from 'three';
import { loadGameData } from './storage.js';

export class PlayerShip {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.health = 100;
        this.maxHealth = 100;
        this.boostEnergy = 100;
        this.speed = 0;
        this.maxSpeed = 35;

        this.buildShipModel();
        this.scene.add(this.mesh);
    }

    buildShipModel() {
        const gameData = loadGameData();
        const shipType = gameData.equippedShip || 'VANGUARD-X';

        // Procedural Sci-Fi Fighter Hull based on Class
        let bodyColor = 0x00f0ff;
        let wingColor = 0x112233;

        if (shipType === 'HEAVY-STRIKE') {
            bodyColor = 0xff5500;
            this.maxSpeed = 28;
            this.maxHealth = 150;
            this.health = 150;
        } else if (shipType === 'STEALTH-PHANTOM') {
            bodyColor = 0x9900ff;
            this.maxSpeed = 42;
            this.maxHealth = 80;
            this.health = 80;
        }

        const fuselageGeo = new THREE.ConeGeometry(1.2, 5, 4);
        fuselageGeo.rotateX(Math.PI / 2);
        const fuselageMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.3, metalness: 0.8 });
        const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
        this.mesh.add(fuselage);

        // Wings
        const wingGeo = new THREE.BoxGeometry(5.5, 0.15, 2.2);
        const wingMat = new THREE.MeshStandardMaterial({ color: wingColor, roughness: 0.4, metalness: 0.6 });
        const wings = new THREE.Mesh(wingGeo, wingMat);
        wings.position.set(0, 0, 0.5);
        this.mesh.add(wings);

        // Cockpit Canopy (Emissive Cyan)
        const cockpitGeo = new THREE.SphereGeometry(0.6, 16, 16);
        cockpitGeo.scale(0.8, 0.6, 1.8);
        const cockpitMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x0088ff, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85 });
        const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
        cockpit.position.set(0, 0.5, 0.2);
        this.mesh.add(cockpit);

        // Engine Thruster Glow
        const engineGeo = new THREE.CylinderGeometry(0.4, 0.5, 1, 12);
        engineGeo.rotateX(Math.PI / 2);
        const engineMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const engine = new THREE.Mesh(engineGeo, engineMat);
        engine.position.set(0, 0, 2.2);
        this.mesh.add(engine);

        this.mesh.position.set(0, 0, 0);
    }

    reset() {
        this.health = this.maxHealth;
        this.boostEnergy = 100;
        this.mesh.position.set(0, 0, 0);
        this.mesh.rotation.set(0, 0, 0);
    }

    update(dt, input, camera) {
        const moveDir = input.getMovementVector(); // {x, y}
        
        // Flight physics with banking and responsiveness
        const targetRoll = -moveDir.x * 0.75;
        const targetPitch = moveDir.y * 0.5;

        this.mesh.rotation.z += (targetRoll - this.mesh.rotation.z) * 10 * dt;
        this.mesh.rotation.x += (targetPitch - this.mesh.rotation.x) * 10 * dt;
        this.mesh.rotation.y = -this.mesh.rotation.z * 0.6;

        const isBoosting = input.isBoosting() && this.boostEnergy > 5;
        const currentSpeed = isBoosting ? this.maxSpeed * 1.6 : this.maxSpeed;

        if (isBoosting) {
            this.boostEnergy = Math.max(0, this.boostEnergy - dt * 35);
        } else {
            this.boostEnergy = Math.min(100, this.boostEnergy + dt * 15);
        }

        // Move ship position within bounds
        this.mesh.position.x += moveDir.x * currentSpeed * dt;
        this.mesh.position.y += moveDir.y * currentSpeed * dt;

        this.mesh.position.x = Math.max(-35, Math.min(35, this.mesh.position.x));
        this.mesh.position.y = Math.max(-22, Math.min(22, this.mesh.position.y));

        // Smooth cinematic camera follow
        camera.position.x += (this.mesh.position.x * 0.4 - camera.position.x) * 5 * dt;
        camera.position.y += ((this.mesh.position.y + 3) - camera.position.y) * 5 * dt;
        camera.lookAt(this.mesh.position.clone().add(new THREE.Vector3(0, 0, -30)));
    }
}
