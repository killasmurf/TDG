/**
 * Tower Class
 * Represents towers in the tower defense game
 */

import BaseEntity from './baseEntity.js';

class Tower extends BaseEntity {
    constructor(x, y, type = 'basic') {
        super(x, y, 40, 40);
        this.type = type;
        this.damage = 10;
        this.range = 100;
        this.fireRate = 1000; // milliseconds
        this.lastFired = 0;
        this.target = null;
        this.projectileSpeed = 5;
    }

    setTarget(target) {
        this.target = target;
    }

    update(deltaTime) {
        const currentTime = Date.now();
        
        // Check if tower has a target in range
        if (this.target && this.target.active) {
            // Calculate distance to target
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If in range, shoot at target
            if (distance <= this.range) {
                if (currentTime - this.lastFired > this.fireRate) {
                    this.fire();
                    this.lastFired = currentTime;
                }
            } else {
                // No target in range
                this.target = null;
            }
        } else {
            // No target, will look for one
            this.target = null;
        }
    }

    fire() {
        // Fire projectile - this would be implemented in the game's projectile system
        console.log('Tower fired at enemy');
    }

    render(renderer) {
        // Draw tower as a blue rectangle
        renderer.drawRect(this.x, this.y, this.width, this.height, 'blue');
        
        // Draw range indicator
        if (this.target && this.target.active) {
            renderer.ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
            renderer.ctx.lineWidth = 1;
            renderer.ctx.beginPath();
            renderer.ctx.arc(this.x + this.width/2, this.y + this.height/2, this.range, 0, Math.PI * 2);
            renderer.ctx.stroke();
        }
    }
}

export default Tower;
