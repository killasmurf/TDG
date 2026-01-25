/**
 * Tower Class
 * Represents towers in the tower defense game
 */

import BaseEntity from './baseEntity.js';
import Config from '../config.js';
import { GameEvents } from '../core/EventEmitter.js';

class Tower extends BaseEntity {
    constructor(x, y, type = 'basic') {
        const config = Config.tower[type] || Config.tower.basic;

        super(x, y, config.width, config.height);

        this.type = type;
        this.damage = config.damage;
        this.range = config.range;
        this.fireRate = config.fireRate; // milliseconds
        this.fireTimer = 0; // Accumulator for deltaTime-based firing
        this.target = null;
        this.projectileSpeed = config.projectileSpeed;
        this.color = config.color;
        this.cost = config.cost;

        // Reference to entity manager (set when spawned)
        this.entityManager = null;
    }

    /**
     * Initialize tower with specific type and position
     * @param {Object} params - Initialization parameters
     * @param {string} params.type - Tower type ('basic', 'sniper', 'rapid')
     * @param {number} params.x - Tower x position
     * @param {number} params.y - Tower y position
     */
    initialize(params = {}) {
        const type = params.type || 'basic';
        const config = Config.tower[type] || Config.tower.basic;

        // Set type-specific properties
        this.type = type;
        this.damage = config.damage;
        this.range = config.range;
        this.fireRate = config.fireRate;
        this.fireTimer = 0;
        this.projectileSpeed = config.projectileSpeed;
        this.color = config.color;
        this.cost = config.cost;

        // Clear target reference
        this.target = null;

        // Call parent initialize for position and spawn hook
        super.initialize({
            x: params.x,
            y: params.y
        });
    }

    setTarget(target) {
        const hadTarget = this.target !== null;
        this.target = target;

        // Emit target acquired event if newly targeted
        if (!hadTarget && target !== null) {
            this.events.emit(GameEvents.TOWER_TARGET_ACQUIRED, {
                tower: this,
                target: target,
                position: { x: this.x, y: this.y }
            });
        }
    }

    /**
     * Lifecycle hook: Called when tower spawns
     */
    onSpawn() {
        // Reset firing timer when spawned
        this.fireTimer = 0;
        this.target = null;
    }

    /**
     * Lifecycle hook: Called when tower is deactivated
     */
    onDeactivate() {
        // Clear references for garbage collection
        this.target = null;
        this.entityManager = null;
    }

    update(deltaTime, entityManager) {
        // Accumulate time for fire rate (deltaTime is in seconds, fireRate is in ms)
        this.fireTimer += deltaTime * 1000;

        // Check if tower has a target in range
        if (this.target && this.target.active) {
            // Calculate distance to target
            const dx = this.target.x - (this.x + this.width / 2);
            const dy = this.target.y - (this.y + this.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If in range, shoot at target
            if (distance <= this.range) {
                if (this.fireTimer >= this.fireRate) {
                    this.fire(entityManager);
                    this.fireTimer = 0; // Reset timer
                }
            } else {
                // Target out of range
                const lostTarget = this.target;
                this.target = null;
                this.events.emit(GameEvents.TOWER_TARGET_LOST, {
                    tower: this,
                    previousTarget: lostTarget,
                    reason: 'out_of_range'
                });
            }
        } else {
            // No valid target
            if (this.target !== null) {
                const lostTarget = this.target;
                this.target = null;
                this.events.emit(GameEvents.TOWER_TARGET_LOST, {
                    tower: this,
                    previousTarget: lostTarget,
                    reason: 'target_inactive'
                });
            }
        }
    }

    fire(entityManager) {
        if (!this.target || !entityManager) return;

        // Spawn projectile through entity manager
        entityManager.spawnProjectile(this, this.target);

        // Emit tower fired event
        this.events.emit(GameEvents.TOWER_FIRED, {
            tower: this,
            target: this.target,
            damage: this.damage,
            position: { x: this.x, y: this.y }
        });
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
