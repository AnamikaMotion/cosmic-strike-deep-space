import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    createExplosion(pos, color = 0x00ffff) {
        for (let i = 0; i < 18; i++) {
            const geo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
            const mat = new THREE.MeshBasicMaterial({ color });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(pos);

            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );

            this.scene.add(mesh);
            this.particles.push({ mesh, velocity, life: 0.7 });
        }
    }

    update(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.mesh.position.addScaledVector(p.velocity, delta);
            p.life -= delta;
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            }
        }
    }
}
