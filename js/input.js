// Robust Input Manager for Keyboard and Touch Controls
export class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.touch = { active: false, x: 0, y: 0, fire: false, boost: false };
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        this.initListeners();
    }

    initListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (['Space', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.mouse.down = true;
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouse.down = false;
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    }

    setupTouchControls(domElement) {
        if (!this.isMobile && window.innerWidth > 900) return;
        const container = document.getElementById('touch-controls');
        if (container) container.style.display = 'block';

        const joystick = document.getElementById('virtual-joystick');
        const knob = document.getElementById('joystick-knob');
        let joyCenter = { x: 0, y: 0 };

        joystick.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = joystick.getBoundingClientRect();
            joyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            this.touch.active = true;
        });

        joystick.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const dx = touch.clientX - joyCenter.x;
            const dy = touch.clientY - joyCenter.y;
            const dist = Math.min(50, Math.sqrt(dx * dx + dy * dy));
            const angle = Math.atan2(dy, dx);

            knob.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
            this.touch.x = (Math.cos(angle) * dist) / 50;
            this.touch.y = -(Math.sin(angle) * dist) / 50;
            e.preventDefault();
        });

        joystick.addEventListener('touchend', () => {
            this.touch.active = false;
            this.touch.x = 0;
            this.touch.y = 0;
            knob.style.transform = `translate(0px, 0px)`;
        });

        const fireBtn = document.getElementById('touch-fire');
        fireBtn.addEventListener('touchstart', () => { this.touch.fire = true; });
        fireBtn.addEventListener('touchend', () => { this.touch.fire = false; });

        const boostBtn = document.getElementById('touch-boost');
        boostBtn.addEventListener('touchstart', () => { this.touch.boost = true; });
        boostBtn.addEventListener('touchend', () => { this.touch.boost = false; });
    }

    isFiring() {
        return this.keys['Space'] || this.mouse.down || this.touch.fire;
    }

    isBoosting() {
        return this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.touch.boost;
    }

    getAxis(axis) {
        let val = 0;
        if (axis === 'horizontal') {
            if (this.keys['KeyA'] || this.keys['ArrowLeft']) val -= 1;
            if (this.keys['KeyD'] || this.keys['ArrowRight']) val += 1;
            if (this.touch.active) val += this.touch.x;
        } else if (axis === 'vertical') {
            if (this.keys['KeyW'] || this.keys['ArrowUp']) val += 1;
            if (this.keys['KeyS'] || this.keys['ArrowDown']) val -= 1;
            if (this.touch.active) val += this.touch.y;
        }
        return Math.max(-1, Math.min(1, val));
    }
}
