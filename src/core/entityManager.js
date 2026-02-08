/**
 * Entity Manager
 * Manages all game entities with object pooling for performance optimization
 */

import Tower from '../entities/tower.js';
import Enemy from '../entities/enemy.js';
import Projectile from '../entities/projectile.js';
import Config from '../config.js';
import { gameEvents, GameEvents } from './EventEmitter.js';

/**
 * Object Pool for entity recycling
 */
class ObjectPool {
    constructor(factory, initialSize = 20) {
        this.factory = factory;
        this.pool = [];
        this.activeCount = 0;

        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
        }
    }

    /**
     * Get an object from the pool
     * @returns {Object}
     */
    acquire() {
        let obj;

        if (this.pool.length > 0) {
            obj = this.pool.pop();
            obj.pooled = false; // Mark as no longer pooled
        } else {
            obj = this.factory();
        }

        this.activeCount++;
        return obj;
    }

    /**
     * Return an object to the pool
     * Calls reset() method which triggers onDeactivate() lifecycle hook
     * @param {Object} obj
     */
    release(obj) {
        if (obj.reset) {
            obj.reset(); // This now calls onDeactivate() lifecycle hook
        }
        this.pool.push(obj);
        this.activeCount--;
    }

    /**
     * Get the number of active objects
     * @returns {number}
     */
    getActiveCount() {
        return this.activeCount;
    }

    /**
     * Get the number of pooled objects
     * @returns {number}
     */
    getPooledCount() {
        return this.pool.length;
    }

    /**
     * Clear the pool
     */
    clear() {
        this.pool = [];
        this.activeCount = 0;
    }
}

/**
 * Entity Manager Class
 */
class EntityManager {
    constructor(game) {
        this.game = game;

        // Entity collections
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];

        // Object pools for frequently created/destroyed entities
        this.enemyPool = new ObjectPool(() => new Enemy(0, 0), 50);
        this.projectilePool = new ObjectPool(() => new Projectile(0, 0, null), 100);

        // Reference to global event emitter
        this.events = gameEvents;

