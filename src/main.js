// src/main.js - Game entry point
import Game from './core/game.js';

// Global error handler
window.onerror = function(message, source, lineno, colno, error) {
    console.error('[GLOBAL ERROR]', message, 'at', source, lineno, colno);
    console.error(error);
    return false;
};

window.addEventListener('unhandledrejection', function(event) {
    console.error('[UNHANDLED PROMISE]', event.reason);
});

console.log('[Main] Script loaded');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Main] DOM ready, creating game...');

    // Create game instance
    const game = new Game('gameCanvas');
    console.log('[Main] Game created, state:', game.state);

    // Initialize the game
    console.log('[Main] Initializing game...');
    game.init();
    console.log('[Main] Game initialized, state:', game.state, 'isRunning:', game.isRunning);

    // Note: Default map will be loaded when user selects "Play Game" from main menu
    // Game starts at main menu state where user can select map, change settings, or exit

    // Handle click to start from menu (old "click to start" screen)
    document.addEventListener('click', (e) => {
        console.log('Click detected, game state:', game.state);
        if (game.state === 'menu') {
            console.log('Starting game from menu...');
            game.startGame();
            console.log('Game state after startGame:', game.state);
        }
    }, { once: false });

    // Map loading is now handled through the in-game main menu
    // The HTML map selector UI is hidden (see index.html)
    // Legacy code below kept for reference but not used:
    /*
    const mapSelect = document.getElementById('map-select');
    const loadMapBtn = document.getElementById('load-map');
    const mapInfo = document.getElementById('map-info');

    if (loadMapBtn && mapSelect) {
        loadMapBtn.addEventListener('click', async () => {
            const selectedMap = mapSelect.value;
            console.log('[Main] Loading map:', selectedMap);
            mapInfo.textContent = 'Loading map...';
            loadMapBtn.disabled = true;
            const success = await game.loadMapFromFile(selectedMap);
            if (success) {
                mapInfo.textContent = `Loaded: ${game.currentMapName || 'Unknown'}`;
                if (game.state === 'playing' || game.state === 'pauseMenu') {
                    game.exitToMenu();
                }
            } else {
                mapInfo.textContent = 'Failed to load map. Using default.';
            }
            loadMapBtn.disabled = false;
        });
        mapSelect.addEventListener('change', () => {
            const selectedOption = mapSelect.options[mapSelect.selectedIndex];
            mapInfo.textContent = selectedOption.textContent;
        });
    }
    */

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
