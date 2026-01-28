import Config from '../config.js';

/**
 * WaveManager
 * Handles loading waves, spawning enemies over time, and tracking wave progress.
 */
export default class WaveManager {
    /**
     * @param {EntityManager} entityManager - Reference to the game entity manager.
     * @param {Object[]} waves - Array of wave definitions.
     */
    constructor(entityManager, waves) {
        this.entityManager = entityManager;
        this.waves = waves;
        this.currentWaveIndex = 0;
        this.isWaveActive = false;
        this.spawnTimer = 0;

        // Counters
        this.enemiesSpawned = 0;
        this.enemiesRemaining = 0;
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
            while (
                this.enemiesSpawned < this.enemiesSpawnedForType(waveEnemy) &&
                this.spawnTimer >= this.spawnTimeForType(waveEnemy)
            ) {
                // Spawn one enemy of this type
                const path = this.entityManager.path || [];
                this.entityManager.spawnEnemy(waveEnemy.type, path);
                this.enemiesSpawned++;
                this.spawnTimer = 0; // reset after each spawn
            }
        }

        // Check if all enemies in this wave are dead or have reached the end
        if (this.enemiesRemaining <= 0 && this.entityManager.enemies.length === 0) {
            // Wave finished
            this.isWaveActive = false;
            this.currentWaveIndex++;
            console.log('Wave completed.');
        }
    }

    /**
     * Counts how many enemies of a type have been spawned so far.
     * @param {*} typeObj
     */
    enemiesSpawnedForType(typeObj) {
        // The spawn timer is reset after each spawn, so we count per loop. Simplify:
        return 0; // TODO: implement per-type counter if needed.
    }

    /**
     * Calculates next spawn time for an enemy type based on interval.
     * @param {*} typeObj
     */
    spawnTimeForType(typeObj) {
        return typeObj.interval * 1000; // Convert seconds to ms
    }
}
