export function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
}

export function updateHUD(stats) {
    document.getElementById('hud-score').innerText = stats.score;
    document.getElementById('hud-mission').innerText = `${stats.mission} / 3`;
    document.getElementById('hud-credits').innerText = stats.credits;
    document.getElementById('player-shield-fill').style.width = `${Math.max(0, stats.shield)}%`;
    document.getElementById('player-boost-fill').style.width = `${Math.max(0, stats.boost)}%`;
}
