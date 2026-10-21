import * as THREE from 'three';
import { SpaceScene } from './scene.js';
import { PlayerShip } from './player.js';
import { WeaponSystem } from './weapons.js';
import { EnemyManager } from './enemies.js';
import { Boss } from './boss.js';
import { ParticleSystem } from './particles.js';
import { InputManager } from './input.js';
import { UIManager } from './ui.js';
import { audioManager } from './audio.js';
import { loadGameData, saveGameData } from './storage.js';

class Game {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.spaceScene = new SpaceScene(this.container);
        this.input = new InputManager();
        this.ui = new UIManager();
        this.weapons = new WeaponSystem(this.spaceScene.scene);
        this.particles = new ParticleSystem(this.spaceScene.scene);
        this.player = new PlayerShip(this.spaceScene.scene);
        this.enemies = new EnemyManager(this.spaceScene.scene, this.weapons);
        this.boss = new Boss(this.spaceScene.scene);

        this.gameData = loadGameData();
        this.state = 'INTRO';
        this.score = 0;
        this.currentMission = 1;
        this.missionState = { enemiesDefeated: 0, targetCount: 6 };
        
        this.fireCooldown = 0;
        this.fireRateLimit = 0.12;
        this.introTimer = 4.5;

        this.input.setupTouchControls(this.container);
        this.initEventListeners();
        
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    initEventListeners() {
        const skipBtn = document.getElementById('btn-skip-intro');
        if (skipBtn) skipBtn.addEventListener('click', () => this.endIntro());

        const startBtn = document.getElementById('btn-start');
        if (startBtn) startBtn.addEventListener('click', () => {
            audioManager.init();
            this.showBriefing();
        });

        const launchBtn = document.getElementById('btn-launch');
        if (launchBtn) launchBtn.addEventListener('click', () => {
            this.startMission(this.currentMission);
        });

        const hangarBtn = document.getElementById('btn-hangar');
        if (hangarBtn) hangarBtn.addEventListener('click', () => {
            this.ui.showScreen('hangarScreen');
            const credEl = document.getElementById('player-credits');
            if (credEl) credEl.innerText = this.gameData.credits;
        });

        document.querySelectorAll('.ship-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.ship-card').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const shipName = e.currentTarget.getAttribute('data-ship');
                this.gameData.equippedShip = shipName;
                const shipNameEl = document.getElementById('selected-ship-name');
                if (shipNameEl) shipNameEl.innerText = `${shipName} INTERCEPTOR`;
                saveGameData(this.gameData);
            });
        });

        const settingsBtn = document.getElementById('btn-settings');
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.ui.showScreen('settingsScreen'));

        const controlsBtn = document.getElementById('btn-controls');
        if (controlsBtn) controlsBtn.addEventListener('click', () => this.ui.showScreen('controlsScreen'));

        const creditsBtn = document.getElementById('btn-credits');
        if (creditsBtn) creditsBtn.addEventListener('click', () => this.ui.showScreen('creditsScreen'));

        const backToMenu = () => this.ui.showScreen('mainMenu');
        ['btn-back-menu', 'btn-hangar-back', 'btn-settings-back', 'btn-controls-back', 'btn-credits-back', 'btn-success-menu', 'btn-failure-menu'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', backToMenu);
        });

        const volInput = document.getElementById('setting-volume');
        if (volInput) volInput.addEventListener('input', (e) => audioManager.setVolume(parseFloat(e.target.value)));

        const pauseBtn = document.getElementById('btn-pause');
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseGame());

        const resumeBtn = document.getElementById('btn-resume');
        if (resumeBtn) resumeBtn.addEventListener('click', () => this.resumeGame());

        const restartBtn = document.getElementById('btn-restart');
        if (restartBtn) restartBtn.addEventListener('click', () => this.startMission(this.currentMission));

        const retryBtn = document.getElementById('btn-retry');
        if (retryBtn) retryBtn.addEventListener('click', () => this.startMission(this.currentMission));

        const nextMissionBtn = document.getElementById('btn-next-mission');
        if (nextMissionBtn) nextMissionBtn.addEventListener('click', () => {
            this.currentMission++;
            if (this.currentMission > 3) this.currentMission = 3;
            this.showBriefing();
        });

        const continueBtn = document.getElementById('btn-continue');
        if (continueBtn) continueBtn.addEventListener('click', () => {
            audioManager.init();
            this.currentMission = this.gameData.unlockedMission || 1;
            this.showBriefing();
        });

        this.ui.showScreen('cinematicIntro');
    }

    endIntro() {
        this.state = 'MENU';
        this.ui.showScreen('mainMenu');
    }

    showBriefing() {
        const titles = ["", "MISSION 1: EVENT HORIZON", "MISSION 2: ACCRETION SIEGE", "MISSION 3: THE SINGULARITY CORE"];
        const descs = [
            "",
            "Engage hostile scout wings near the accretion disk and secure the sector.",
            "Navigate heavy asteroid fields and eliminate elite enemy interceptor squadrons.",
            "Confront the colossal Singularity Dreadnought guarding the event horizon."
        ];
        const titleEl = document.getElementById('briefing-title');
        const descEl = document.getElementById('briefing-desc');
        if (titleEl) titleEl.innerText = titles[this.currentMission];
        if (descEl) descEl.innerText = descs[this.currentMission];
        this.ui.showScreen('missionBriefing');
    }

    startMission(missionNum) {
        this.currentMission = missionNum;
        this.score = 0;
        this.player.reset();
        this.enemies.clear();
        this.boss.clear();

        if (missionNum === 3) {
            this.boss.spawn();
            this.missionState = { enemiesDefeated: 0, targetCount: 1 };
        } else {
            this.missionState = { enemiesDefeated: 0, targetCount: 5 + missionNum * 3 };
            for (let i = 0; i < 4; i++) {
                this.enemies.spawnScout(new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 25, -70 - Math.random() * 50));
            }
        }

        this.state = 'PLAYING';
        this.ui.showScreen('gameHud');
    }

    pauseGame() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.ui.showScreen('pauseMenu');
        }
    }

    resumeGame() {
        if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.ui.showScreen('gameHud');
        }
    }

    lastTime = 0;
    loop(time) {
        requestAnimationFrame(this.loop);
        const dt = Math.min(0.1, (time - this.lastTime) / 1000);
        this.lastTime = time;

        this.spaceScene.update(dt);

        if (this.state === 'INTRO') {
            this.introTimer -= dt;
            this.spaceScene.camera.position.set(0, 20 + Math.sin(time * 0.001) * 5, 200 - (4.5 - this.introTimer) * 40);
            this.spaceScene.camera.lookAt(0, 50, -900);
            if (this.introTimer <= 0) {
                this.endIntro();
            }
        } else if (this.state === 'PLAYING') {
            this.player.update(dt, this.input, this.spaceScene.camera);
            this.weapons.update(dt);
            this.particles.update(dt);

            if (this.fireCooldown > 0) {
                this.fireCooldown -= dt;
            }

            if (this.input.isFiring() && this.fireCooldown <= 0) {
                let weaponType = 'rapid';
                if (this.player.currentWeaponIndex === 1) weaponType = 'heavy';
                else if (this.player.currentWeaponIndex === 2) weaponType = 'missile';
                else if (this.player.currentWeaponIndex === 3) weaponType = 'nova';

                this.weapons.fire(this.player.mesh.position.clone().add(new THREE.Vector3(0, 0, -2)), new THREE.Vector3(0, 0, -1), weaponType);
                this.fireCooldown = this.fireRateLimit;
                this.spaceScene.addCameraShake(0.15);
            }

            if (this.currentMission === 3) {
                const bossDefeated = this.boss.update(dt, this.player.mesh.position, this.weapons, this.particles);
                if (bossDefeated) {
                    this.state = 'SUCCESS';
                    this.spaceScene.addCameraShake(1.2);
                    this.gameData.credits += 600;
                    saveGameData(this.gameData);
                    const sumScore = document.getElementById('summary-score');
                    const sumCred = document.getElementById('summary-credits');
                    if (sumScore) sumScore.innerText = this.score;
                    if (sumCred) sumCred.innerText = '600';
                    this.ui.showScreen('successScreen');
                }
            } else {
                const res = this.enemies.update(dt, this.player.mesh.position, this.particles);
                if (res.hitPlayer) {
                    this.player.health -= res.damage;
                    this.spaceScene.addCameraShake(0.6);
                    audioManager.playShieldHit();
                }

                if (this.enemies.enemies.length < 4 && this.missionState.enemiesDefeated < this.missionState.targetCount) {
                    this.enemies.spawnScout(new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 25, -90));
                }

                for (let p of this.weapons.pool) {
                    if (p.active && !p.isEnemy) {
                        for (let i = this.enemies.enemies.length - 1; i >= 0; i--) {
                            const e = this.enemies.enemies[i];
                            if (p.mesh.position.distanceTo(e.mesh.position) < 2.2) {
                                p.active = false;
                                p.mesh.visible = false;
                                e.health -= 25;
                                if (e.health <= 0) {
                                    this.particles.spawnExplosion(e.mesh.position, 0xff0080, 30);
                                    this.spaceScene.addCameraShake(0.45);
                                    audioManager.playExplosion();
                                    this.spaceScene.scene.remove(e.mesh);
                                    this.enemies.enemies.splice(i, 1);
                                    this.score += 150;
                                    this.missionState.enemiesDefeated++;
                                }
                            }
                        }
                    }
                }

                if (this.missionState.enemiesDefeated >= this.missionState.targetCount) {
                    this.state = 'SUCCESS';
                    this.gameData.credits += 350;
                    if (this.currentMission >= this.gameData.unlockedMission) {
                        this.gameData.unlockedMission = Math.min(3, this.currentMission + 1);
                    }
                    saveGameData(this.gameData);
                    const sumScore = document.getElementById('summary-score');
                    const sumCred = document.getElementById('summary-credits');
                    if (sumScore) sumScore.innerText = this.score;
                    if (sumCred) sumCred.innerText = '350';
                    this.ui.showScreen('successScreen');
                }
            }

            if (this.player.health <= 0) {
                this.state = 'FAILURE';
                this.particles.spawnExplosion(this.player.mesh.position, 0x00f0ff, 60);
                this.spaceScene.addCameraShake(1.5);
                audioManager.playExplosion();
                this.ui.showScreen('failureScreen');
            }

            const objText = this.currentMission === 3 ? "Objective: Destroy Singularity Core" : `Objective: Eliminate Hostiles (${this.missionState.enemiesDefeated}/${this.missionState.targetCount})`;
            this.ui.updateHUD(this.player, this.score, objText, this.boss);
        }

        this.spaceScene.render();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
