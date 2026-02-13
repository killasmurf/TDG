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

  update(deltaTime, entityManager) {
    // Update animation
    this.animator.update(deltaTime);

    // Track elapsed time (deltaTime is in seconds, fireRate in ms)
    this.lastFire += deltaTime * 1000;

    // Use tower center for targeting
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    // Find nearest enemy via entityManager
    const target = entityManager.findClosestEnemy(cx, cy, this.range);
    if (!target) return;

    // Rotate tower towards target
    this.angle = Math.atan2(target.y - cy, target.x - cx);

    // Firing logic — lastFire accumulates ms since last shot
    if (this.lastFire >= this.fireRate) {
      this.lastFire = 0;
      this.animator.triggerFire();
      entityManager.spawnProjectile(this, target);
    }
  }

  render(renderer, scale = 1) {
    // this.x, this.y is the top-left corner (set by placeTower)
    // Compute center for drawing and animator
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const drawW = this.width * scale;
    const drawH = this.height * scale;

    // Draw tower body from top-left
    renderer.drawRect(this.x, this.y, drawW, drawH, this.color);

    // Draw barrel indicating aim direction from center
    const barrelLen = drawW * 0.6;
    const bx = cx + Math.cos(this.angle) * barrelLen;
    const by = cy + Math.sin(this.angle) * barrelLen;
    const ctx = renderer.ctx;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(bx, by);
    ctx.stroke();

    // Let animator draw tower model at the center
    this.animator.render(renderer, cx, cy, scale);
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
