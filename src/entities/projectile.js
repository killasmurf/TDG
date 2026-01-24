/**
 * Projectile Class
 * Represents projectiles fired by towers
 */

import BaseEntity from './baseEntity.js';

class Projectile extends BaseEntity {
    constructor(x, y, target, damage = 10, speed = 5) {
        super(x, y, 8, 8);
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.active = true;
    }

    update(deltaTime) {
        if (!this.target || !this.target.active) {
            this.active = false;
            return;
        }

        // Move towards target
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed * deltaTime * 0.01) {
            // Hit target
            this.hitTarget();
            this.active = false;
            return;
        }

        // Move towards target
        const moveX = (dx / distance) * this.speed * deltaTime * 0.01;
        const moveY = (dy / distance) * this.speed * deltaTime * 0.01;
        this.x += moveX;
        this.y += moveY;
    }

    hitTarget() {
        if (this.target && this.target.active) {
            this.target.takeDamage(this.damage);
        }
    }

    render(renderer) {
        // Draw projectile as a yellow circle
        renderer.ctx.fillStyle = 'yellow';
        renderer.ctx.beginPath();
        renderer.ctx.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
        renderer.ctx.fill();
    }
}

export default Projectile;
