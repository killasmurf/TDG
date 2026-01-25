/**
 * Tower Defense Game - Main Entry Point
 * Initializes and starts the game
 */

import Game from './core/game.js';
import Config from './config.js';

// Global game instance
let game = null;

/**
 * Initialize and start the game
 */
function init() {
    console.log('Tower Defense Game v0.1.0');
    console.log('Initializing...');

    // Create game instance
    game = new Game(Config.canvas.id);

    // Initialize game systems
    game.init();

    // Setup click handler for starting game from menu
    const canvas = document.getElementById(Config.canvas.id);

    canvas.addEventListener('click', () => {
        if (game.state === 'menu') {
            game.audio.init(); // Initialize audio on first user interaction
            game.startGame();
        }
    });

    // Initial render to show menu
    game.render();

    console.log('Game initialized. Click to start!');

    // Expose game instance for debugging
    window.game = game;
}

/**
 * Wait for DOM to be ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for module usage
export { game };
export default init;
