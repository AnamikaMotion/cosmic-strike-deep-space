export const input = {
    keys: {},
    touch: { x: 0, y: 0, active: false, fire: false, boost: false }
};

export function initInput() {
    window.addEventListener('keydown', (e) => {
        input.keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
        input.keys[e.code] = false;
    });

    // Simple touch handling for mobile screens
    window.addEventListener('touchstart', (e) => {
        input.touch.active = true;
        updateTouchPos(e.touches[0]);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (input.touch.active) {
            updateTouchPos(e.touches[0]);
        }
    }, { passive: true });

    window.addEventListener('touchend', () => {
        input.touch.active = false;
        input.touch.x = 0;
        input.touch.y = 0;
    });
}

function updateTouchPos(touch) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    input.touch.x = (touch.clientX / width) * 2 - 1;
    input.touch.y = -(touch.clientY / height) * 2 + 1;
}
