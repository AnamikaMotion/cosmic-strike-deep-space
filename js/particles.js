import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.explosions = [];
        this.initCosmicDust();
    }

    initCosmicDust() {
        // High-density moving space dust particles for extreme sense of speed
        const count = 1200;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 400;
            positions[i + 1] = (Math.random() - 0.5) * 300;
            positions[i + 2] = (Math.random() - 0.5) * 1500;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: 0x00f0ff,
            size: 1.2,
            transparent: true,
            opacity: 0.75
        });

        this.dustField = new THREE.Points(geo, mat);
        this.scene.add(this.dustField);
    }

    spawnExplosion(pos, colorHex = 0xff0055, count = 40) {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;

            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 45,
                (Math.random() - 0.5) * 45,
                (Math.random() - 0.5) * 45
            ));
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: colorHex,
            size: 2.5,
            transparent: true,
            opacity: 1.0
        });

        const particleSystem = new THREE.Points(geo, mat);
        this.scene.add(particleSystem);

        this.explosions.push({
            mesh: particleSystem,
            velocities: velocities,
            life: 1.0
        });
    }

    update(dt) {
        // Move cosmic dust toward player for speed illusion
        if (this.dustField) {
            const positions = this.dustField.geometry.attributes.position.array;
            for (let i = 2; i < positions.length; i += 3) {
                positions[i] += dt * 120;
                if (positions[i] > 200) positions[i] = -1200;
            }
            this.dustField.geometry.attributes.position.needsUpdate = true;
        }

        // Animate active explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const exp = this.explosions[i];
            exp.life -= dt * 1.5;

            const posArr = exp.mesh.geometry.attributes.position.array;
            for (let j = 0; j < exp.velocities.length; j++) {
                posArr[j * 3] += exp.velocities[j].x * dt;
                posArr[j * 3 + 1] += exp.velocities[j].y * dt;
                posArr[j * 3 + 2] += exp.velocities[j].z * dt;
            }
            exp.mesh.geometry.attributes.position.needsUpdate = true;
            exp.mesh.material.opacity = Math.max(0, exp.life);

            if (exp.life <= 0) {
                this.scene.remove(exp.mesh);
                this.explosions.splice(i, 1);
            }
        }
    }
}
