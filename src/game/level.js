/**
 * Level Class
 * Manages level data, waves, and progression
 */

import Config from '../config.js';

class Level {
    constructor(levelData) {
        this.id = levelData.id || 1;
        this.name = levelData.name || `Level ${this.id}`;

        // Path configuration
        this.path = levelData.path || [];

        // Starting resources
        this.startingLives = levelData.startingLives || Config.game.startingLives;
        this.startingMoney = levelData.startingMoney || Config.game.startingMoney;

        // Wave configuration
        this.waves = levelData.waves || [];
        this.currentWaveIndex = 0;

        // Map dimensions
        this.width = levelData.width || Config.canvas.width;
        this.height = levelData.height || Config.canvas.height;

        // Buildable areas (where towers can be placed)
        this.buildableAreas = levelData.buildableAreas || [];

        // Level completed flag
        this.completed = false;
    }

    /**
     * Get the current wave data
     * @returns {Object|null}
     */
    getCurrentWave() {
        if (this.currentWaveIndex >= this.waves.length) {
            return null;
        }
        return this.waves[this.currentWaveIndex];
    }

    /**
     * Advance to the next wave
     * @returns {boolean} True if there's a next wave, false if level complete
     */
    nextWave() {
        this.currentWaveIndex++;

        if (this.currentWaveIndex >= this.waves.length) {
            this.completed = true;
            return false;
        }

        return true;
    }

    /**
     * Check if position is buildable
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    isBuildable(x, y) {
        // If no buildable areas defined, everywhere is buildable (except path)
        if (this.buildableAreas.length === 0) {
            return true;
        }

        // Check if point is in any buildable area
        for (const area of this.buildableAreas) {
            if (
                x >= area.x &&
                x <= area.x + area.width &&
                y >= area.y &&
                y <= area.y + area.height
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get total number of waves
     * @returns {number}
     */
    getTotalWaves() {
        return this.waves.length;
    }

    /**
     * Get current wave number (1-indexed)
     * @returns {number}
     */
    getCurrentWaveNumber() {
        return this.currentWaveIndex + 1;
    }

    /**
     * Reset level to initial state
     */
    reset() {
        this.currentWaveIndex = 0;
        this.completed = false;
    }
}

/**
 * Wave Class
 * Defines a single wave of enemies
 */
class Wave {
    constructor(waveData) {
        this.enemies = waveData.enemies || [];
        this.spawnDelay = waveData.spawnDelay || 1000; // ms between spawns
        this.reward = waveData.reward || 0; // Bonus money for completing wave
    }

    /**
     * Get total number of enemies in wave
     * @returns {number}
     */
    getTotalEnemies() {
        return this.enemies.reduce((total, group) => total + group.count, 0);
    }

    /**
     * Generate enemy spawn sequence
     * @returns {Array} Array of enemy types to spawn in order
     */
    getSpawnSequence() {
        const sequence = [];

        for (const group of this.enemies) {
            for (let i = 0; i < group.count; i++) {
                sequence.push(group.type);
            }
        }

        // Shuffle if needed or keep in order
        return sequence;
    }
}

/**
 * LevelManager Class
 * Manages all levels in the game
 */
class LevelManager {
    constructor() {
        this.levels = new Map();
        this.currentLevelId = null;

        // Load built-in levels
        this.loadBuiltInLevels();
    }

