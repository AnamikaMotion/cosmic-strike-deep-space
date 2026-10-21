import { loadGameData } from './storage.js';

export class UIManager {
    constructor() {
        this.screens = {
            cinematicIntro: document.getElementById('cinematic-intro'),
            mainMenu: document.getElementById('main-menu'),
            missionBriefing: document.getElementById('mission-briefing'),
            gameHud: document.getElementById('game-hud'),
            pauseMenu: document.getElementById('pause-menu'),
            hangarScreen: document.getElementById('hangar-screen'),
            settingsScreen: document.getElementById('settings-screen'),
            controlsScreen: document.getElementById('controls-screen'),
            creditsScreen: document.getElementById('credits-screen'),
            successScreen: document.getElementById('success-screen'),
            failureScreen: document.getElementById('failure-screen'),
            touchControls: document.getElementById('touch-controls')
        };

        this.checkSaveGameStatus();
    }

    checkSaveGameStatus() {
        const data = loadGameData();
        const continueBtn = document.getElementById('btn-continue');
        if (continueBtn) {
            // Show CONTINUE only if player has played before or unlocked missions > 1
            if (data.hasPlayed || data.unlockedMission > 1) {
                continueBtn.style.display = 'block';
            } else {
                continueBtn.style.display = 'none';
            }
        }
    }

    showScreen(screenName) {
        Object.keys(this.screens).forEach(key => {
            const el = this.screens[key];
            if (el) {
                if (key === screenName) {
                    el.classList.add('active');
                    if (key === 'gameHud') {
                        el.style.display = 'flex';
                        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                            if (this.screens.touchControls) this.screens.touchControls.style.display = 'block';
                        }
                    }
                } else {
                    el.classList.remove('active');
                    if (key === 'gameHud') el.style.display = 'none';
                    if (key === 'touchControls') el.style.display = 'none';
                }
            }
        });
        
        // Refresh continue button state on main menu return
        if (screenName === 'mainMenu') {
            this.checkSaveGameStatus();
        }
    }

    updateHUD(player, score, objectiveText, boss) {
        const shieldPct = Math.max(0, (player.health / player.maxHealth) * 100);
        const boostPct = Math.max(0, player.boostEnergy);

        const shieldBar = document.getElementById('shield-bar');
        const boostBar = document.getElementById('boost-bar');
        const scoreEl = document.getElementById('hud-score');
        const objEl = document.getElementById('objective-text');

        if (shieldBar) shieldBar.style.width = `${shieldPct}%`;
        if (boostBar) boostBar.style.width = `${boostPct}%`;
        if (scoreEl) scoreEl.innerText = String(score).padStart(6, '0');
        if (objEl) objEl.innerText = objectiveText;

        if (boss && boss.active) {
            const bossHud = document.getElementById('boss-hud');
            const bossBar = document.getElementById('boss-health-bar');
            if (bossHud) bossHud.style.display = 'block';
            if (bossBar) {
                const bossPct = Math.max(0, (boss.health / boss.maxHealth) * 100);
                bossBar.style.width = `${bossPct}%`;
            }
        }
    }
}
