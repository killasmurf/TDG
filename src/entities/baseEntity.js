/**
 * Base Entity Class
 * All game entities should extend this class
 */

class BaseEntity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = 100;
        this.maxHealth = 100;
        this.active = true;
    }

    update(deltaTime) {
        // Override this method with entity-specific update logic
    }

    render(renderer) {
        // Override this method with entity-specific render logic
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.active = false;
        }
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    isCollidingWith(entity) {
        return (
            this.x < entity.x + entity.width &&
            this.x + this.width > entity.x &&
            this.y < entity.y + entity.height &&
            this.y + this.height > entity.y
        );
    }

    /**
     * Check if a point is inside this entity
     * @param {number} px
     * @param {number} py
     * @returns {boolean}
     */
    containsPoint(px, py) {
        return (
            px >= this.x &&
            px <= this.x + this.width &&
            py >= this.y &&
            py <= this.y + this.height
        );
    }

    /**
     * Get the center position of this entity
     * @returns {{x: number, y: number}}
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    /**
     * Get distance to another entity
     * @param {BaseEntity} entity
     * @returns {number}
     */
    distanceTo(entity) {
        const dx = entity.x - this.x;
        const dy = entity.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get distance to a point
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    distanceToPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Move entity by a delta
     * @param {number} dx
     * @param {number} dy
     */
    moveBy(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    /**
     * Reset entity to default state (for object pooling)
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.health = this.maxHealth;
        this.active = true;
    }

    /**
     * Get bounding box for collision detection
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

export default BaseEntity;
