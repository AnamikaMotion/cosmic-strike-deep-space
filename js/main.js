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
        this.state = 'MENU';
        this.score = 0;
        this.currentMission = 1;
        this.missionState = { enemiesDefeated: 0, targetCount: 5 };

        this.input.setupTouchControls(this.container);
        this.initEventListeners();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    initEventListeners() {
        document.getElementById('btn-start').addEventListener('click', () => {
            audioManager.init();
            this.currentMission = this.gameData.unlockedMission;
            this.showBriefing();
        });

        document.getElementById('btn-launch').addEventListener('click', () => {
            this.startMission(this.currentMission);
        });

        document.getElementById('btn-hangar').addEventListener('click', () => {
            this.ui.showScreen('hangarScreen');
            document.getElementById('player-credits').innerText = this.gameData.credits;
        });

        document.getElementById('btn-settings').addEventListener('click', () => { this.ui.showScreen('settingsScreen'); });
        document.getElementById('btn-controls').addEventListener('click', () => { this.ui.showScreen('controlsScreen'); });
        document.getElementById('btn-credits').addEventListener('click', () => { this.ui.showScreen('creditsScreen'); });

        const backToMenu = () => { this.ui.showScreen('mainMenu'); };
        document.getElementById('btn-back-menu').addEventListener('click', backToMenu);
        document.getElementById('btn-hangar-back').addEventListener('click', backToMenu);
        document.getElementById('btn-settings-back').addEventListener('click', backToMenu);
        document.getElementById('btn-controls-back').addEventListener('click', backToMenu);
        document.getElementById('btn-credits-back').addEventListener('click', backToMenu);
        document.getElementById('btn-success-menu').addEventListener('click', backToMenu);
        document.getElementById('btn-failure-menu').addEventListener('click', backToMenu);

        document.getElementById('setting-volume').addEventListener('input', (e) => {
            audioManager.setVolume(parseFloat(e.target.value));
        });

        document.getElementById('btn-pause').addEventListener('click', () => { this.pauseGame(); });
        document.getElementById('btn-resume').addEventListener('click', () => { this.resumeGame(); });
        document.getElementById('btn-restart').addEventListener('click', () => { this.startMission(this.currentMission); });

        document.getElementById('btn-next-mission').addEventListener('click', () => {
            this.currentMission++;
            if (this.currentMission > 3) this.currentMission = 3;
            this.showBriefing();
        });
    }

    showBriefing() {
        const titles = ["", "MISSION 1: FIRST CONTACT", "MISSION 2: ASTEROID SIEGE", "MISSION 3: THE DREADNOUGHT"];
        const descs = [
            "",
            "Engage enemy scout units and master your interceptor controls in deep space sector Alpha.",
            "Navigate heavy asteroid fields and eliminate hostile interceptor squadrons.",
            "Confront the Capital Dreadnought flagship and destroy its core reactor."
        ];
        document.getElementById('briefing-title').innerText = titles[this.currentMission];
        document.getElementById('briefing-desc').innerText = descs[this.currentMission];
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
            this.missionState = { enemiesDefeated: 0, targetCount: 5 + missionNum * 2 };
            for (let i = 0; i < 3; i++) {
                this.enemies.spawnScout(new THREE.Vector3((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, -60 - Math.random() * 40));
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

        if (this.state === 'PLAYING') {
            this.player.update(dt, this.input, this.spaceScene.camera);
            this.weapons.update(dt);
            this.particles.update(dt);

            if (this.input.isFiring()) {
                this.weapons.fire(this.player.mesh.position.clone().add(new THREE.Vector3(0, 0, -2)), new THREE.Vector3(0, 0, -1));
            }

            if (this.currentMission === 3) {
                const bossDefeated = this.boss.update(dt, this.player.mesh.position, this.weapons, this.particles);
                if (bossDefeated) {
                    this.state = 'SUCCESS';
                    this.gameData.credits += 500;
                    saveGameData(this.gameData);
                    document.getElementById('summary-score').innerText = this.score;
                    document.getElementById('summary-credits').innerText = '500';
                    this.ui.showScreen('successScreen');
                }
            } else {
                const res = this.enemies.update(dt, this.player.mesh.position, this.particles);
                if (res.hitPlayer) {
                    this.player.health -= res.damage;
                    audioManager.playShieldHit();
                }

                if (this.enemies.enemies.length < 3 && this.missionState.enemiesDefeated < this.missionState.targetCount) {
                    this.enemies.spawnScout(new THREE.Vector3((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, -80));
                }

                // Check projectile collisions with enemies
                for (let p of this.weapons.pool) {
                    if (p.active && !p.isEnemy) {
                        for (let i = this.enemies.enemies.length - 1; i >= 0; i--) {
                            const e = this.enemies.enemies[i];
                            if (p.mesh.position.distanceTo(e.mesh.position) < 2.0) {
                                p.active = false;
                                p.mesh.visible = false;
                                e.health -= 25;
                                if (e.health <= 0) {
                                    this.particles.spawnExplosion(e.mesh.position, 0xff0055, 25);
                                    audioManager.playExplosion();
                                    this.spaceScene.scene.remove(e.mesh);
                                    this.enemies.enemies.splice(i, 1);
                                    this.score += 100;
                                    this.missionState.enemiesDefeated++;
                                }
                            }
                        }
                    }
                }

                if (this.missionState.enemiesDefeated >= this.missionState.targetCount) {
                    this.state = 'SUCCESS';
                    this.gameData.credits += 250;
                    if (this.currentMission >= this.gameData.unlockedMission) {
                        this.gameData.unlockedMission = Math.min(3, this.currentMission + 1);
                    }
                    saveGameData(this.gameData);
                    document.getElementById('summary-score').innerText = this.score;
                    document.getElementById('summary-credits').innerText = '250';
                    this.ui.showScreen('successScreen');
                }
            }

            if (this.player.health <= 0) {
                this.state = 'FAILURE';
                this.particles.spawnExplosion(this.player.mesh.position, 0x00f0ff, 50);
                audioManager.playExplosion();
                this.ui.showScreen('failureScreen');
            }

            const objText = this.currentMission === 3 ? "Objective: Destroy Dreadnought Core" : `Objective: Eliminate Scouts (${this.missionState.enemiesDefeated}/${this.missionState.targetCount})`;
            this.ui.updateHUD(this.player, this.score, objText, this.boss);
        }

        this.spaceScene.render();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
