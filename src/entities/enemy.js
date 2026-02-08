/**
 * Enemy Class
 * Represents enemies in the tower defense game
 */

import BaseEntity from './baseEntity.js';
import Config from '../config.js';
import { GameEvents } from '../core/EventEmitter.js';
import { EnemyAnimator, AnimState } from './enemyAnimator.js';

class Enemy extends BaseEntity {
    constructor(x, y, type = 'basic') {
        const config = Config.enemy[type] || Config.enemy.basic;

        super(x, y, config.width, config.height);

        this.type = type;
        this.speed = config.speed;
        this.path = [];
        this.currentPathIndex = 0;
        this.damage = config.damage;
        this.reward = config.reward;
        this.color = config.color;
        this.health = config.health;
        this.maxHealth = config.health;

        // Animation system
        this.animator = new EnemyAnimator(type);
        this.dying = false; // true when playing death animation
    }

    /**
     * Initialize enemy with specific type and path
     * @param {Object} params - Initialization parameters
     * @param {string} params.type - Enemy type ('basic', 'fast', 'tank')
     * @param {Array} params.path - Path waypoints for enemy to follow
     * @param {number} params.x - Starting x position
     * @param {number} params.y - Starting y position
     */
    initialize(params = {}) {
        const type = params.type || 'basic';
        const config = Config.enemy[type] || Config.enemy.basic;

        // Set type-specific properties
        this.type = type;
        this.speed = config.speed;
        this.health = config.health;
        this.maxHealth = config.health;
        this.damage = config.damage;
        this.reward = config.reward;
        this.color = config.color;

        // Set path
        this.path = params.path || [];
        this.currentPathIndex = 0;

        // Reset animator for this type
        this.animator.reset(type);
        this.dying = false;

        // Call parent initialize for position and spawn hook
        super.initialize({
            x: params.x,
            y: params.y,
            health: config.health
        });
    }

    setPath(path) {
        this.path = path;
        this.currentPathIndex = 0;
    }

    /**
     * Lifecycle hook: Called when enemy spawns
     */
    onSpawn() {
        // Reset path progress when spawned
        this.currentPathIndex = 0;
        this.animator.setState(AnimState.WALK);
        this.dying = false;
    }

    /**
     * Lifecycle hook: Called when enemy is deactivated
     */
    onDeactivate() {
        // Clear references for garbage collection
        this.path = [];
        this.currentPathIndex = 0;
        this.dying = false;
    }

    /**
     * Override takeDamage to emit events
     */
    takeDamage(damage) {
        const previousHealth = this.health;
        super.takeDamage(damage);

        // Emit damage event
        this.events.emit(GameEvents.ENEMY_DAMAGED, {
            enemy: this,
            damage: damage,
            previousHealth: previousHealth,
            currentHealth: this.health
        });

        // Flash on hit
        this.animator.flash();

        // Emit killed event and trigger death animation if health reaches 0
        if (this.health <= 0 && previousHealth > 0) {
            this.dying = true;
            this.animator.setState(AnimState.DEATH);
            this.events.emit(GameEvents.ENEMY_KILLED, {
                enemy: this,
                type: this.type,
                reward: this.reward,
                position: { x: this.x, y: this.y }
            });
        }
    }

    update(deltaTime) {
        // Update animator regardless of state
        this.animator.update(deltaTime);

        // If playing death animation, wait until it completes before deactivating
        if (this.dying) {
            if (this.animator.isDeathComplete()) {
                this.active = false;
                this.dying = false;
            }
            return; // Don't move while dying
        }

        // Check if enemy has a path to follow
        if (this.path.length === 0 || !this.active) {
            return;
        }

        // Check if reached end of path
        if (this.currentPathIndex >= this.path.length) {
            console.log('🛑 Enemy at end index already, deactivating:', this.id);
            this.active = false;
            return;
        }

        // Calculate movement towards next waypoint
        const target = this.path[this.currentPathIndex];

        // Calculate direction to target
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Avoid division by zero
        if (distance < Config.path.waypointThreshold) {
            this.currentPathIndex++;
            console.log(`📍 Enemy reached waypoint ${this.currentPathIndex}/${this.path.length}`, {
                position: { x: this.x, y: this.y }
            });

            // If reached end of path, enemy is destroyed (reached base)
            if (this.currentPathIndex >= this.path.length) {
                console.log('🏁 Enemy reached END OF PATH! Emitting event...');
                this.active = false;
                this.events.emit(GameEvents.ENEMY_REACHED_END, {
                    enemy: this,
                    type: this.type,
                    damage: this.damage,
                    position: { x: this.x, y: this.y }
                });
            }
            return;
        }

        // Normalize direction
        const directionX = dx / distance;
        const directionY = dy / distance;

        // Move towards target
        this.x += directionX * this.speed * deltaTime;
        this.y += directionY * this.speed * deltaTime;
    }

    render(renderer) {
        // Use the animator to render the samurai model
        // Scale factor maps model to Config enemy size (basic=30px, fast=20px, tank=40px)
        const scale = this.height / 110; // 110 = model height in local units
        const ctx = renderer.ctx;

        // Render centered on enemy position (cx = center, cy = bottom of feet)
        this.animator.render(
            ctx,
            this.x + this.width / 2,   // center X
            this.y + this.height,       // bottom Y (feet)
            scale
        );

        // Draw health bar (skip if dying)
        if (!this.dying) {
            const healthBarWidth = this.width;
            const healthBarHeight = Config.ui.healthBar.height;
            const healthPercent = this.health / this.maxHealth;
            const healthBarY = this.y - Config.ui.healthBar.yOffset;

            renderer.drawRect(
                this.x,
                healthBarY,
                healthBarWidth,
                healthBarHeight,
                Config.ui.healthBar.backgroundColor
            );

            const healthColor = healthPercent > 0.5 ? 'green' :
                               healthPercent > 0.25 ? 'orange' : 'red';
            renderer.drawRect(
                this.x,
                healthBarY,
                healthBarWidth * healthPercent,
                healthBarHeight,
                healthColor
            );
        }
    }

    /**
     * Reset enemy for object pooling
     * @param {string} type - Enemy type to reset to
     */
    reset(type = 'basic') {
        // Call onDeactivate hook for cleanup before resetting
        this.onDeactivate();

        const config = Config.enemy[type] || Config.enemy.basic;

        this.x = 0;
        this.y = 0;
        this.type = type;
        this.health = config.health;
        this.maxHealth = config.health;
        this.speed = config.speed;
        this.damage = config.damage;
        this.reward = config.reward;
        this.color = config.color;
        this.active = true;
        this.pooled = true;
        this.path = [];
        this.currentPathIndex = 0;
        this.target = null;
        this.dying = false;
        this.animator.reset(type);
    }

    /**
     * Get progress along path (0-1)
     * @returns {number}
     */
    getProgress() {
        if (this.path.length === 0) return 0;
        return this.currentPathIndex / this.path.length;
    }
}

export default Enemy;
