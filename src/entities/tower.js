import { TowerAnimator, TowerAnimState } from './towerAnimator.js';

export class Tower {
  constructor(x, y, type = 'basic', tier = 1) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.tier = tier;
    this.range = 150;
    this.damage = 10;
    this.fireRate = 1000; // milliseconds
    this.lastFire = 0;
    this.animator = new TowerAnimator(type, tier);
  }

  update(deltaTime, currentTime, enemies) {
    // Update animation
    this.animator.update(deltaTime);

    // Targeting logic
    const target = this.findNearestEnemy(enemies);
    if (!target) return;

    // Rotate tower towards target (simplified)
    this.angle = Math.atan2(target.y - this.y, target.x - this.x);

    // Firing logic
    if (
      currentTime - this.lastFire >= this.fireRate &&
      this.isInRange(target)
    ) {
      this.fire(target);
      this.lastFire = currentTime;
    }
  }

  render(ctx, scale = 1) {
    // Position for rendering – centered on this.x, this.y
    const cx = this.x;
    const cy = this.y;
    // Draw the tower using its animator
    this.animator.render(ctx, cx, cy, scale);
    // Optional: Draw range circle for debugging
    if (process.env.NODE_ENV === 'development') {
      ctx.strokeStyle = 'rgba(255,255,0,0.3)';
      ctx.beginPath();
      ctx.arc(cx, cy, this.range, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  findNearestEnemy(enemies) {
    let nearest = null;
    let minDist = Infinity;
    for (const e of enemies) {
      const d = Math.hypot(e.x - this.x, e.y - this.y);
      if (d < minDist) {
        minDist = d;
        nearest = e;
      }
    }
    return nearest;
  }

  isInRange(target) {
    return Math.hypot(target.x - this.x, target.y - this.y) <= this.range;
  }

  fire(target) {
    // Trigger animation
    this.animator.triggerFire();

    // Create a projectile – simple example
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const norm = Math.hypot(dx, dy);
    const speed = 300;
    const vx = (dx / norm) * speed;
    const vy = (dy / norm) * speed;
    // Assume a global entityManager exists
    entityManager.spawnProjectile({
      x: this.x,
      y: this.y,
      vx,
      vy,
      damage: this.damage,
      owner: this,
    });
  }

  upgrade() {
    if (this.tier < 3) {
      this.tier++;
      this.damage += 5;
      this.range += 30;
      this.fireRate = Math.max(200, this.fireRate * 0.9);
      this.animator.setTier(this.tier);
    }
  }
}
