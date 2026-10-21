import * as THREE from 'three';

// High-Performance Particle System for Explosions & Engine Trails
export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];

        const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        this.pool = [];
        for (let i = 0; i < 150; i++) {
            const mesh = new THREE.Mesh(geo, mat);
            mesh.visible = false;
            scene.add(mesh);
            this.pool.push({ mesh, active: false, vx: 0, vy: 0, vz: 0, life: 0 });
        }
    }

    spawnExplosion(pos, color = 0xff5500, count = 20) {
        let spawned = 0;
        for (let p of this.pool) {
            if (!p.active) {
                p.active = true;
                p.mesh.position.copy(pos);
                p.mesh.material.color.setHex(color);
                p.mesh.visible = true;
                const speed = 10 + Math.random() * 15;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                p.vx = speed * Math.sin(phi) * Math.cos(theta);
                p.vy = speed * Math.sin(phi) * Math.sin(theta);
                p.vz = speed * Math.cos(phi);
                p.life = 0.6 + Math.random() * 0.4;
                p.maxLife = p.life;
                spawned++;
                if (spawned >= count) break;
            }
        }
    }

    update(dt) {
        for (let p of this.pool) {
            if (p.active) {
                p.life -= dt;
                if (p.life <= 0) {
                    p.active = false;
                    p.mesh.visible = false;
                } else {
                    p.mesh.position.x += p.vx * dt;
                    p.mesh.position.y += p.vy * dt;
                    p.mesh.position.z += p.vz * dt;
                    const scale = p.life / p.maxLife;
                    p.mesh.scale.set(scale, scale, scale);
                }
            }
        }
    }
}