    /**
     * Load the built-in game levels
     */
    loadBuiltInLevels() {
        // Level 1: Tutorial
        this.addLevel(new Level({
            id: 1,
            name: 'Tutorial Plains',
            startingLives: 25,
            startingMoney: 150,
            path: [
                { x: 0, y: 100 },
                { x: 200, y: 100 },
                { x: 200, y: 300 },
                { x: 600, y: 300 },
                { x: 600, y: 500 },
                { x: 800, y: 500 }
            ],
            waves: [
                new Wave({
                    enemies: [{ type: 'basic', count: 5 }],
                    spawnDelay: 1500,
                    reward: 25
                }),
                new Wave({
                    enemies: [{ type: 'basic', count: 8 }],
                    spawnDelay: 1200,
                    reward: 30
                }),
                new Wave({
                    enemies: [
                        { type: 'basic', count: 5 },
                        { type: 'fast', count: 3 }
                    ],
                    spawnDelay: 1000,
                    reward: 40
                })
            ]
        }));

        // Level 2: First Challenge
        this.addLevel(new Level({
            id: 2,
            name: 'Winding Path',
            startingLives: 20,
            startingMoney: 100,
            path: [
                { x: 0, y: 300 },
                { x: 150, y: 300 },
                { x: 150, y: 100 },
                { x: 400, y: 100 },
                { x: 400, y: 500 },
                { x: 650, y: 500 },
                { x: 650, y: 300 },
                { x: 800, y: 300 }
            ],
            waves: [
                new Wave({
                    enemies: [{ type: 'basic', count: 10 }],
                    spawnDelay: 1200,
                    reward: 30
                }),
                new Wave({
                    enemies: [
                        { type: 'fast', count: 8 },
                        { type: 'basic', count: 5 }
                    ],
                    spawnDelay: 1000,
                    reward: 40
                }),
                new Wave({
                    enemies: [{ type: 'tank', count: 3 }],
                    spawnDelay: 2000,
                    reward: 50
                }),
                new Wave({
                    enemies: [
                        { type: 'basic', count: 10 },
                        { type: 'fast', count: 5 },
                        { type: 'tank', count: 2 }
                    ],
                    spawnDelay: 800,
                    reward: 75
                })
            ]
        }));

        // Level 3: The Gauntlet
        this.addLevel(new Level({
            id: 3,
            name: 'The Gauntlet',
            startingLives: 15,
            startingMoney: 200,
            path: [
                { x: 0, y: 150 },
                { x: 100, y: 150 },
                { x: 100, y: 450 },
                { x: 250, y: 450 },
                { x: 250, y: 150 },
                { x: 400, y: 150 },
                { x: 400, y: 450 },
                { x: 550, y: 450 },
                { x: 550, y: 150 },
                { x: 700, y: 150 },
                { x: 700, y: 450 },
                { x: 800, y: 450 }
            ],
            waves: [
                new Wave({
                    enemies: [
                        { type: 'fast', count: 15 }
                    ],
                    spawnDelay: 600,
                    reward: 50
                }),
                new Wave({
                    enemies: [
                        { type: 'tank', count: 5 },
                        { type: 'basic', count: 10 }
                    ],
                    spawnDelay: 1000,
                    reward: 60
                }),
                new Wave({
                    enemies: [
                        { type: 'basic', count: 15 },
                        { type: 'fast', count: 10 },
                        { type: 'tank', count: 5 }
                    ],
                    spawnDelay: 500,
                    reward: 100
                })
            ]
        }));
    }

    /**
     * Add a level to the manager
     * @param {Level} level
     */
    addLevel(level) {
        this.levels.set(level.id, level);
    }

    /**
     * Get a level by ID
     * @param {number} id
     * @returns {Level|undefined}
     */
    getLevel(id) {
        return this.levels.get(id);
    }

    /**
     * Get all levels
     * @returns {Array<Level>}
     */
    getAllLevels() {
        return Array.from(this.levels.values());
    }

    /**
     * Set the current level
     * @param {number} id
     * @returns {Level|null}
     */
    setCurrentLevel(id) {
        const level = this.levels.get(id);
        if (level) {
            this.currentLevelId = id;
            level.reset();
            return level;
        }
        return null;
    }

    /**
     * Get the current level
     * @returns {Level|null}
     */
    getCurrentLevel() {
        if (this.currentLevelId === null) return null;
        return this.levels.get(this.currentLevelId);
    }

    /**
     * Advance to next level
     * @returns {Level|null}
     */
    nextLevel() {
        const nextId = (this.currentLevelId || 0) + 1;
        return this.setCurrentLevel(nextId);
    }

    /**
     * Get total number of levels
     * @returns {number}
     */
    getTotalLevels() {
        return this.levels.size;
    }
}

export { Level, Wave, LevelManager };
export default LevelManager;
