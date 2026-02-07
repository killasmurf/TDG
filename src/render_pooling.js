// src/render_pooling.js
// Basic object pooling for enemies & projectiles

class Pool {
    constructor(createFactory) {
        this.factory = createFactory;
        this.active = [];
        this.inactive = [];
    }

    acquire() {
        return this.inactive.pop() || this.factory();
    }

    release(obj) {
        this.inactive.push(obj);
    }

    getCount() { return this.active.length; }
}

export default Pool;
