import * as THREE from 'three';
import { createSceneSetup } from './scene.js';
import { createCinematicPlanet } from './planet.js';
import { createPlayerShip } from './player.js';
import { CinematicSequence } from './cinematic.js';
import { WeaponSystem } from './weapons.js';
import { createEnemyMesh } from './enemies.js';
import { createBossMesh } from './boss.js';
import { ParticleSystem } from './particles.js';
import { initAudio, playSound } from './audio.js';
import { loadSave, saveScore } from './storage.js';

initAudio();
const { scene, camera, renderer } = createSceneSetup();
const planet = createCinematicPlanet(scene);
const player = createPlayerShip();
scene.add(player);

const weapons = new WeaponSystem(scene);
const particles = new ParticleSystem(scene);
const cinematic = new CinematicSequence(camera, player, () => startGameplay());

let gameState = 'MENU'; // MENU, CINEMATIC, PLAYING, PAUSED, OVER
let cameraMode = 'COMBAT';
let score = 0;
let health = 100;
let boost = 100;
let wave = 1;
let enemies = [];
let boss = null;
let bossHP = 100;
let fireCooldown = 0;
let isFiringTriggered = false;

// Global Key Listeners
window.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'KeyF') {
        e.preventDefault();
        isFiringTriggered = true;
    }
    if (e.code === 'KeyC' && gameState === 'PLAYING') {
        cameraMode = cameraMode === 'COMBAT' ? 'EXPLORATION' : 'COMBAT';
        document.getElementById('hud-cam-mode').innerText = cameraMode;
    }
    if (e.code === 'Escape' && gameState === 'PLAYING') togglePause();
});

window.addEventListener('keyup', e => {
    if (e.code === 'Space' || e.code === 'KeyF') {
        isFiringTriggered = false;
    }
});

// Pointer / Mouse Listeners
window.addEventListener('pointerdown', (e) => {
    // Canvas par click ho tabhi attack/fire register ho (Menu UI buttons bypass)
    if (e.target.tagName !== 'BUTTON' && gameState === 'PLAYING') {
        isFiringTriggered = true;
    }
});

window.addEventListener('pointerup', () => {
    isFiringTriggered = false;
});

// UI Event Listeners
document.getElementById('btn-start').addEventListener('click', (e) => {
    if (e && e.target) e.target.blur();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    startGameplay();
});
document.getElementById('btn-cinematic').addEventListener('click', (e) => {
    if (e && e.target) e.target.blur();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    gameState = 'CINEMATIC';
    cinematic.start();
});
document.getElementById('btn-skip-intro').addEventListener('click', () => cinematic.stop());
document.getElementById('btn-pause').addEventListener('click', togglePause);
document.getElementById('btn-resume').addEventListener('click', togglePause);
document.getElementById('btn-restart').addEventListener('click', () => startGameplay());
document.getElementById('btn-retry').addEventListener('click', () => startGameplay());
document.getElementById('btn-menu').addEventListener('click', () => {
    gameState = 'MENU';
    document.getElementById('result-screen').classList.remove('active');
    document.getElementById('main-menu').classList.add('active');
});

function togglePause() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        document.getElementById('pause-menu').classList.add('active');
    } else if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        document.getElementById('pause-menu').classList.remove('active');
    }
}

function startGameplay() {
    gameState = 'PLAYING';
    score = 0;
    health = 100;
    boost = 100;
    wave = 1;
    player.position.set(0, 0, 0);
    document.getElementById('gameplay-hud').classList.add('active');
    document.getElementById('pause-menu').classList.remove('active');
    document.getElementById('result-screen').classList.remove('active');
    spawnWave();
}

function spawnWave() {
    enemies.forEach(e => scene.remove(e.mesh));
    enemies = [];
    if (wave > 3) {
        boss = createBossMesh();
        boss.position.set(0, 0, -120);
        scene.add(boss);
        bossHP = 100;
        document.getElementById('boss-container').style.display = 'block';
        return;
    }
    for (let i = 0; i < 4 + wave * 2; i++) {
        const mesh = createEnemyMesh(wave === 3 ? 'heavy' : 'scout');
        mesh.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20, -50 - Math.random() * 40);
        scene.add(mesh);
        enemies.push({ mesh, hp: wave === 3 ? 3 : 1 });
    }
}

