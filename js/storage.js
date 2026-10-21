// LocalStorage Game Progression Manager
const SAVE_KEY = 'COSMIC_STRIKE_SINGULARITY_SAVE_V1';

export function loadGameData() {
    const defaultData = {
        hasPlayed: false,
        unlockedMission: 1,
        credits: 1000,
        equippedShip: 'VANGUARD-X',
        settings: { quality: 'medium', volume: 0.7 }
    };

    try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Could not load save data, using defaults.');
    }
    return defaultData;
}

export function saveGameData(data) {
    try {
        data.hasPlayed = true;
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Could not save game data.');
    }
}
