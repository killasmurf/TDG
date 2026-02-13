// src/animation/Particle.js
// Shared particle system for animation effects

/**
 * Particle class for animation effects (smoke, fire, divine light, etc.)
 */
export class Particle {
  constructor(x, y, vx, vy, life, decay, size, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.decay = decay;
    this.size = size;
    this.color = color;
  }

  /**
   * Update particle physics and lifetime
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    this.x += this.vx * deltaTime * 60;
    this.y += this.vy * deltaTime * 60;
    this.life -= this.decay;
  }

  /**
   * Render particle to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} cx - Center X in world space
   * @param {number} cy - Center Y in world space
   */
  render(ctx, cx, cy) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.fillRect(cx + this.x - this.size / 2, cy + this.y - this.size / 2, this.size, this.size);
    ctx.restore();
  }

  /**
   * Check if particle is dead
   * @returns {boolean} True if particle should be removed
   */
  isDead() {
    return this.life <= 0;
  }
}

/**
 * Particle system for managing collections of particles
 */
export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  /**
   * Spawn death smoke particles (samurai, demon dog)
   * @param {number} count - Number of particles to spawn
   * @param {number} centerX - Spawn center X (relative to entity)
   * @param {number} centerY - Spawn center Y (relative to entity)
   * @param {Array<string>} colors - Color palette for particles
   */
  spawnDeathSmoke(count, centerX = 0, centerY = -40, colors = ['#ff4444', '#ff8844', '#ffcc44', '#ffffff']) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(
        centerX + (Math.random() - 0.5) * 20,
        centerY + (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 4,
        -Math.random() * 3 - 1,
        1,
        0.015 + Math.random() * 0.02,
        2 + Math.random() * 3,
        colors[Math.floor(Math.random() * colors.length)]
      ));
    }
  }

  /**
   * Spawn hellfire particles (demon dog variants)
   * @param {number} count - Number of particles
   * @param {number} centerX - Spawn X
   * @param {number} centerY - Spawn Y
   */
  spawnHellfire(count, centerX = 0, centerY = -20) {
    const colors = ['#ff4400', '#ff6600', '#ff8800', '#ffaa00'];
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(
        centerX + (Math.random() - 0.5) * 15,
        centerY + (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 3,
        -Math.random() * 4 - 2,
        1,
        0.02 + Math.random() * 0.03,
        3 + Math.random() * 4,
        colors[Math.floor(Math.random() * colors.length)]
      ));
    }
  }

  /**
   * Spawn divine light particles (church tower healing)
   * @param {number} count - Number of particles
   * @param {number} centerX - Spawn X
   * @param {number} centerY - Spawn Y
   */
  spawnDivineLight(count, centerX = 0, centerY = 0) {
    const colors = ['#ffd700', '#ffed4e', '#fff8dc', '#ffffaa'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      this.particles.push(new Particle(
        centerX,
        centerY,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        1,
        0.01 + Math.random() * 0.015,
        2 + Math.random() * 2,
        colors[Math.floor(Math.random() * colors.length)]
      ));
    }
  }

  /**
   * Update all particles
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    for (const p of this.particles) {
      p.update(deltaTime);
    }
    // Remove dead particles
    this.particles = this.particles.filter(p => !p.isDead());
  }

  /**
   * Render all particles
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} cx - Center X in world space
   * @param {number} cy - Center Y in world space
   */
  render(ctx, cx, cy) {
    for (const p of this.particles) {
      p.render(ctx, cx, cy);
    }
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles = [];
  }

  /**
   * Get particle count
   * @returns {number} Number of active particles
   */
  getCount() {
    return this.particles.length;
  }
}
