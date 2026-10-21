import * as THREE from 'three';
import { audioManager } from './audio.js';

// Projectile & Weapon System
export class WeaponSystem {
    constructor(scene) {
        this.scene = scene;
        this.projectiles = [];

        const geo = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
        geo.rotateX(Math.PI / 2);
        this.mat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

        this.pool = [];
        for (let i = 0; i < 50; i++) {
            const mesh = new THREE.Mesh(geo, this.mat);
            mesh.visible = false;
            scene.add(mesh);
            this.pool.push({ mesh, active: false, velocity: new THREE.Vector3(), damage: 25, isEnemy: false });
        }
    }

    fire(pos, direction, isEnemy = false, color = 0x00f0ff) {
        for (let p of this.pool) {
            if (!p.active) {
                p.active = true;
                p.isEnemy = isEnemy;
                p.mesh.position.copy(pos);
                p.mesh.material.color.setHex(color);
                p.mesh.visible = true;
                p.velocity.copy(direction).normalize().multiplyScalar(120);
                if (!isEnemy) audioManager.playLaser();
                break;
            }
        }
    }

    update(dt) {
        for (let p of this.pool) {
            if (p.active) {
                p.mesh.position.addScaledVector(p.velocity, dt);
                if (p.mesh.position.z < -1000 || p.mesh.position.z > 200) {
                    p.active = false;
                    p.mesh.visible = false;
                }
            }
        }
    }
}
