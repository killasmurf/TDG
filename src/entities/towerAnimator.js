// src/entities/towerAnimator.js

export class TowerAnimator {
  constructor(type, tier = 1) {
    this.type = type;
    this.tier = tier;
    this.fireFlashTimer = 0;
    this.fireFlashDuration = 100; // ms
  }

  update(deltaTime) {
    if (this.fireFlashTimer > 0) {
      this.fireFlashTimer -= deltaTime;
    }
  }

  triggerFire() {
    this.fireFlashTimer = this.fireFlashDuration;
  }

  setTier(tier) {
    this.tier = tier;
  }

  render(renderer, cx, cy, scale = 1) {
    // Draw a muzzle flash when firing
    if (this.fireFlashTimer > 0) {
      renderer.drawCircle(cx, cy, 8 * scale, 'rgba(255, 200, 50, 0.6)');
    }
  }
}
