import * as THREE from 'three';

export class WeaponSystem {
    constructor(scene) {
        this.scene = scene;
        this.projectiles = [];
        this.geo = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 6);
        this.geo.rotateX(Math.PI / 2);
        this.mat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    }

    fire(position, direction, isPlayer = true) {
        const mesh = new THREE.Mesh(this.geo, this.mat.clone());
        if (!isPlayer) mesh.material.color.setHex(0xff3300);
        mesh.position.copy(position);
        
        this.scene.add(mesh);
        this.projectiles.push({
            mesh,
            direction,
            speed: isPlayer ? 80 : 40,
            isPlayer,
            life: 3.0
        });
    }

    update(delta) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.mesh.position.addScaledVector(p.direction, p.speed * delta);
            p.life -= delta;

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.projectiles.splice(i, 1);
            }
        }
    }
}
