/**
 * Projectile Class
 * Represents projectiles fired by towers
 */

import BaseEntity from './baseEntity.js';
import Config from '../config.js';

class Projectile extends BaseEntity {
    constructor(x, y, target, damage = Config.projectile.damage) {
        super(x, y, Config.projectile.width, Config.projectile.height);

        this.target = target;
        this.damage = damage;
        this.speed = Config.projectile.speed;
        this.active = true;
        this.color = Config.projectile.color;
    }

    /**
     * Initialize projectile with target and damage
     * @param {Object} params - Initialization parameters
     * @param {number} params.x - Starting x position
     * @param {number} params.y - Starting y position
     * @param {BaseEntity} params.target - Target enemy entity
     * @param {number} params.damage - Damage to deal
     */
    initialize(params = {}) {
        this.target = params.target || null;
        this.damage = params.damage || Config.projectile.damage;
        this.speed = Config.projectile.speed;
        this.color = Config.projectile.color;

        // Call parent initialize for position and spawn hook
        super.initialize({
            x: params.x,
            y: params.y
        });
    }

    /**
     * Lifecycle hook: Called when projectile spawns
     */
    onSpawn() {
        // Projectile is ready to track target
    }

    /**
     * Lifecycle hook: Called when projectile is deactivated
     */
    onDeactivate() {
        // Clear target reference for garbage collection
        this.target = null;
    }

    update(deltaTime) {
        if (!this.target || !this.target.active) {
            this.active = false;
            return;
        }

        // Calculate direction to target center
        const targetCenterX = this.target.x + this.target.width / 2;
        const targetCenterY = this.target.y + this.target.height / 2;

        const dx = targetCenterX - this.x;
        const dy = targetCenterY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check collision with target
        if (distance < Config.projectile.hitThreshold) {
            this.target.takeDamage(this.damage);
            this.active = false;
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
        // Draw projectile as a small yellow circle
        renderer.drawCircle(this.x, this.y, 3, this.color);

        // Optional: Draw trail effect
        renderer.drawCircle(this.x - 2, this.y - 2, 2, 'rgba(255, 255, 0, 0.5)');
    }

    /**
     * Reset projectile for object pooling
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.target = null;
        this.damage = Config.projectile.damage;
        this.speed = Config.projectile.speed;
        this.active = true;
    }
}

export default Projectile;
