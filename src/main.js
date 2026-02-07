// src/main.js - Game entry point
import Game from './core/game.js';

console.log('[Main] Script loaded');

function showError(msg) {
    const el = document.getElementById('error-display');
    if (el) { el.style.display = 'block'; el.textContent += msg + '\n'; }
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Main] DOM ready, creating game...');

    try {
        // Create game instance
        const game = new Game('gameCanvas');
        console.log('[Main] Game created, state:', game.state);

        // Initialize the game
        game.init();
        console.log('[Main] Game initialized, state:', game.state, 'isRunning:', game.isRunning);

        // Show/hide HUD based on game state
        const hud = document.getElementById('hud');
        function updateHUD() {
            // Only show HUD during gameplay
            if (hud) {
                if (game.state === 'playing') {
                    hud.classList.add('visible');
                } else {
                    hud.classList.remove('visible');
                }
            }

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

        console.log('[Main] Tower Defense Game initialized!');
    } catch (err) {
        console.error('[Main] Init error:', err);
        showError('INIT ERROR: ' + (err.stack || err.message || err));
    }
});
