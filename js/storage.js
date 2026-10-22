const KEY = 'cosmic_strike_cinematic_v1';
export function loadSave() {
    try {
        const d = localStorage.getItem(KEY);
        return d ? JSON.parse(d) : { highScore: 0 };
    } catch (e) { return { highScore: 0 }; }
}
export function saveScore(score) {
    try {
        const d = loadSave();
        if (score > d.highScore) {
            d.highScore = score;
            localStorage.setItem(KEY, JSON.stringify(d));
        }
    } catch (e) {}
}
