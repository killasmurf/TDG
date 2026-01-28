import Config from '../config.js';

/**
 * WaveManager
 * Handles loading waves, spawning enemies over time, and tracking wave progress.
 */
export default class WaveManager {
    /**
     * @param {EntityManager} entityManager - Reference to the game entity manager.
     * @param {Object[]} waves - Array of wave definitions.
     * @param {Function} onWaveComplete - Optional callback when a wave finishes.
     */
    constructor(entityManager, waves, onWaveComplete) {
        this.entityManager = entityManager;
        this.waves = waves;
        this.currentWaveIndex = 0;
        this.isWaveActive = false;
        this.spawnTimer = 0;
        this.spawnCounts = {}; // per-type spawn counter
        this.enemiesSpawned = 0;
        this.enemiesRemaining = 0;
        this.onWaveComplete = onWaveComplete;
    }

    /**
     * Starts the next wave if one is available.
     */
    startNextWave() {
        if (this.currentWaveIndex >= this.waves.length) {
            console.log('All waves completed!');
            return false;
        }
        const wave = this.waves[this.currentWaveIndex];
        this.enemiesSpawned = 0;
        this.enemiesRemaining = 0;
        wave.enemies.forEach(e => {
            this.enemiesRemaining += e.count;
        });
        this.isWaveActive = true;
        this.spawnTimer = 0;
        this.spawnCounts = {};
        console.log(`Starting wave ${this.currentWaveIndex + 1}`);
        return true;
    }

    /**
     * Updates the wave manager each frame.
     * @param {number} deltaTime - Time elapsed in milliseconds.
     */
    update(deltaTime) {
        if (!this.isWaveActive) return;

        const currentWave = this.waves[this.currentWaveIndex];
        this.spawnTimer += deltaTime;

        // Spawn enemies according to the schedules
        for (const waveEnemy of currentWave.enemies) {
            const type = waveEnemy.type;
            if (!this.spawnCounts[type]) this.spawnCounts[type] = 0;

            while (
                this.spawnCounts[type] < waveEnemy.count &&
                this.spawnTimer >= this.spawnTimeForType(waveEnemy)
            ) {
                const path = this.entityManager.path || [];
                this.entityManager.spawnEnemy(type, path);
                this.spawnCounts[type]++;
                this.spawnTimer = 0;
            }
        }

        // Check if all enemies in this wave are dead or have reached the end
        if (this.enemiesRemaining <= 0 && this.entityManager.enemies.length === 0) {
            // Wave finished
            this.isWaveActive = false;
            this.currentWaveIndex++;
            console.log('Wave completed.');
            this.onWaveComplete?.();
        }
    }

    /**
     * Calculates next spawn time for an enemy type based on interval.
     * @param {*} typeObj
     */
    spawnTimeForType(typeObj) {
        return typeObj.interval * 1000; // Convert seconds to ms
    }
}
