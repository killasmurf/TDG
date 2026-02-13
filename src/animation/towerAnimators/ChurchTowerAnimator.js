// src/animation/towerAnimators/ChurchTowerAnimator.js
// Church Tower animation system - Support/healing tower with 3 tiers
// T1: Simple Chapel, T2: Parish Church, T3: Grand Cathedral
// Features divine light effects and healing auras

import { AnimState } from '../AnimState.js';
import { ParticleSystem } from '../Particle.js';

// ═══════════════════════════════════════════════════════════════════════
// TIER-SPECIFIC PARTS (Simplified Gothic Architecture)
// ═══════════════════════════════════════════════════════════════════════

const T1_PARTS = {
  base: { x: -32, y: -10, w: 64, h: 10, color: '#8a7d6f' },
  foundation: { x: -35, y: -18, w: 70, h: 8, color: '#6a5d4f' },
  wall: { x: -30, y: -55, w: 60, h: 37, color: '#9a8d7f' },
  doorway: { x: -8, y: -28, w: 16, h: 18, color: '#2a2a2a' },
  windowL: { x: -22, y: -48, w: 8, h: 14, color: '#4a6a9a' },
  windowR: { x: 14, y: -48, w: 8, h: 14, color: '#9a4a6a' },
  roof: { x: -28, y: -85, w: 56, h: 25, color: '#3a2a2a' },
  cross: { v: { x: -2, y: -98, w: 4, h: 18 }, h: { x: -6, y: -92, w: 12, h: 4 } },
};

const T2_PARTS = {
  base: { x: -40, y: -12, w: 80, h: 12, color: '#8a7d6f' },
  foundation: { x: -43, y: -22, w: 86, h: 10, color: '#6a5d4f' },
  nave: { x: -35, y: -65, w: 70, h: 43, color: '#9a8d7f' },
  doorway: { x: -10, y: -32, w: 20, h: 22, color: '#2a2a2a' },
  roseWindow: { x: -12, y: -58, w: 24, h: 24, color: '#4a6a9a' },
  towerL: { x: -38, y: -95, w: 18, h: 30, color: '#8a7d6f' },
  towerR: { x: 20, y: -95, w: 18, h: 30, color: '#8a7d6f' },
  spireL: { x: -34, y: -115, w: 10, h: 20, color: '#3a2a2a' },
  spireR: { x: 24, y: -115, w: 10, h: 20, color: '#3a2a2a' },
  roof: { x: -33, y: -95, w: 66, h: 25, color: '#3a2a2a' },
  crossL: { v: { x: -31, y: -122, w: 4, h: 12 }, h: { x: -33, y: -118, w: 8, h: 3 } },
  crossR: { v: { x: 27, y: -122, w: 4, h: 12 }, h: { x: 25, y: -118, w: 8, h: 3 } },
};

const T3_PARTS = {
  base: { x: -48, y: -15, w: 96, h: 15, color: '#8a7d6f' },
  foundation: { x: -52, y: -28, w: 104, h: 13, color: '#6a5d4f' },
  cathedral: { x: -44, y: -85, w: 88, h: 57, color: '#9a8d7f' },
  doorway: { x: -14, y: -42, w: 28, h: 28, color: '#2a2a2a' },
  roseWindow: { x: -18, y: -75, w: 36, h: 36, color: '#4a6a9a' },
  towerL: { x: -46, y: -120, w: 22, h: 35, color: '#8a7d6f' },
  towerR: { x: 24, y: -120, w: 22, h: 35, color: '#8a7d6f' },
  centralTower: { x: -14, y: -145, w: 28, h: 45, color: '#8a7d6f' },
  spireL: { x: -40, y: -145, w: 14, h: 25, color: '#3a2a2a' },
  spireR: { x: 26, y: -145, w: 14, h: 25, color: '#3a2a2a' },
  centralSpire: { x: -10, y: -175, w: 20, h: 30, color: '#3a2a2a' },
  roof: { x: -40, y: -120, w: 80, h: 30, color: '#3a2a2a' },
  crossCenter: { v: { x: -2, y: -188, w: 4, h: 18 }, h: { x: -6, y: -182, w: 12, h: 5 } },
};

// ═══════════════════════════════════════════════════════════════════════
// CHURCH TOWER ANIMATOR CLASS
// ═══════════════════════════════════════════════════════════════════════

export class ChurchTowerAnimator {
  constructor(tier = 1) {
    this.tier = tier;
    this.state = AnimState.IDLE;
    this.time = 0;
    this.parts = tier === 1 ? T1_PARTS : tier === 2 ? T2_PARTS : T3_PARTS;
    this.particleSystem = new ParticleSystem();
    this.healPulse = 0;
    this.range = 100 + (tier * 20); // Healing range
  }

