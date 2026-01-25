/**
 * Tower Class
 * Represents towers in the tower defense game
 */

import BaseEntity from './baseEntity.js';
import Config from '../config.js';

class Tower extends BaseEntity {
    constructor(x, y, type = 'basic') {
        const config = Config.tower[type] || Config.tower.basic;

        super(x, y, config.width, config.height);

        this.type = type;
        this.damage = config.damage;
        this.range = config.range;
        this.fireRate = config.fireRate; // milliseconds
        this.lastFired = 0;
        this.target = null;
        this.projectileSpeed = config.projectileSpeed;
        this.color = config.color;
        this.cost = config.cost;

        // Reference to entity manager (set when spawned)
        this.entityManager = null;
    }

    setTarget(target) {
        this.target = target;
    }

    update(deltaTime, entityManager) {
        const currentTime = Date.now();

        // Check if tower has a target in range
        if (this.target && this.target.active) {
            // Calculate distance to target
            const dx = this.target.x - (this.x + this.width / 2);
            const dy = this.target.y - (this.y + this.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If in range, shoot at target
            if (distance <= this.range) {
                if (currentTime - this.lastFired > this.fireRate) {
                    this.fire(entityManager);
                    this.lastFired = currentTime;
                }
            } else {
                // Target out of range
                this.target = null;
            }
        } else {
            // No valid target
            this.target = null;
        }
    }

    fire(entityManager) {
        if (!this.target || !entityManager) return;

        // Spawn projectile through entity manager
        entityManager.spawnProjectile(this, this.target);
    }

    render(renderer) {
        // Draw tower body
        renderer.drawRect(this.x, this.y, this.width, this.height, this.color);

        // Draw tower center (barrel indicator)
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        renderer.drawCircle(centerX, centerY, 5, 'white');

        // Draw range indicator when targeting
        if (this.target && this.target.active) {
            renderer.drawCircleOutline(
                centerX,
                centerY,
                this.range,
                Config.ui.rangeIndicator.color,
                Config.ui.rangeIndicator.lineWidth
            );

            // Draw line to target
            renderer.drawLine(
                centerX,
                centerY,
                this.target.x + this.target.width / 2,
                this.target.y + this.target.height / 2,
                'rgba(255, 255, 0, 0.3)',
                1
            );
        }

        // Draw tower type indicator
        const typeColors = {
            basic: 'white',
            sniper: 'purple',
            rapid: 'cyan'
        };
        const indicatorColor = typeColors[this.type] || 'white';
        renderer.drawRect(this.x + 2, this.y + 2, 6, 6, indicatorColor);
    }

    /**
     * Upgrade tower stats
     * @param {string} upgradeType
     */
    upgrade(upgradeType) {
        switch (upgradeType) {
            case 'damage':
                this.damage *= 1.25;
                break;
            case 'range':
                this.range *= 1.15;
                break;
            case 'fireRate':
                this.fireRate *= 0.85; // Lower is faster
                break;
        }
    }

    /**
     * Get tower info for UI display
     * @returns {Object}
     */
    getInfo() {
        return {
            type: this.type,
            damage: Math.round(this.damage),
            range: Math.round(this.range),
            fireRate: this.fireRate,
            cost: this.cost
        };
    }
}

export default Tower;
