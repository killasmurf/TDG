// src/entities/tower.js
import { TowerAnimator, TowerAnimState } from './towerAnimator.js';

export class Tower {
  constructor(x, y, type, level = 1) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.tier = level;
    this.width = 32;
    this.height = 32;
    this.range = 80;
    this.damage = 5;
    this.fireRate = 1000;
    this.canFire = true;
    this.fireTimer = 0;
    this.animator = new TowerAnimator(type, level);
  }

  update(deltaTime, enemies) {
    this.animator.update(deltaTime);

    this.fireTimer += deltaTime;
    if (this.canFire && this.fireTimer >= this.fireRate) {
      const target = this.findTarget(enemies);
      if (target) {
        this.fire(target);
        this.fireTimer = 0;
        this.animator.triggerFire();
      }
    }
  }

  render(ctx) {
    // Draw tower sprite via animator
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height;
    this.animator.render(ctx, cx, cy);

    // Optionally draw range indicator
    // ctx.strokeStyle = "rgba(0,255,0,0.2)";
    // ctx.beginPath();
    // ctx.arc(cx, cy, this.range, 0, Math.PI * 2);
    // ctx.stroke();
  }

  findTarget(enemies) {
    return enemies.find(e => {
      const dx = e.x - this.x;
      const dy = e.y - this.y;
      return Math.sqrt(dx * dx + dy * dy) <= this.range;
    });
  }

  fire(target) {
    // Create projectile (simple straight line for demo)
    const projectile = new Projectile(this.x + this.width / 2, this.y, target, this.damage);
    // Normally you’d push this into an entity manager
  }

  upgrade() {
    this.tier++;
    this.range += 20;
    this.damage += 3;
    this.animator.setTier(this.tier);
  }
}
