/**
 * Enemy Class
 * Represents enemies in the tower defense game
 */

import BaseEntity from './baseEntity.js';
import Config from '../config.js';

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
    }

    setPath(path) {
        this.path = path;
        this.currentPathIndex = 0;
    }

    update(deltaTime) {
        // Check if enemy has a path to follow
        if (this.path.length === 0 || !this.active) {
            return;
        }

        // Check if reached end of path
        if (this.currentPathIndex >= this.path.length) {
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

            // If reached end of path, enemy is destroyed (reached base)
            if (this.currentPathIndex >= this.path.length) {
                this.active = false;
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
        // Draw enemy body
        renderer.drawRect(this.x, this.y, this.width, this.height, this.color);

        // Draw health bar
        const healthBarWidth = this.width;
        const healthBarHeight = Config.ui.healthBar.height;
        const healthPercent = this.health / this.maxHealth;
        const healthBarY = this.y - Config.ui.healthBar.yOffset;

        // Background of health bar (gray)
        renderer.drawRect(
            this.x,
            healthBarY,
            healthBarWidth,
            healthBarHeight,
            Config.ui.healthBar.backgroundColor
        );

        // Foreground of health bar (green to red based on health)
        const healthColor = healthPercent > 0.5 ? 'green' :
                           healthPercent > 0.25 ? 'orange' : 'red';
        renderer.drawRect(
            this.x,
            healthBarY,
            healthBarWidth * healthPercent,
            healthBarHeight,
            healthColor
        );

        // Draw enemy type indicator
        if (this.type === 'fast') {
            // Draw speed lines
            renderer.drawLine(
                this.x - 5, this.y + this.height / 2,
                this.x - 10, this.y + this.height / 2 - 3,
                'white', 1
            );
            renderer.drawLine(
                this.x - 5, this.y + this.height / 2,
                this.x - 10, this.y + this.height / 2 + 3,
                'white', 1
            );
        } else if (this.type === 'tank') {
            // Draw armor indicator
            renderer.drawRect(
                this.x + 2, this.y + 2,
                this.width - 4, this.height - 4,
                'rgba(255, 255, 255, 0.3)'
            );
        }
    }

    /**
     * Reset enemy for object pooling
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.active = true;
        this.path = [];
        this.currentPathIndex = 0;
        this.target = null;
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
