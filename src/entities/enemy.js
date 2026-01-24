/**
 * Enemy Class
 * Represents enemies in the tower defense game
 */

import BaseEntity from './baseEntity.js';

class Enemy extends BaseEntity {
    constructor(x, y, health = 100, speed = 1) {
        super(x, y, 32, 32);
        this.health = health;
        this.maxHealth = health;
        this.speed = speed;
        this.path = [];
        this.currentPathIndex = 0;
        this.damage = 10;
        this.reward = 10;
    }

    setPath(path) {
        this.path = path;
    }

    update(deltaTime) {
        if (this.path.length === 0) return;

        // Move towards next waypoint
        const target = this.path[this.currentPathIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed * deltaTime * 0.01) {
            // Reached current waypoint
            if (this.currentPathIndex < this.path.length - 1) {
                this.currentPathIndex++;
            } else {
                // Reached the end
                this.active = false;
            }
        } else {
            // Move towards target
            const moveX = (dx / distance) * this.speed * deltaTime * 0.01;
            const moveY = (dy / distance) * this.speed * deltaTime * 0.01;
            this.x += moveX;
            this.y += moveY;
        }
    }

    render(renderer) {
        // Draw enemy as a red rectangle
        renderer.drawRect(this.x, this.y, this.width, this.height, 'red');
        
        // Draw health bar
        const barWidth = this.width;
        const barHeight = 5;
        const healthPercent = this.health / this.maxHealth;
        
        renderer.drawRect(this.x, this.y - 10, barWidth, barHeight, 'gray');
        renderer.drawRect(this.x, this.y - 10, barWidth * healthPercent, barHeight, 'green');
    }
}

export default Enemy;
