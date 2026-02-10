// src/entities/towerAnimator.js
import { towerFrames } from '../assets/towerFrames.js';

/**
 * TowerAnimator is responsible for running the animation state machine for a
 * tower and drawing the correct sprite from the shared sprite sheet.
 */

export const TowerAnimState = {
  IDLE: 'idle',
  FIRE: 'fire',
  UPGRADE: 'upgrade',
};

export class TowerAnimator {
  constructor(type, tier = 1) {
    this.type = type;
    this.tier = tier;
    this.state = TowerAnimState.IDLE;
    this.time = 0;
    this.fireDone = false;
    this.idleSpeed = 4;   // frames per second – can be overridden per tower
    this.fireSpeed = 8;
    this.particles = [];

    // Load the shared sprite sheet
    this.spriteSheet = new Image();
    this.spriteSheet.src = '../assets/tower-sprites.png';
    this.spriteSheet.onload = () => {
      this.sheetColumns = this.spriteSheet.width / 32;
    };
  }

  setState(state) {
    this.state = state;
    this.time = 0;
    if (state === TowerAnimState.FIRE) this.fireDone = false;
  }

  update(deltaTime) {
    this.time += deltaTime;
    // Simple state machine: fire stops after a short duration
    if (this.state === TowerAnimState.FIRE && this.time > 1 / this.fireSpeed) {
      this.fireDone = true;
      this.setState(TowerAnimState.IDLE);
    }
    this.particles = this.particles.filter(p => p.alive);
    this.particles.forEach(p => p.update(deltaTime));
  }

  triggerFire() {
    this.setState(TowerAnimState.FIRE);
  }

  setTier(tier) {
    this.tier = tier;
    // In a full implementation you would load new keyframe data here
  }

  reset(type, tier = 1) {
    this.type = type;
    this.tier = tier;
    this.state = TowerAnimState.IDLE;
    this.time = 0;
    this.particles = [];
  }

  /**
   * Determines which frame from the sprite sheet should be drawn.
   */
  getCurrentFrame() {
    const frames = towerFrames[this.type] || towerFrames.basic;
    const frameArray = frames[this.state] || frames.idle;
    const index = frameArray[Math.floor(this.time * (this[state === TowerAnimState.FIRE ? this.fireSpeed : this.idleSpeed]) % frameArray.length];
    const cols = this.sheetColumns || 16; // default assumption if not yet loaded
    const sx = (index % cols) * 32;
    const sy = Math.floor(index / cols) * 32;
    return { sx, sy, sw: 32, sh: 32 };
  }

  /**
   * Render the current frame onto the given context.
   */
  render(ctx, cx, cy, scale = 1) {
    if (!this.spriteSheet.complete) return; // not yet loaded
    const { sx, sy, sw, sh } = this.getCurrentFrame();
    ctx.drawImage(
      this.spriteSheet,
      sx,
      sy,
      sw,
      sh,
      cx - (sw / 2),
      cy - sh,
      sw * scale,
      sh * scale
    );
    // Draw any active particles
    this.particles.forEach(p => p.render(ctx));
  }
}

// Simple particle helper used by the animator
export class Particle {
  constructor(x, y, config = {}) {
    this.x = x;
    this.y = y;
    this.life = config.life || 0.5;
    this.speedX = config.speedX || 0;
    this.speedY = config.speedY || 0;
    this.alive = true;
  }

  update(dt) {
    this.x += this.speedX * dt;
    this.y += this.speedY * dt;
    this.life -= dt;
    if (this.life <= 0) this.alive = false;
  }

  render(ctx) {
    ctx.fillStyle = 'rgba(255,165,0,0.7)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
