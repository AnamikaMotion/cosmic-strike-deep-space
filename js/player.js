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
        this.maxSpeed = 42;
        this.currentWeaponIndex = 0;

        this.buildOrganicChromeShip();
        this.scene.add(this.mesh);
    }

    buildOrganicChromeShip() {
        const gameData = loadGameData();
        const shipType = gameData.equippedShip || 'VANGUARD-X';

        // Ultra-Glossy Dark Chrome / Metallic Organic Shader Material
        const chromeMaterial = new THREE.MeshStandardMaterial({
            color: 0x111622,
            roughness: 0.08,
            metalness: 0.98,
            emissive: 0x050b14
        });

        const glowingAccents = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

        // 1. Sleek Organic Fuselage (Curved body resembling the image)
        const bodyGeo = new THREE.ConeGeometry(1.4, 6.5, 8);
        bodyGeo.rotateX(Math.PI / 2);
        bodyGeo.scale(1, 0.7, 1);
        const fuselage = new THREE.Mesh(bodyGeo, chromeMaterial);
        this.mesh.add(fuselage);

        // 2. Flowing Swept-Back Organic Wings
        const wingShape = new THREE.BoxGeometry(7.0, 0.1, 2.8);
        const wings = new THREE.Mesh(wingShape, chromeMaterial);
        wings.position.set(0, -0.1, 0.3);
        wings.rotation.y = 0;
        this.mesh.add(wings);

        // 3. Cockpit Glass Canopy (Reflective dark tint with cyan edge)
        const canopyGeo = new THREE.SphereGeometry(0.6, 16, 16);
        canopyGeo.scale(0.6, 0.4, 2.0);
        const canopyMat = new THREE.MeshStandardMaterial({
            color: 0x00d8ff,
            roughness: 0.05,
            metalness: 0.9,
            transparent: true,
            opacity: 0.85
        });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(0, 0.4, -0.2);
        this.mesh.add(canopy);

        // 4. Glowing Engine Exhaust Ports at the rear
        const engineGeo = new THREE.CylinderGeometry(0.4, 0.5, 1.2, 12);
        engineGeo.rotateX(Math.PI / 2);
        const leftEngine = new THREE.Mesh(engineGeo, glowingAccents);
        leftEngine.position.set(-0.6, 0, 2.8);
        this.mesh.add(leftEngine);

        const rightEngine = new THREE.Mesh(engineGeo, glowingAccents);
        rightEngine.position.set(0.6, 0, 2.8);
        this.mesh.add(rightEngine);

        // Adjust stats based on class
        if (shipType === 'HEAVY-STRIKE') {
            this.maxSpeed = 32;
            this.maxHealth = 160;
            this.health = 160;
        } else if (shipType === 'STEALTH-PHANTOM') {
            this.maxSpeed = 50;
            this.maxHealth = 85;
            this.health = 85;
        }

        this.mesh.position.set(0, 0, 0);
    }

    reset() {
        this.health = this.maxHealth;
        this.boostEnergy = 100;
        this.mesh.position.set(0, 0, 0);
        this.mesh.rotation.set(0, 0, 0);
        this.currentWeaponIndex = 0;
    }

    update(dt, input, camera) {
        const moveDir = input.getMovementVector();
        
        if (input.isWeaponSwitchPressed()) {
            this.currentWeaponIndex = (this.currentWeaponIndex + 1) % 4;
        }

        const targetRoll = -moveDir.x * 0.85;
        const targetPitch = moveDir.y * 0.6;

        this.mesh.rotation.z += (targetRoll - this.mesh.rotation.z) * 12 * dt;
        this.mesh.rotation.x += (targetPitch - this.mesh.rotation.x) * 12 * dt;
        this.mesh.rotation.y = -this.mesh.rotation.z * 0.5;

        const isBoosting = input.isBoosting() && this.boostEnergy > 5;
        const targetSpeed = isBoosting ? this.maxSpeed * 1.8 : this.maxSpeed;
        
        if (moveDir.x !== 0 || moveDir.y !== 0) {
            this.speed += (targetSpeed - this.speed) * 7 * dt;
        } else {
            this.speed += (this.maxSpeed * 0.4 - this.speed) * 5 * dt;
        }

        if (isBoosting) {
            this.boostEnergy = Math.max(0, this.boostEnergy - dt * 38);
        } else {
            this.boostEnergy = Math.min(100, this.boostEnergy + dt * 20);
        }

        this.mesh.position.x += moveDir.x * this.speed * dt;
        this.mesh.position.y += moveDir.y * this.speed * dt;

        this.mesh.position.x = Math.max(-42, Math.min(42, this.mesh.position.x));
        this.mesh.position.y = Math.max(-26, Math.min(26, this.mesh.position.y));

        const desiredCamX = this.mesh.position.x * 0.45;
        const desiredCamY = (this.mesh.position.y + 3.0);
        const desiredCamZ = this.mesh.position.z + 13.0;

        camera.position.x += (desiredCamX - camera.position.x) * 9 * dt;
        camera.position.y += (desiredCamY - camera.position.y) * 9 * dt;
        camera.position.z += (desiredCamZ - camera.position.z) * 9 * dt;

        camera.rotation.z = this.mesh.rotation.z * 0.15;
        camera.lookAt(this.mesh.position.clone().add(new THREE.Vector3(0, 0, -35)));
    }
}