// Game Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    planet.update(delta);

    if (gameState === 'CINEMATIC') {
        cinematic.update(delta);
    } else if (gameState === 'PLAYING') {
        // Attack Execution Logic
        fireCooldown -= delta;
        if (isFiringTriggered && fireCooldown <= 0) {
            console.log("FIRING LASER!");
            const spawnPos = player.position.clone().add(new THREE.Vector3(0, 0, -1.5));
            weapons.fire(spawnPos, new THREE.Vector3(0, 0, -1), true);
            playSound('laser');
            fireCooldown = 0.15;
        }

        // Camera Follow
        if (cameraMode === 'COMBAT') {
            camera.position.lerp(new THREE.Vector3(player.position.x * 0.5, player.position.y + 2.5, player.position.z + 8), 0.15);
            camera.lookAt(player.position.clone().add(new THREE.Vector3(0, 0, -10)));
        } else {
            camera.position.lerp(new THREE.Vector3(player.position.x, player.position.y + 5, player.position.z + 16), 0.1);
            camera.lookAt(player.position);
        }

        weapons.update(delta);
        particles.update(delta);

        // Enemy Movement & Hit Detection
        for (let i = enemies.length - 1; i >= 0; i--) {
            const en = enemies[i];
            en.mesh.position.z += 10 * delta;

            if (en.mesh.position.distanceTo(player.position) < 2.5) {
                health -= 25;
                particles.createExplosion(en.mesh.position, 0xff0044);
                scene.remove(en.mesh);
                enemies.splice(i, 1);
                playSound('explosion');
                if (health <= 0) gameOver(false);
                continue;
            }

            for (let j = weapons.projectiles.length - 1; j >= 0; j--) {
                const p = weapons.projectiles[j];
                if (p.isPlayer && p.mesh.position.distanceTo(en.mesh.position) < 3.5) {
                    en.hp--;
                    scene.remove(p.mesh);
                    weapons.projectiles.splice(j, 1);
                    if (en.hp <= 0) {
                        particles.createExplosion(en.mesh.position, 0x00ffff);
                        scene.remove(en.mesh);
                        enemies.splice(i, 1);
                        score += 150;
                        playSound('explosion');
                    }
                    break;
                }
            }
        }

        if (boss) {
            boss.position.z += 2.5 * delta;
            for (let j = weapons.projectiles.length - 1; j >= 0; j--) {
                const p = weapons.projectiles[j];
                if (p.isPlayer && p.mesh.position.distanceTo(boss.position) < 7.0) {
                    bossHP -= 2;
                    scene.remove(p.mesh);
                    weapons.projectiles.splice(j, 1);
                    document.getElementById('boss-hp').style.width = `${bossHP}%`;
                    if (bossHP <= 0) {
                        particles.createExplosion(boss.position, 0xff0000);
                        scene.remove(boss);
                        boss = null;
                        document.getElementById('boss-container').style.display = 'none';
                        gameOver(true);
                    }
                    break;
                }
            }
        }

        if (!boss && enemies.length === 0) {
            wave++;
            spawnWave();
        }

        // HUD Sync
        document.getElementById('hud-score').innerText = score;
        document.getElementById('hud-wave').innerText = wave <= 3 ? wave : 'BOSS';
        document.getElementById('player-hp').style.width = `${Math.max(0, health)}%`;
        document.getElementById('player-boost').style.width = `${Math.max(0, boost)}%`;
    }

    renderer.render(scene, camera);
}

function gameOver(victory) {
    gameState = 'OVER';
    saveScore(score);
    document.getElementById('gameplay-hud').classList.remove('active');
    document.getElementById('result-screen').classList.add('active');
    document.getElementById('result-title').innerText = victory ? 'VICTORY — SECTOR SECURED' : 'SIMULATION FAILED';
    document.getElementById('res-score').innerText = score;
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
