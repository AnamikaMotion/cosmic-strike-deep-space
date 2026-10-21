// UI State Machine Manager
export class UIManager {
    constructor() {
        this.screens = {
            mainMenu: document.getElementById('main-menu'),
            missionBriefing: document.getElementById('mission-briefing'),
            gameHud: document.getElementById('game-hud'),
            pauseMenu: document.getElementById('pause-menu'),
            hangarScreen: document.getElementById('hangar-screen'),
            settingsScreen: document.getElementById('settings-screen'),
            controlsScreen: document.getElementById('controls-screen'),
            creditsScreen: document.getElementById('credits-screen'),
            successScreen: document.getElementById('success-screen'),
            failureScreen: document.getElementById('failure-screen')
        };
    }

    showScreen(name) {
        for (let key in this.screens) {
            if (this.screens[key]) {
                this.screens[key].classList.remove('active');
                if (key === 'gameHud') {
                    this.screens[key].style.display = 'none';
                }
            }
        }
        if (this.screens[name]) {
            if (name === 'gameHud') {
                this.screens[name].style.display = 'flex';
            } else {
                this.screens[name].classList.add('active');
            }
        }
    }

    updateHUD(player, score, objectiveText, boss) {
        document.getElementById('shield-bar').style.width = `${Math.max(0, (player.health / player.maxHealth) * 100)}%`;
        document.getElementById('boost-bar').style.width = `${Math.max(0, player.boostEnergy)}%`;
        document.getElementById('hud-score').innerText = String(score).padStart(6, '0');
        document.getElementById('objective-text').innerText = objectiveText;

        const bossHud = document.getElementById('boss-hud');
        if (boss && boss.active) {
            bossHud.style.display = 'block';
            document.getElementById('boss-health-bar').style.width = `${Math.max(0, (boss.health / boss.maxHealth) * 100)}%`;
        } else {
            bossHud.style.display = 'none';
        }
    }
}
