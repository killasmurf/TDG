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
            this.active = false;
        }
    }

    isCollidingWith(entity) {
        return (
            this.x < entity.x + entity.width &&
            this.x + this.width > entity.x &&
            this.y < entity.y + entity.height &&
            this.y + this.height > entity.y
        );
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }
}

export default BaseEntity;
