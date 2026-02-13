import { TowerAnimator } from './towerAnimator.js';
import Config from '../config.js';

export default class Tower {
  constructor(x, y, type = 'basic', tier = 1) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.tier = tier;
    this.active = true;

    // Pull stats from config
    const cfg = Config.tower[type] || {};
    this.width = cfg.width || 40;
    this.height = cfg.height || 40;
    this.range = cfg.range || 150;
    this.damage = cfg.damage || 10;
    this.fireRate = cfg.fireRate || 1000; // milliseconds
    this.color = cfg.color || 'blue';
    this.lastFire = 0;
    this.angle = 0;
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

  render(renderer, scale = 1) {
    // Draw tower body centered on (x, y)
    const drawW = this.width * scale;
    const drawH = this.height * scale;
    renderer.drawRect(
      this.x - drawW / 2,
      this.y - drawH / 2,
      drawW,
      drawH,
      this.color
    );

    // Draw barrel indicating aim direction
    const barrelLen = drawW * 0.6;
    const bx = this.x + Math.cos(this.angle) * barrelLen;
    const by = this.y + Math.sin(this.angle) * barrelLen;
    const ctx = renderer.ctx;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(bx, by);
    ctx.stroke();

    // Let animator draw any extra visuals (e.g. fire flash)
    this.animator.render(renderer, this.x, this.y, scale);
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
