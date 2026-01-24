/**
 * Enemy Class
 * Represents enemies in the tower defense game
 */

import BaseEntity from './baseEntity.js';

class Enemy extends BaseEntity {
    constructor(x, y) {
        super(x, y, 30, 30);
        this.speed = 2;
        this.path = [];
        this.currentPathIndex = 0;
        this.damage = 10;
        this.reward = 10;
    }

    setPath(path) {
        this.path = path;
    }

    update(deltaTime) {
        // Check if enemy has a path to follow
        if (this.path.length === 0 || !this.active) {
            return;
        }

        // Calculate movement towards next waypoint
        const target = this.path[this.currentPathIndex];
        
        // Calculate direction to target
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction
        const directionX = dx / distance;
        const directionY = dy / distance;
        
        // Move towards target
        this.x += directionX * this.speed * deltaTime;
        this.y += directionY * this.speed * deltaTime;
        
        // Check if reached target waypoint
        if (distance < 5) { // Threshold for reaching waypoint
            this.currentPathIndex++;
            
            // If reached end of path, enemy is destroyed
            if (this.currentPathIndex >= this.path.length) {
                this.active = false;
            }
        }
    }

    render(renderer) {
        // Draw enemy as a red rectangle
        renderer.drawRect(this.x, this.y, this.width, this.height, 'red');
        
        // Draw health bar
        const healthBarWidth = this.width;
        const healthBarHeight = 5;
        const healthPercent = this.health / this.maxHealth;
        
        // Background of health bar (gray)
        renderer.drawRect(this.x, this.y - 10, healthBarWidth, healthBarHeight, 'gray');
        
        // Foreground of health bar (green)
        renderer.drawRect(this.x, this.y - 10, healthBarWidth * healthPercent, healthBarHeight, 'green');
    }
}

export default Enemy;
