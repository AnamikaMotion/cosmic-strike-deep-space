import * as THREE from 'three';

export class WeaponSystem {
    constructor(scene) {
        this.scene = scene;
        this.pool = [];
        this.poolSize = 50;

        // Initialize Projectile Pool
        for (let i = 0; i < this.poolSize; i++) {
            const geo = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 8);
            geo.rotateX(Math.PI / 2);
            const mat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.visible = false;
            this.scene.add(mesh);

            this.pool.push({
                mesh: mesh,
                active: false,
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                isEnemy: false,
                type: 'rapid'
            });
        }
    }

    fire(pos, dir, weaponType = 'rapid') {
        // Find inactive projectile in pool
        for (let p of this.pool) {
            if (!p.active) {
                p.active = true;
                p.mesh.visible = true;
                p.mesh.position.copy(pos);
                p.type = weaponType;
                p.isEnemy = false;

                let speed = 120;
                let color = 0x00f0ff;
                let scaleX = 1, scaleY = 1, scaleZ = 1;

                if (weaponType === 'heavy') {
                    speed = 85;
                    color = 0xff5500;
                    scaleX = 2.5; scaleY = 2.5; scaleZ = 3.5;
                } else if (weaponType === 'missile') {
                    speed = 60;
                    color = 0x00ffaa;
                    scaleX = 1.5; scaleY = 1.5; scaleZ = 2.0;
                } else if (weaponType === 'nova') {
                    speed = 100;
                    color = 0xff0080;
                    scaleX = 3.0; scaleY = 3.0; scaleZ = 3.0;
                }

                p.mesh.scale.set(scaleX, scaleY, scaleZ);
                p.mesh.material.color.setHex(color);
                p.velocity.copy(dir).normalize().multiplyScalar(speed);
                break;
            }
        }
    }

    update(dt) {
        for (let p of this.pool) {
            if (p.active) {
                p.mesh.position.addScaledVector(p.velocity, dt);

                // Deactivate if out of range
                if (p.mesh.position.z < -1500 || Math.abs(p.mesh.position.x) > 100 || Math.abs(p.mesh.position.y) > 80) {
                    p.active = false;
                    p.mesh.visible = false;
                }
            }
        }
    }
}