        // Set up internal event listeners for entity cleanup
        this.setupEventListeners();
    }

    /**
     * Set up event listeners for entity management
     * INTERNAL USE ONLY - Game logic should subscribe to events directly
     */
    setupEventListeners() {
        // Listen for enemy events (for internal entity management only)
        // External systems (like Game) should subscribe to these events directly
        // This just handles internal cleanup/tracking if needed
    }

    /**
     * Subscribe to game events
     * Convenience method for external systems to subscribe to events
     * @param {string} eventType - Event type from GameEvents
     * @param {Function} callback - Callback function
     * @param {Object} context - Optional context to bind callback to
     */
    on(eventType, callback, context = null) {
        this.events.on(eventType, callback, context);
    }

    /**
     * Unsubscribe from game events
     * @param {string} eventType - Event type
     * @param {Function} callback - Callback to remove
     */
    off(eventType, callback) {
        this.events.off(eventType, callback);
    }

    /**
     * Update all entities
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // Update towers
        for (const tower of this.towers) {
            if (tower.active) {
                tower.update(deltaTime, this);
            }
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (enemy.active) {
                const previousPathIndex = enemy.currentPathIndex;
                enemy.update(deltaTime);

                // Check if enemy reached end of path
                if (!enemy.active && enemy.currentPathIndex >= enemy.path.length) {
                    this.handleEnemyReachedEnd(enemy);
                    this.releaseEnemy(enemy, i);
                } else if (!enemy.active) {
                    // Enemy was killed
                    this.handleEnemyKilled(enemy);
                    this.releaseEnemy(enemy, i);
                }
            } else {
                this.releaseEnemy(enemy, i);
            }
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];

            if (projectile.active) {
                projectile.update(deltaTime);
            }

            if (!projectile.active) {
                this.releaseProjectile(projectile, i);
            }
        }
    }

    /**
     * Render all entities
     * @param {Renderer} renderer
     */
    render(renderer) {
        // Render order: towers (bottom), enemies, projectiles (top)

        // Render towers
        for (const tower of this.towers) {
            if (tower.active) {
                tower.render(renderer);
            }
        }

        // Render enemies
        for (const enemy of this.enemies) {
            if (enemy.active) {
                enemy.render(renderer);
            }
        }

        // Render projectiles
        for (const projectile of this.projectiles) {
            if (projectile.active) {
                projectile.render(renderer);
            }
        }
    }

    /**
     * Spawn a tower at the given position
     * @param {string} type - Tower type
     * @param {number} x
     * @param {number} y
     * @returns {Tower}
     */
    spawnTower(type, x, y) {
        const tower = new Tower(x, y, type);
        // Removed: tower.entityManager = this; (circular reference removed)
        this.towers.push(tower);
        return tower;
    }

    /**
     * Spawn an enemy with the given path
     * @param {string} type - Enemy type
     * @param {Array} path - Waypoints array
     * @returns {Enemy}
     */
    spawnEnemy(type, path) {
        const enemy = this.enemyPool.acquire();

        // Use new initialize() method instead of manual property setting
        enemy.initialize({
            type: type,
            path: [...path], // Clone path
            x: path[0]?.x || 0,
            y: path[0]?.y || 0
        });

        this.enemies.push(enemy);
        return enemy;
    }

    /**
     * Spawn a projectile from a tower towards a target
     * @param {Tower} tower
     * @param {Enemy} target
     * @returns {Projectile}
     */
    spawnProjectile(tower, target) {
        const projectile = this.projectilePool.acquire();

        // Use new initialize() method instead of manual property setting
        projectile.initialize({
            x: tower.x + tower.width / 2,
            y: tower.y + tower.height / 2,
            target: target,
            damage: tower.damage
        });

        this.projectiles.push(projectile);
        return projectile;
    }

    /**
     * Release an enemy back to the pool
     * @param {Enemy} enemy
     * @param {number} index
     */
    releaseEnemy(enemy, index) {
        this.enemies.splice(index, 1);
        this.enemyPool.release(enemy);
    }

    /**
     * Release a projectile back to the pool
     * @param {Projectile} projectile
     * @param {number} index
     */
    releaseProjectile(projectile, index) {
        this.projectiles.splice(index, 1);
        this.projectilePool.release(projectile);
    }

    /**
     * @deprecated Use event system instead: gameEvents.on(GameEvents.ENEMY_REACHED_END, callback)
     * Handle enemy reaching end of path (kept for backward compatibility)
     * @param {Enemy} enemy
     */
    handleEnemyReachedEnd(enemy) {
        // Events are now emitted by Enemy class directly
        // This method kept for backward compatibility only
        if (this.game && this.game.enemyReachedEnd) {
            this.game.enemyReachedEnd(enemy);
        }
    }

    /**
     * @deprecated Use event system instead: gameEvents.on(GameEvents.ENEMY_KILLED, callback)
     * Handle enemy being killed (kept for backward compatibility)
     * @param {Enemy} enemy
     */
    handleEnemyKilled(enemy) {
        // Events are now emitted by Enemy class directly
        // This method kept for backward compatibility only
        if (this.game && this.game.enemyKilled) {
            this.game.enemyKilled(enemy);
        }
    }

    /**
     * Remove a tower
     * @param {Tower} tower
     */
    removeTower(tower) {
        const index = this.towers.indexOf(tower);
        if (index !== -1) {
            this.towers.splice(index, 1);
        }
    }

    /**
     * Get entities by type
     * @param {string} type - 'tower', 'enemy', or 'projectile'
     * @returns {Array}
     */
    getEntitiesByType(type) {
        switch (type) {
            case 'tower':
                return this.towers.filter(t => t.active);
            case 'enemy':
                return this.enemies.filter(e => e.active);
            case 'projectile':
                return this.projectiles.filter(p => p.active);
            default:
                return [];
        }
    }

    /**
     * Get all active entities
     * @returns {Array}
     */
    getAllEntities() {
        return [
            ...this.towers.filter(t => t.active),
            ...this.enemies.filter(e => e.active),
            ...this.projectiles.filter(p => p.active)
        ];
    }

    /**
     * Find enemies within range of a position
     * @param {number} x
     * @param {number} y
     * @param {number} range
     * @returns {Array<Enemy>}
     */
    findEnemiesInRange(x, y, range) {
        return this.enemies.filter(enemy => {
            if (!enemy.active || enemy.dying) return false;

            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            return distance <= range;
        });
    }

    /**
     * Find the closest enemy to a position
     * @param {number} x
     * @param {number} y
     * @param {number} maxRange
     * @returns {Enemy|null}
     */
    findClosestEnemy(x, y, maxRange = Infinity) {
        let closest = null;
        let closestDistance = Infinity;

        for (const enemy of this.enemies) {
            if (!enemy.active || enemy.dying) continue;

            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < closestDistance && distance <= maxRange) {
                closestDistance = distance;
                closest = enemy;
            }
        }

        return closest;
    }

    /**
     * Clear all entities
     */
    clear() {
        // Return enemies to pool
        for (const enemy of this.enemies) {
            this.enemyPool.release(enemy);
        }

        // Return projectiles to pool
        for (const projectile of this.projectiles) {
            this.projectilePool.release(projectile);
        }

        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
    }

    /**
     * Get entity counts for debugging
     * @returns {Object}
     */
    getStats() {
        return {
            towers: this.towers.length,
            enemies: this.enemies.length,
            projectiles: this.projectiles.length,
            pooledEnemies: this.enemyPool.getPooledCount(),
            pooledProjectiles: this.projectilePool.getPooledCount()
        };
    }
}

export default EntityManager;
