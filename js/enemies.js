import * as THREE from 'three';

export class EnemyManager {
    constructor(scene, weaponSystem) {
        this.scene = scene;
        this.weapons = weaponSystem;
        this.enemies = [];
    }

    spawnScout(position) {
        const enemyGroup = new THREE.Group();

        // Industrial Armored Hull (Bulky Military Cruiser look)
        const hullGeo = new THREE.BoxGeometry(3.5, 1.8, 6.0);
        const hullMat = new THREE.MeshStandardMaterial({
            color: 0x333b48,
            roughness: 0.7,
            metalness: 0.85
        });
        const mainHull = new THREE.Mesh(hullGeo, hullMat);
        enemyGroup.add(mainHull);

        // Command Bridge / Cockpit Section
        const bridgeGeo = new THREE.BoxGeometry(2.0, 0.9, 2.2);
        const bridgeMat = new THREE.MeshStandardMaterial({
            color: 0x1a212b,
            roughness: 0.5,
            metalness: 0.9
        });
        const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
        bridge.position.set(0, 0.8, -0.5);
        enemyGroup.add(bridge);

        // Heavy Side Wings / Armor Fins
        const wingGeo = new THREE.BoxGeometry(5.0, 0.2, 2.5);
        const wingMat = new THREE.MeshStandardMaterial({
            color: 0x222a35,
            roughness: 0.6,
            metalness: 0.8
        });
        const wings = new THREE.Mesh(wingGeo, wingMat);
        wings.position.set(0, -0.3, 0.5);
        enemyGroup.add(wings);

        // Glowing Threat Engines / Exhaust
        const engineGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.2, 8);
        engineGeo.rotateX(Math.PI / 2);
        const engineMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
        const engine = new THREE.Mesh(engineGeo, engineMat);
        engine.position.set(0, 0, 3.2);
        enemyGroup.add(engine);

        enemyGroup.position.copy(position);
        this.scene.add(enemyGroup);

        this.enemies.push({
            mesh: enemyGroup,
            health: 100,
            maxHealth: 100,
            speed: 12 + Math.random() * 8,
            shootTimer: Math.random() * 2
        });
    }

    clear() {
        for (let e of this.enemies) {
            this.scene.remove(e.mesh);
        }
        this.enemies = [];
    }

    update(dt, playerPos, particles) {
        let hitPlayer = false;
        let totalDamage = 0;

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];

            // Move towards player position slowly
            const dir = new THREE.Vector3().subVectors(playerPos, e.mesh.position).normalize();
            e.mesh.position.addScaledVector(dir, e.speed * dt);
            e.mesh.lookAt(playerPos);

            // Check collision with player
            if (e.mesh.position.distanceTo(playerPos) < 3.5) {
                hitPlayer = true;
                totalDamage += 15;
                particles.spawnExplosion(e.mesh.position, 0xff3300, 30);
                this.scene.remove(e.mesh);
                this.enemies.splice(i, 1);
                continue;
            }

            // Enemy firing logic
            e.shootTimer -= dt;
            if (e.shootTimer <= 0) {
                e.shootTimer = 2.0 + Math.random() * 1.5;
                // Enemy shoots back at player
                this.weapons.fire(e.mesh.position.clone(), dir, 'rapid');
            }
        }

        return { hitPlayer, damage: totalDamage };
    }
}
