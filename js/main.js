import * as THREE from 'three';
import { createSceneSetup } from './scene.js';
import { createPlayerShip } from './player.js';
import { initInput, input } from './input.js';
import { WeaponSystem } from './weapons.js';
import { createEnemyMesh } from './enemies.js';
import { createBossMesh } from './boss.js';
import { ParticleSystem } from './particles.js';
import { initAudio, playSound, setMasterVolume } from './audio.js';
import { loadGameData, saveGameData, resetGameData } from './storage.js';
import { showScreen, updateHUD } from './ui.js';

let saveData = loadGameData();
initAudio(saveData.settings.volume);
initInput();

const { scene, camera, renderer } = createSceneSetup();
const weapons = new WeaponSystem(scene);
const particles = new ParticleSystem(scene);
const player = createPlayerShip();
scene.add(player);

let gameState = 'MENU'; // MENU, BRIEFING, PLAYING, PAUSED, RESULT
let currentMission = 1;
let score = 0;
let shield = 100;
let boost = 100;
let enemies = [];
let boss = null;
let bossHP = 100;

// UI Event Handlers
document.getElementById('btn-start').addEventListener('click', () => {
    currentMission = 1;
    setupBriefing();
});
document.getElementById('btn-continue').addEventListener('click', () => {
    currentMission = saveData.unlockedMission;
    setupBriefing();
});
document.getElementById('btn-hangar').addEventListener('click', () => showScreen('hangar-screen'));
document.getElementById('btn-settings').addEventListener('click', () => showScreen('settings-screen'));
document.getElementById('btn-credits').addEventListener('click', () => showScreen('credits-screen'));

document.getElementById('btn-back-menu').addEventListener('click', () => showScreen('main-menu'));
document.getElementById('btn-hangar-back').addEventListener('click', () => showScreen('main-menu'));
document.getElementById('btn-settings-back').addEventListener('click', () => {
    saveData.settings.quality = document.getElementById('select-quality').value;
    saveData.settings.volume = parseFloat(document.getElementById('range-volume').value);
    setMasterVolume(saveData.settings.volume);
    saveGameData(saveData);
    showScreen('main-menu');
});
document.getElementById('btn-credits-back').addEventListener('click', () => showScreen('main-menu'));
document.getElementById('btn-reset-data').addEventListener('click', () => {
    if (confirm('Reset all saved progress and credits?')) {
        saveData = resetGameData();
        alert('Progress reset.');
    }
});

document.getElementById('btn-launch-mission').addEventListener('click', () => {
    startMission(currentMission);
});

document.getElementById('btn-pause').addEventListener('click', () => {
    gameState = 'PAUSED';
    showScreen('pause-menu');
});
document.getElementById('btn-resume').addEventListener('click', () => {
    gameState = 'PLAYING';
    showScreen('gameplay-hud');
});
document.getElementById('btn-restart').addEventListener('click', () => startMission(currentMission));
document.getElementById('btn-quit').addEventListener('click', () => {
    gameState = 'MENU';
    showScreen('main-menu');
});
document.getElementById('btn-next-mission').addEventListener('click', () => {
    if (currentMission < 3) {
        currentMission++;
        setupBriefing();
    } else {
        gameState = 'MENU';
        showScreen('main-menu');
    }
});
document.getElementById('btn-result-menu').addEventListener('click', () => {
    gameState = 'MENU';
    showScreen('main-menu');
});

// Check continue button availability
if (saveData.unlockedMission > 1 || saveData.credits > 0) {
    document.getElementById('btn-continue').style.display = 'block';
}

function setupBriefing() {
    const titles = ["MISSION 1: FIRST CONTACT", "MISSION 2: ASTEROID SIEGE", "MISSION 3: THE DREADNOUGHT"];
    const descs = [
        "Engage hostile scout fighters and master fundamental flight controls.",
        "Navigate asteroid hazards and destroy elite enemy formations.",
        "Confront the massive dreadnought capital ship and defeat its core."
    ];
    document.getElementById('briefing-title').innerText = titles[currentMission - 1];
    document.getElementById('briefing-desc').innerText = descs[currentMission - 1];
    showScreen('mission-briefing');
}

function startMission(missionNum) {
    gameState = 'PLAYING';
    showScreen('gameplay-hud');
    score = 0;
    shield = 100;
    boost = 100;
    player.position.set(0, 0, 0);

    // Clear old enemies
    enemies.forEach(e => scene.remove(e.mesh));
    enemies = [];
    if (boss) {
        scene.remove(boss);
        boss = null;
        document.getElementById('boss-hud').style.display = 'none';
    }

    if (missionNum === 3) {
        boss = createBossMesh();
        boss.position.set(0, 0, -100);
        scene.add(boss);
        bossHP = 100;
        document.getElementById('boss-hud').style.display = 'block';
    } else {
        // Spawn wave
        for (let i = 0; i < 5 + missionNum * 2; i++) {
            const mesh = createEnemyMesh(missionNum === 2 ? 'heavy' : 'scout');
            mesh.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20, -50 - Math.random() * 50);
            scene.add(mesh);
            enemies.push({ mesh, hp: missionNum === 2 ? 3 : 1 });
        }
    }
}

