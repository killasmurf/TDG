/**
 * Projectile Class
 * Represents projectiles fired by towers
 */

import BaseEntity from './baseEntity.js';

class Projectile extends BaseEntity {
    constructor(x, y, target, damage = 10) {
        super(x, y, 5, 5);
        this.target = target;
        this.damage = damage;
        this.speed = 8;
        this.active = true;
    }

    update(deltaTime) {
        if (!this.target || !this.target.active) {
            this.active = false;
            return;
        }

        // Calculate direction to target
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction
        const directionX = dx / distance;
        const directionY = dy / distance;
        
        // Move towards target
        this.x += directionX * this.speed * deltaTime;
        this.y += directionY * this.speed * deltaTime;
        
        // Check collision with target
        if (distance < 10) { // Threshold for reaching target
            this.target.takeDamage(this.damage);
            this.active = false;
        }
    }

    render(renderer) {
        // Draw projectile as a small yellow circle
        renderer.drawCircle(this.x, this.y, 3, 'yellow');
    }
}

export default Projectile;
