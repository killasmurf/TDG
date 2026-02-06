// Jest tests for WaveManager
import { jest } from '@jest/globals';

import Config from '../src/config.js';
import WaveManager from '../src/core/waveManager.js';
import { EventEmitter, GameEvents } from '../src/core/EventEmitter.js';

// Dummy EntityManager that records spawn/call counts
class DummyEntityManager {
    constructor() {
        this.spawned = [];
        this.enemies = [];
        this.listeners = {};
        this.path = [{ x: 0, y: 0 }, { x: 100, y: 100 }];
    }
    spawnEnemy(type, path) {
        this.spawned.push({ type, path });
        this.enemies.push({ type, active: true });
    }
    spawnTower() { }
    clear() { }
    update() { }
    on(event, callback) {
        this.listeners[event] = callback;
    }
    off(event, callback) {
        if (this.listeners[event] === callback) {
            delete this.listeners[event];
        }
    }
    // Helper to simulate enemy death
    killAllEnemies() {
        this.enemies = [];
        const killEvent = GameEvents.ENEMY_KILLED; // 'enemy:killed'
        if (this.listeners[killEvent]) {
            for (let i = 0; i < this.spawned.length; i++) {
                this.listeners[killEvent]();
            }
        }
    }
}

describe('WaveManager', () => {
    let entityManager;
    let waveManager;
    let events;

    beforeEach(() => {
        events = new EventEmitter();
        entityManager = new DummyEntityManager();
        waveManager = new WaveManager(entityManager, Config.waves || [], events);
    });

    test('startNextWave emits start event and initializes wave', () => {
        const startSpy = jest.fn();
        events.on('wave:started', startSpy);

        const result = waveManager.startNextWave();

        expect(result).toBe(true);
        expect(startSpy).toHaveBeenCalled();
        expect(waveManager.isWaveActive).toBe(true);
        expect(waveManager.getCurrentWaveNumber()).toBe(1);
    });

    test('update spawns enemies over time', () => {
        waveManager.startNextWave();

        // Initially no enemies spawned
        expect(entityManager.spawned.length).toBe(0);

        // Simulate enough time to spawn first enemy (interval is in seconds * 1000)
        const firstEnemyInterval = Config.waves[0].enemies[0].interval * 1000;
        waveManager.update(firstEnemyInterval + 1);

        // At least one enemy should be spawned
        expect(entityManager.spawned.length).toBeGreaterThan(0);
    });

    test('getter methods return correct values after wave start', () => {
        waveManager.startNextWave();

        expect(waveManager.getCurrentWaveNumber()).toBe(1);
        expect(waveManager.getTotalWaves()).toBe(Config.waves.length);

        const expectedTotal = Config.waves[0].enemies.reduce((sum, e) => sum + e.count, 0);
        expect(waveManager.getEnemiesRemaining()).toBe(expectedTotal);
        expect(waveManager.getTotalEnemiesInWave()).toBe(expectedTotal);
        expect(waveManager.isAllWavesComplete()).toBe(false);
    });

    test('wave completes when all enemies are killed', () => {
        const completedSpy = jest.fn();
        events.on('wave:completed', completedSpy);

        waveManager.startNextWave();

        // Spawn all enemies by updating with large time
        const totalEnemies = Config.waves[0].enemies.reduce((sum, e) => sum + e.count, 0);
        for (let i = 0; i < totalEnemies; i++) {
            waveManager.update(10000); // Large time to spawn next enemy
        }

        // Kill all enemies
        entityManager.killAllEnemies();

        // Update to trigger completion check
        waveManager.update(0);

        expect(completedSpy).toHaveBeenCalled();
        expect(waveManager.isWaveActive).toBe(false);
    });

    test('isAllWavesComplete returns true after all waves', () => {
        // Start and complete all waves
        for (let w = 0; w < Config.waves.length; w++) {
            waveManager.startNextWave();

            const totalEnemies = Config.waves[w].enemies.reduce((sum, e) => sum + e.count, 0);
            for (let i = 0; i < totalEnemies; i++) {
                waveManager.update(10000);
            }

            entityManager.killAllEnemies();
            entityManager.spawned = []; // Reset for next wave
            waveManager.update(0);
        }

        expect(waveManager.isAllWavesComplete()).toBe(true);
    });
});
