import * as THREE from 'three';

export class CinematicSequence {
    constructor(camera, player, onComplete) {
        this.camera = camera;
        this.player = player;
        this.onComplete = onComplete;
        this.time = 0;
        this.duration = 12.0; // 12 second cinematic trailer intro
        this.active = false;
    }

    start() {
        this.active = true;
        this.time = 0;
        document.getElementById('intro-overlay').style.display = 'flex';
    }

    update(delta) {
        if (!this.active) return false;
        this.time += delta;

        const progress = this.time / this.duration;

        if (progress < 1.0) {
            // Cinematic camera sweep from deep space towards the planet and player ship
            const camX = Math.sin(progress * Math.PI * 0.8) * 30;
            const camY = 5 + progress * 8;
            const camZ = 60 - progress * 45;

            this.camera.position.set(camX, camY, camZ);
            this.camera.lookAt(this.player.position);

            // Ship dynamic bank/pitch during intro
            this.player.rotation.z = Math.sin(this.time * 2) * 0.2;
            this.player.rotation.y = (1.0 - progress) * 0.5;
        } else {
            this.stop();
        }
        return this.active;
    }

    stop() {
        this.active = false;
        document.getElementById('intro-overlay').style.display = 'none';
        if (this.onComplete) this.onComplete();
    }
}