// Game Loop
const clock = new THREE.Clock();
let fireCooldown = 0;

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (gameState === 'PLAYING') {
        // Player Movement
        const speed = input.keys['ShiftLeft'] || input.keys['ShiftRight'] ? 30 : 15;
        if (input.keys['KeyW'] || input.keys['ArrowUp']) player.position.y += speed * delta;
        if (input.keys['KeyS'] || input.keys['ArrowDown']) player.position.y -= speed * delta;
        if (input.keys['KeyA'] || input.keys['ArrowLeft']) player.position.x -= speed * delta;
        if (input.keys['KeyD'] || input.keys['ArrowRight']) player.position.x += speed * delta;

        // Touch control fallback
        if (input.touch.active) {
            player.position.x += input.touch.x * 20 * delta;
            player.position.y += input.touch.y * 20 * delta;
        }

        // Firing
        fireCooldown -= delta;
        if ((input.keys['Space'] || input.touch.fire) && fireCooldown <= 0) {
            weapons.fire(player.position.clone().add(new THREE.Vector3(0, 0, -1)), new THREE.Vector3(0, 0, -1), true);
            playSound('laser');
            fireCooldown = 0.2;
        }

        // Camera follow
        camera.position.lerp(new THREE.Vector3(player.position.x, player.position.y + 3, player.position.z + 10), 0.1);
        camera.lookAt(player.position.clone().add(new THREE.Vector3(0, 0, -5)));

        // Update Systems
        weapons.update(delta);
        particles.update(delta);

        // Enemy logic
        for (let i = enemies.length - 1; i >= 0; i--) {
            const en = enemies[i];
            en.mesh.position.z += 10 * delta; // Move towards player

            // Check collision with player
            if (en.mesh.position.distanceTo(player.position) < 2) {
                shield -= 25;
                playSound('hit');
                particles.createExplosion(en.mesh.position);
                scene.remove(en.mesh);
                enemies.splice(i, 1);
                if (shield <= 0) endMission(false);
                continue;
            }

            // Check collision with player projectiles
            for (let j = weapons.projectiles.length - 1; j >= 0; j--) {
                const proj = weapons.projectiles[j];
                if (proj.isPlayer && proj.mesh.position.distanceTo(en.mesh.position) < 2) {
                    en.hp--;
                    scene.remove(proj.mesh);
                    weapons.projectiles.splice(j, 1);
                    playSound('hit');

                    if (en.hp <= 0) {
                        particles.createExplosion(en.mesh.position);
                        scene.remove(en.mesh);
                        enemies.splice(i, 1);
                        score += 100;
                    }
                    break;
                }
            }
        }

        // Boss logic
        if (boss) {
            boss.position.z += 2 * delta;
            for (let j = weapons.projectiles.length - 1; j >= 0; j--) {
                const proj = weapons.projectiles[j];
                if (proj.isPlayer && proj.mesh.position.distanceTo(boss.position) < 5) {
                    bossHP -= 2;
                    scene.remove(proj.mesh);
                    weapons.projectiles.splice(j, 1);
                    playSound('hit');
                    document.getElementById('boss-hp-fill').style.width = `${bossHP}%`;

                    if (bossHP <= 0) {
                        particles.createExplosion(boss.position, 0xff0000);
                        scene.remove(boss);
                        boss = null;
                        document.getElementById('boss-hud').style.display = 'none';
                        endMission(true);
                    }
                    break;
                }
            }
        }

        // Check wave completion for missions 1 & 2
        if (currentMission < 3 && enemies.length === 0) {
            endMission(true);
        }

        updateHUD({ score, mission: currentMission, credits: saveData.credits, shield, boost });
    }

    renderer.render(scene, camera);
}

function endMission(success) {
    gameState = 'RESULT';
    const title = document.getElementById('result-title');
    if (success) {
        title.innerText = 'MISSION SUCCESS';
        score += 500;
        saveData.credits += 250;
        if (currentMission >= saveData.unlockedMission && currentMission < 3) {
            saveData.unlockedMission = currentMission + 1;
        }
        saveGameData(saveData);
    } else {
        title.innerText = 'MISSION FAILED';
    }
    document.getElementById('res-score').innerText = score;
    document.getElementById('res-credits').innerText = success ? 250 : 0;
    showScreen('result-screen');
}

// Window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