  update(deltaTime) {
    this.time += deltaTime;
    this.healPulse = (Math.sin(this.time * 2) + 1) / 2; // 0-1 pulse
    this.particleSystem.update(deltaTime);
    
    // Spawn divine light particles periodically
    if (Math.random() < 0.1 * this.tier) {
      this.particleSystem.spawnDivineLight(1);
    }
  }

  render(ctx, cx, cy, scale = 1) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    
    // Render tier-specific structure
    if (this.tier === 1) this._renderT1(ctx);
    else if (this.tier === 2) this._renderT2(ctx);
    else this._renderT3(ctx);
    
    ctx.restore();
    
    // Render healing aura
    this.renderHealingAura(ctx, cx, cy, this.range, this.healPulse);
    
    // Render particles
    this.particleSystem.render(ctx, cx, cy);
  }

  renderHealingAura(ctx, cx, cy, radius, intensity) {
    ctx.save();
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, `rgba(255, 255, 220, ${0.15 * intensity})`);
    gradient.addColorStop(0.7, `rgba(255, 240, 180, ${0.08 * intensity})`);
    gradient.addColorStop(1, 'rgba(255, 240, 180, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderSupportRadius(ctx, cx, cy, range) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(cx, cy, range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  triggerFire() {
    // Church tower "fire" is a healing pulse — briefly intensify the aura
    this.healPulse = 1;
  }

  setTier(tier) {
    this.tier = tier;
    this.parts = tier === 1 ? T1_PARTS : tier === 2 ? T2_PARTS : T3_PARTS;
    this.range = 100 + (tier * 20);
  }

  setState(state) {
    this.state = state;
  }

  getState() {
    return this.state;
  }

  _drawPart(ctx, part) {
    ctx.fillStyle = part.color;
    ctx.fillRect(part.x, part.y, part.w, part.h);
  }

  _drawCross(ctx, cross, color = '#D4AF37') {
    ctx.fillStyle = color;
    ctx.fillRect(cross.v.x, cross.v.y, cross.v.w, cross.v.h);
    ctx.fillRect(cross.h.x, cross.h.y, cross.h.w, cross.h.h);
  }

  _renderT1(ctx) {
    this._drawPart(ctx, T1_PARTS.base);
    this._drawPart(ctx, T1_PARTS.foundation);
    this._drawPart(ctx, T1_PARTS.wall);
    this._drawPart(ctx, T1_PARTS.doorway);
    
    // Stained glass glow
    this._renderStainedGlass(ctx, T1_PARTS.windowL);
    this._renderStainedGlass(ctx, T1_PARTS.windowR);
    
    this._drawPart(ctx, T1_PARTS.roof);
    this._drawCross(ctx, T1_PARTS.cross);
  }

  _renderT2(ctx) {
    this._drawPart(ctx, T2_PARTS.base);
    this._drawPart(ctx, T2_PARTS.foundation);
    this._drawPart(ctx, T2_PARTS.nave);
    this._drawPart(ctx, T2_PARTS.doorway);
    
    // Rose window glow
    this._renderStainedGlass(ctx, T2_PARTS.roseWindow);
    
    this._drawPart(ctx, T2_PARTS.towerL);
    this._drawPart(ctx, T2_PARTS.towerR);
    this._drawPart(ctx, T2_PARTS.spireL);
    this._drawPart(ctx, T2_PARTS.spireR);
    this._drawPart(ctx, T2_PARTS.roof);
    this._drawCross(ctx, T2_PARTS.crossL);
    this._drawCross(ctx, T2_PARTS.crossR);
  }

  _renderT3(ctx) {
    this._drawPart(ctx, T3_PARTS.base);
    this._drawPart(ctx, T3_PARTS.foundation);
    this._drawPart(ctx, T3_PARTS.cathedral);
    this._drawPart(ctx, T3_PARTS.doorway);
    
    // Large rose window glow
    this._renderStainedGlass(ctx, T3_PARTS.roseWindow);
    
    this._drawPart(ctx, T3_PARTS.towerL);
    this._drawPart(ctx, T3_PARTS.towerR);
    this._drawPart(ctx, T3_PARTS.centralTower);
    this._drawPart(ctx, T3_PARTS.spireL);
    this._drawPart(ctx, T3_PARTS.spireR);
    this._drawPart(ctx, T3_PARTS.centralSpire);
    this._drawPart(ctx, T3_PARTS.roof);
    this._drawCross(ctx, T3_PARTS.crossCenter);
  }

  _renderStainedGlass(ctx, window) {
    // Draw base window
    this._drawPart(ctx, window);
    
    // Add glow effect
    ctx.save();
    ctx.globalAlpha = 0.3 + this.healPulse * 0.2;
    ctx.fillStyle = window.color;
    ctx.fillRect(window.x - 2, window.y - 2, window.w + 4, window.h + 4);
    ctx.restore();
  }
}
