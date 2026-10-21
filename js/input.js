// Comprehensive Desktop & Mobile Input Manager for 3D Space Combat
export class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, firing: false };
        this.touch = { active: false, x: 0, y: 0, firing: false, boosting: false };

        this.initKeyboardListeners();
        this.initMouseListeners();
    }

    initKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            // Prevent default scrolling on spacebar or arrow keys
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    initMouseListeners() {
        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.mouse.firing = true;
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouse.firing = false;
        });
    }

    setupTouchControls(container) {
        const joystick = document.getElementById('virtual-joystick');
        const knob = document.getElementById('joystick-knob');
        const fireBtn = document.getElementById('touch-fire');
        const boostBtn = document.getElementById('touch-boost');

        if (!joystick || !knob) return;

        let joystickCenter = { x: 0, y: 0 };
        let touchId = null;

        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            touchId = touch.identifier;
            const rect = joystick.getBoundingClientRect();
            joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            this.touch.active = true;
        }, { passive: false });

        joystick.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === touchId) {
                    const dx = touch.clientX - joystickCenter.x;
                    const dy = touch.clientY - joystickCenter.y;
                    const dist = Math.min(50, Math.sqrt(dx * dx + dy * dy));
                    const angle = Math.atan2(dy, dx);

                    const clampedX = Math.cos(angle) * dist;
                    const clampedY = Math.sin(angle) * dist;

                    knob.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
                    this.touch.x = clampedX / 50;
                    this.touch.y = -clampedY / 50; // Invert Y for flight controls
                }
            }
        }, { passive: false });

        const endTouch = (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchId) {
                    touchId = null;
                    this.touch.active = false;
                    this.touch.x = 0;
                    this.touch.y = 0;
                    knob.style.transform = `translate(0px, 0px)`;
                }
            }
        };

        joystick.addEventListener('touchend', endTouch, { passive: false });
        joystick.addEventListener('touchcancel', endTouch, { passive: false });

        if (fireBtn) {
            fireBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.touch.firing = true; }, { passive: false });
            fireBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.touch.firing = false; }, { passive: false });
        }

        if (boostBtn) {
            boostBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.touch.boosting = true; }, { passive: false });
            boostBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.touch.boosting = false; }, { passive: false });
        }
    }

    getMovementVector() {
        let x = 0;
        let y = 0;

        // Keyboard Controls (WASD / Arrow Keys)
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) y += 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) y -= 1;

        // Override or combine with Touch Joystick if active
        if (this.touch.active) {
            x = this.touch.x;
            y = this.touch.y;
        }

        return { x, y };
    }

    isFiring() {
        return !!(this.keys['Space'] || this.mouse.firing || this.touch.firing);
    }

    isBoosting() {
        return !!(this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.touch.boosting);
    }

    isSecondaryPressed() {
        return !!(this.keys['KeyQ'] || this.keys['KeyE']);
    }
}
