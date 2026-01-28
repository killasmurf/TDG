// src/core/waveManager.js
export default class WaveManager {
    constructor(entityManager, waves, onWaveComplete) {
        this.entityManager = entityManager;
        this.waves = waves;
        this.currentWaveIndex = 0;
        this.isWaveActive = false;
        this.spawnTimer = 0;
        this.spawnCounts = {};
        this.enemiesSpawned = 0;
        this.enemiesRemaining = 0;
        this.onWaveComplete = onWaveComplete;
        this.enemyKilledListener = null;
        this.enemyReachedEndListener = null;
    }

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
        return true;
    }

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
            // Clean up listeners after wave ends to avoid duplicate counts
            if (this.enemyKilledListener) {
                this.entityManager.off('ENEMY_KILLED', this.enemyKilledListener);
                this.enemyKilledListener = null;
            }
            if (this.enemyReachedEndListener) {
                this.entityManager.off('ENEMY_REACHED_END', this.enemyReachedEndListener);
                this.enemyReachedEndListener = null;
            }
        }
    }

    spawnTimeForType(typeObj) {
        return typeObj.interval * 1000; // Convert seconds to ms
    }
}
