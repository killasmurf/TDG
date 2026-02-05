// src/core/waveManager.js
import { GameEvents } from './EventEmitter.js';

/**
 * WaveManager
 * Manages enemy waves, counting, spawning and wave completion.
 */
export default class WaveManager {
    constructor(entityManager, waves, eventEmitter) {
        this.entityManager = entityManager;
        this.waves = waves;
        this.currentWaveIndex = 0;
        this.isWaveActive = false;
        this.spawnTimer = 0;
        this.spawnCounts = {};
        this.enemiesSpawned = 0;
        this.enemiesRemaining = 0;
        this.eventEmitter = eventEmitter;
        this.enemyKilledListener = null;
        this.enemyReachedEndListener = null;
    }

    /**
     * Start the next wave if available
     */
    startNextWave() {
        if (this.currentWaveIndex >= this.waves.length) {
            console.log('All waves completed!');
            this.eventEmitter.emit('wave:completed');
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

        // Attach listeners to track enemies
        if (!this.enemyKilledListener) {
            this.enemyKilledListener = () => {
                this.enemiesRemaining = Math.max(0, this.enemiesRemaining - 1);
            };
            this.entityManager.on('ENEMY_KILLED', this.enemyKilledListener);
        }
        if (!this.enemyReachedEndListener) {
            this.enemyReachedEndListener = () => {
                this.enemiesRemaining = Math.max(0, this.enemiesRemaining - 1);
            };
            this.entityManager.on('ENEMY_REACHED_END', this.enemyReachedEndListener);
        }
        console.log(`Starting wave ${this.currentWaveIndex + 1}`);
        this.eventEmitter.emit('wave:started');
        return true;
    }

    update(deltaTime) {
        if (!this.isWaveActive) return;

        const currentWave = this.waves[this.currentWaveIndex];
        this.spawnTimer += deltaTime;

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

        if (this.enemiesRemaining <= 0 && this.entityManager.enemies.length === 0) {
            this.isWaveActive = false;
            this.currentWaveIndex++;
            console.log('Wave completed.');
            // Clean up listeners
            if (this.enemyKilledListener) {
                this.entityManager.off('ENEMY_KILLED', this.enemyKilledListener);
                this.enemyKilledListener = null;
            }
            if (this.enemyReachedEndListener) {
                this.entityManager.off('ENEMY_REACHED_END', this.enemyReachedEndListener);
                this.enemyReachedEndListener = null;
            }
            this.eventEmitter.emit('wave:completed');
        }
    }

    spawnTimeForType(typeObj) {
        return typeObj.interval * 1000;
    }

    getCurrentWaveNumber() { return this.currentWaveIndex + 1; }
    getTotalWaves() { return this.waves.length; }
    getEnemiesRemaining() { return this.enemiesRemaining; }
    getTotalEnemiesInWave() {
        const wave = this.waves[this.currentWaveIndex];
        return wave ? wave.enemies.reduce((sum, e) => sum + e.count, 0) : 0;
    }
    isAllWavesComplete() {
        return this.currentWaveIndex >= this.waves.length && !this.isWaveActive;
    }
}
