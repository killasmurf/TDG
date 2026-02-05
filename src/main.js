// src/main.js - Game entry point
import Game from './core/game.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    const game = new Game('gameCanvas');

    // Initialize the game
    game.init();

    // Handle click to start from menu
    document.addEventListener('click', (e) => {
        if (game.state === 'menu') {
            game.startGame();
        }
    }, { once: false });

    // Update HUD elements
    function updateHUD() {
        const waveNumber = document.getElementById('wave-number');
        const waveStatus = document.getElementById('wave-status');

        if (waveNumber && game.waveManager) {
            waveNumber.textContent = `Wave: ${game.waveManager.getCurrentWaveNumber()}/${game.waveManager.getTotalWaves()}`;
        }

        if (waveStatus) {
            if (game.waveInProgress) {
                waveStatus.textContent = `Enemies: ${game.waveManager.getEnemiesRemaining()}`;
            } else {
                waveStatus.textContent = 'Press SPACE to start wave';
            }
        }
    }

    // Update HUD periodically
    setInterval(updateHUD, 100);

    // Handle start wave button
    const startWaveBtn = document.getElementById('start-wave');
    if (startWaveBtn) {
        startWaveBtn.addEventListener('click', () => {
            if (game.state === 'playing' && !game.waveInProgress) {
                game.startNextWave();
            }
        });
    }

    console.log('Tower Defense Game initialized!');
});
