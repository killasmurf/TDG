// src/main.js (excerpt)

import WaveManager from './core/waveManager.js';
import EntityManager from './core/entityManager.js';
import Config from './config.js';

const entityManager = new EntityManager();
const waveData = require('../data/waves.json');
const waveManager = new WaveManager(entityManager, waveData, () => {
    console.log('Wave complete hook');
});

// Attach to game (assume game object exists)
const game = new Game(entityManager, waveManager);

// Start the first wave automatically
waveManager.startNextWave();

// Button
document.getElementById('start-wave').addEventListener('click', () => {
    waveManager.startNextWave();
});

// Update loop
function loop(deltaTime) {
    waveManager.update(deltaTime);
    entityManager.update(deltaTime);
    // ... rendering
}
