import * as THREE from 'three';

// Enemy AI & Fleet Management
export class EnemyManager {
    constructor(scene, weapons) {
        this.scene = scene;
        this.weapons = weapons;
        this.enemies = [];

        // Scout Geometry Template
        this.geom = new THREE.ConeGeometry(1.5, 3, 4);
        this.geom.rotateX(Math.PI / 2);
        this.mat = new THREE.MeshStandardMaterial({ color: 0xff0055, metalness: 0.6, roughness: 0.3 });
    }

    spawnScout(pos) {
        const mesh = new THREE.Mesh(this.geom, this.mat);
        mesh.position.copy(pos);
        this.scene.add(mesh);

        this.enemies.push({
            mesh,
            health: 50,
            maxHealth: 50,
            type: 'scout',
            shootTimer: Math.random() * 2
        });
    }

    update(dt, playerPos, particleSys) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];

            // Move towards player slowly
            const dir = playerPos.clone().sub(e.mesh.position).normalize();
            e.mesh.position.addScaledVector(dir, 15 * dt);
            e.mesh.lookAt(playerPos);

            // Collision check with player
            if (e.mesh.position.distanceTo(playerPos) < 2.0) {
                this.scene.remove(e.mesh);
                this.enemies.splice(i, 1);
                particleSys.spawnExplosion(e.mesh.position, 0xff0055, 30);
                return { hitPlayer: true, damage: 25 };
            }
        }
        return { hitPlayer: false, damage: 0 };
    }

    clear() {
        for (let e of this.enemies) {
            this.scene.remove(e.mesh);
        }
        this.enemies = [];
    }
}
