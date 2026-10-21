const SAVE_KEY = 'cosmic_strike_save_v1';

export function loadGameData() {
    const defaultData = {
        credits: 0,
        unlockedMission: 1,
        upgrades: { laser: 0, shield: 0, boost: 0 },
        settings: { quality: 'medium', volume: 0.5 }
    };
    try {
        const data = localStorage.getItem(SAVE_KEY);
        return data ? { ...defaultData, ...JSON.parse(data) } : defaultData;
    } catch (e) {
        console.warn('Failed to load save data, using defaults.', e);
        return defaultData;
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
    return loadGameData();
}
