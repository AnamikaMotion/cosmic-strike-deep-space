import * as THREE from 'three';

export class WeaponSystem {
    constructor(scene) {
        this.scene = scene;
        this.projectiles = [];
        this.geo = new THREE.CylinderGeometry(0.06, 0.06, 1.8, 6);
        this.geo.rotateX(Math.PI / 2);
        this.mat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    }

    fire(position, direction, isPlayer = true) {
        const mesh = new THREE.Mesh(this.geo, this.mat.clone());
        if (!isPlayer) mesh.material.color.setHex(0xff3344);
        mesh.position.copy(position);
        
        this.scene.add(mesh);
        this.projectiles.push({
            mesh,
            direction,
            speed: isPlayer ? 100 : 50,
            isPlayer,
            life: 3.5
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
