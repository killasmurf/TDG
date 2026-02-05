/**
 * Game Loop Implementation
 * Handles the main game update and render cycles
 */

class GameLoop {
    constructor() {
        this.lastTime = 0;
        this.isRunning = false;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        this.deltaTime = 0;
    }

    start() {
        if (this.isRunning) return; // Prevent double-start
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    stop() {
        this.isRunning = false;
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        // Calculate delta time in milliseconds
        const deltaTimeMs = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Convert to seconds for physics calculations
        this.deltaTime = deltaTimeMs / 1000;

        // Update game logic
        this.update(this.deltaTime);

        // Render game
        this.render();

        // Continue the loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Override this method with game-specific update logic
        console.log('Game update with delta time:', deltaTime);
    }

    render() {
        // Override this method with game-specific render logic
        console.log('Game render');
    }
}

export default GameLoop;
