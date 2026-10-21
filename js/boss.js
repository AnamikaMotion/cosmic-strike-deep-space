import * as THREE from 'three';
import { audioManager } from './audio.js';

// Dreadnought Boss Encounter Class
export class Boss {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();

        // Massive Capital Ship Hull
        const hullGeo = new THREE.BoxGeometry(12, 4, 25);
        const hullMat = new THREE.MeshStandardMaterial({ color: 0x333b4d, metalness: 0.8, roughness: 0.2 });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        this.mesh.add(hull);

        // Glowing Core Bridge
        const coreGeo = new THREE.SphereGeometry(2, 16, 16);
        const coreMat = new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0xff0055, emissiveIntensity: 1.0 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(0, 2, 0);
        this.mesh.add(core);

        this.mesh.position.set(0, 0, -150);
        scene.add(this.mesh);

        this.maxHealth = 500;
        this.health = 500;
        this.active = false;
    }

    spawn() {
        this.mesh.position.set(0, 0, -120);
        this.health = this.maxHealth;
        this.active = true;
        this.mesh.visible = true;
    }

    update(dt, playerPos, weapons, particleSys) {
        if (!this.active) return;

        // Hover pattern
        this.mesh.position.x = Math.sin(Date.now() * 0.001) * 20;

        // Boss shooting pattern
        if (Math.random() < 0.05) {
            weapons.fire(this.mesh.position.clone().add(new THREE.Vector3(0, 0, 5)), new THREE.Vector3(0, 0, 1), true, 0xff0055);
        }

        if (this.health <= 0) {
            this.active = false;
            this.mesh.visible = false;
            particleSys.spawnExplosion(this.mesh.position, 0xff0055, 80);
            audioManager.playExplosion();
            return true; // Boss defeated!
        }
        return false;
    }

    clear() {
        this.active = false;
        this.mesh.visible = false;
    }
}
