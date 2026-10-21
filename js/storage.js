// Local Storage Management for Progress and Settings
const SAVE_KEY = 'cosmic_strike_save_data_v1';

const defaultData = {
    credits: 1000,
    highScore: 0,
    unlockedMission: 1,
    equippedShip: 'VANGUARD-X',
    upgrades: {
        hull: 0,
        weapon: 0,
        boost: 0
    },
    settings: {
        quality: 'medium',
        volume: 0.7
    }
};

export function loadGameData() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return { ...defaultData };
        const data = JSON.parse(raw);
        return { ...defaultData, ...data };
    } catch (e) {
        console.warn('Failed to load save data, resetting to defaults.', e);
        return { ...defaultData };
    }
}

export function saveGameData(data) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to save game data.', e);
    }
}

export function resetGameData() {
    localStorage.removeItem(SAVE_KEY);
    return { ...defaultData };
}
