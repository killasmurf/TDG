// src/animation/towerAnimators/SniperTowerAnimator.js
// Sniper Tower skeletal animation system - 3 tiers
// T1: Simple shrine (single archer), T2: Pagoda (dual archer), T3: Grand temple (triple archer)

import { lerpFrame } from '../interpolation.js';
import { AnimState } from '../AnimState.js';

// ═══════════════════════════════════════════════════════════════════════
// TIER-SPECIFIC PARTS
// ═══════════════════════════════════════════════════════════════════════

const T1_PARTS = {
  base: { x: -30, y: -10, w: 60, h: 10, color: '#8B4513' },
  platform: { x: -35, y: -20, w: 70, h: 10, color: '#654321' },
  pillarL: { x: -32, y: -70, w: 8, h: 50, color: '#8B0000' },
  pillarR: { x: 24, y: -70, w: 8, h: 50, color: '#8B0000' },
  roof: { x: -40, y: -100, w: 80, h: 30, color: '#4a4a4a' },
  roofTrim: { x: -42, y: -72, w: 84, h: 4, color: '#D4AF37' },
  archer: { x: -8, y: -60, w: 16, h: 30, color: '#2a2a2a' },
  bow: { x: 10, y: -55, w: 3, h: 20, color: '#654321' },
  arrow: { x: 12, y: -48, w: 15, h: 2, color: '#8B7355' },
};

const T2_PARTS = {
  base: { x: -35, y: -10, w: 70, h: 10, color: '#8B4513' },
  tier1Platform: { x: -40, y: -25, w: 80, h: 15, color: '#654321' },
  tier1Wall: { x: -35, y: -50, w: 70, h: 25, color: '#8B0000' },
  tier1Roof: { x: -42, y: -70, w: 84, h: 20, color: '#4a4a4a' },
  tier2Platform: { x: -30, y: -75, w: 60, h: 8, color: '#654321' },
  tier2Wall: { x: -25, y: -95, w: 50, h: 20, color: '#8B0000' },
  tier2Roof: { x: -35, y: -115, w: 70, h: 20, color: '#3a3a3a' },
  archerL: { x: -20, y: -65, w: 12, h: 25, color: '#2a2a2a' },
  archerR: { x: 8, y: -65, w: 12, h: 25, color: '#2a2a2a' },
  bowL: { x: -22, y: -58, w: 3, h: 15, color: '#654321' },
  bowR: { x: 19, y: -58, w: 3, h: 15, color: '#654321' },
  arrowL: { x: -24, y: -53, w: 12, h: 2, color: '#8B7355' },
  arrowR: { x: 22, y: -53, w: 12, h: 2, color: '#8B7355' },
};

const T3_PARTS = {
  base: { x: -40, y: -10, w: 80, h: 10, color: '#8B4513' },
  tier1Platform: { x: -45, y: -28, w: 90, h: 18, color: '#654321' },
  tier1Wall: { x: -40, y: -58, w: 80, h: 30, color: '#8B0000' },
  tier1Roof: { x: -48, y: -82, w: 96, h: 24, color: '#4a4a4a' },
  tier2Platform: { x: -35, y: -88, w: 70, h: 10, color: '#654321' },
  tier2Wall: { x: -30, y: -110, w: 60, h: 22, color: '#8B0000' },
  tier2Roof: { x: -38, y: -132, w: 76, h: 22, color: '#3a3a3a' },
  tier3Platform: { x: -25, y: -138, w: 50, h: 8, color: '#654321' },
  tier3Wall: { x: -20, y: -155, w: 40, h: 17, color: '#8B0000' },
  tier3Roof: { x: -28, y: -172, w: 56, h: 17, color: '#2a2a2a' },
  spire: { x: -3, y: -185, w: 6, h: 13, color: '#D4AF37' },
  archerL: { x: -28, y: -75, w: 10, h: 22, color: '#2a2a2a' },
  archerC: { x: -5, y: -75, w: 10, h: 22, color: '#2a2a2a' },
  archerR: { x: 18, y: -75, w: 10, h: 22, color: '#2a2a2a' },
  bowL: { x: -30, y: -69, w: 2, h: 12, color: '#654321' },
  bowC: { x: -7, y: -69, w: 2, h: 12, color: '#654321' },
  bowR: { x: 16, y: -69, w: 2, h: 12, color: '#654321' },
  arrowL: { x: -32, y: -65, w: 10, h: 2, color: '#8B7355' },
  arrowC: { x: -9, y: -65, w: 10, h: 2, color: '#8B7355' },
  arrowR: { x: 14, y: -65, w: 10, h: 2, color: '#8B7355' },
};

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION KEYFRAMES
// ═══════════════════════════════════════════════════════════════════════

// T1 IDLE & FIRE
const T1_IDLE = [
  { archer: { rot: 0, x: 0 }, bow: { rot: 0, x: 0 }, arrow: { visible: false } },
  { archer: { rot: 2, x: 1 }, bow: { rot: 2, x: 1 }, arrow: { visible: false } },
  { archer: { rot: 0, x: 0 }, bow: { rot: 0, x: 0 }, arrow: { visible: false } },
  { archer: { rot: -2, x: -1 }, bow: { rot: -2, x: -1 }, arrow: { visible: false } },
];

const T1_FIRE = [
  { archer: { rot: 0, x: 0 }, bow: { rot: -5, x: 0 }, arrow: { visible: true, x: 0, charge: 0 } },
  { archer: { rot: -3, x: -2 }, bow: { rot: -8, x: -2 }, arrow: { visible: true, x: -3, charge: 0.3 } },
  { archer: { rot: -5, x: -4 }, bow: { rot: -12, x: -4 }, arrow: { visible: true, x: -6, charge: 0.6 } },
  { archer: { rot: -6, x: -5 }, bow: { rot: -15, x: -5 }, arrow: { visible: true, x: -8, charge: 1 } },
  { archer: { rot: -6, x: -5 }, bow: { rot: -15, x: -5 }, arrow: { visible: true, x: -8, charge: 1 } },
  { archer: { rot: 2, x: 2 }, bow: { rot: 5, x: 2 }, arrow: { visible: false, x: 0, charge: 0 } },
  { archer: { rot: 1, x: 1 }, bow: { rot: 2, x: 1 }, arrow: { visible: false, x: 0, charge: 0 } },
  { archer: { rot: 0, x: 0 }, bow: { rot: 0, x: 0 }, arrow: { visible: false, x: 0, charge: 0 } },
];

// T2 IDLE & FIRE  
const T2_IDLE = [
  { archerL: { rot: 0 }, archerR: { rot: 0 }, bowL: { rot: 0 }, bowR: { rot: 0 }, arrowL: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: 2 }, archerR: { rot: -2 }, bowL: { rot: 2 }, bowR: { rot: -2 }, arrowL: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: 0 }, archerR: { rot: 0 }, bowL: { rot: 0 }, bowR: { rot: 0 }, arrowL: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: -2 }, archerR: { rot: 2 }, bowL: { rot: -2 }, bowR: { rot: 2 }, arrowL: { visible: false }, arrowR: { visible: false } },
];

const T2_FIRE = [
  { archerL: { rot: -4, x: -3 }, archerR: { rot: 0, x: 0 }, bowL: { rot: -10, x: -3 }, bowR: { rot: 0, x: 0 }, arrowL: { visible: true, x: -5, charge: 0.5 }, arrowR: { visible: false } },
  { archerL: { rot: -6, x: -4 }, archerR: { rot: 0, x: 0 }, bowL: { rot: -15, x: -4 }, bowR: { rot: 0, x: 0 }, arrowL: { visible: true, x: -7, charge: 1 }, arrowR: { visible: false } },
  { archerL: { rot: 2, x: 2 }, archerR: { rot: 0, x: 0 }, bowL: { rot: 5, x: 2 }, bowR: { rot: 0, x: 0 }, arrowL: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: 0, x: 0 }, archerR: { rot: 0, x: 0 }, bowL: { rot: 0, x: 0 }, bowR: { rot: 0, x: 0 }, arrowL: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: 0, x: 0 }, archerR: { rot: -4, x: -3 }, bowL: { rot: 0, x: 0 }, bowR: { rot: -10, x: -3 }, arrowL: { visible: false }, arrowR: { visible: true, x: -5, charge: 0.5 } },
  { archerL: { rot: 0, x: 0 }, archerR: { rot: -6, x: -4 }, bowL: { rot: 0, x: 0 }, bowR: { rot: -15, x: -4 }, arrowL: { visible: false }, arrowR: { visible: true, x: -7, charge: 1 } },
  { archerL: { rot: 0, x: 0 }, archerR: { rot: 2, x: 2 }, bowL: { rot: 0, x: 0 }, bowR: { rot: 5, x: 2 }, arrowL: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: 0, x: 0 }, archerR: { rot: 0, x: 0 }, bowL: { rot: 0, x: 0 }, bowR: { rot: 0, x: 0 }, arrowL: { visible: false }, arrowR: { visible: false } },
];

// T3 IDLE & FIRE
const T3_IDLE = [
  { archerL: { rot: 0 }, archerC: { rot: 0 }, archerR: { rot: 0 }, arrowL: { visible: false }, arrowC: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: 2 }, archerC: { rot: 0 }, archerR: { rot: -2 }, arrowL: { visible: false }, arrowC: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: 0 }, archerC: { rot: 2 }, archerR: { rot: 0 }, arrowL: { visible: false }, arrowC: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: -2 }, archerC: { rot: 0 }, archerR: { rot: 2 }, arrowL: { visible: false }, arrowC: { visible: false }, arrowR: { visible: false } },
];

const T3_FIRE = [
  { archerL: { rot: -3, x: -2 }, archerC: { rot: -3, x: -2 }, archerR: { rot: -3, x: -2 }, arrowL: { visible: true, x: -4, charge: 0.5 }, arrowC: { visible: true, x: -4, charge: 0.5 }, arrowR: { visible: true, x: -4, charge: 0.5 } },
  { archerL: { rot: -5, x: -4 }, archerC: { rot: -5, x: -4 }, archerR: { rot: -5, x: -4 }, arrowL: { visible: true, x: -6, charge: 1 }, arrowC: { visible: true, x: -6, charge: 1 }, arrowR: { visible: true, x: -6, charge: 1 } },
  { archerL: { rot: 2, x: 2 }, archerC: { rot: -5, x: -4 }, archerR: { rot: -5, x: -4 }, arrowL: { visible: false }, arrowC: { visible: true, x: -6, charge: 1 }, arrowR: { visible: true, x: -6, charge: 1 } },
  { archerL: { rot: 0, x: 0 }, archerC: { rot: 2, x: 2 }, archerR: { rot: -5, x: -4 }, arrowL: { visible: false }, arrowC: { visible: false }, arrowR: { visible: true, x: -6, charge: 1 } },
  { archerL: { rot: 0, x: 0 }, archerC: { rot: 0, x: 0 }, archerR: { rot: 2, x: 2 }, arrowL: { visible: false }, arrowC: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: 0, x: 0 }, archerC: { rot: 0, x: 0 }, archerR: { rot: 0, x: 0 }, arrowL: { visible: false }, arrowC: { visible: false }, arrowR: { visible: false } },
];

// ═══════════════════════════════════════════════════════════════════════
// SNIPER TOWER ANIMATOR CLASS
// ═══════════════════════════════════════════════════════════════════════

export class SniperTowerAnimator {
  constructor(tier = 1) {
    this.tier = tier;
    this.state = AnimState.IDLE;
    this.time = 0;
    this.parts = tier === 1 ? T1_PARTS : tier === 2 ? T2_PARTS : T3_PARTS;
  }

  update(deltaTime) {
    this.time += deltaTime;
    
    // Auto-return to idle after fire animation completes
    if (this.state === AnimState.FIRE) {
      const fireFrames = this._getFireFrames();
      const fireDuration = fireFrames.length / 6; // 6 fps
      if (this.time >= fireDuration) {
        this.setState(AnimState.IDLE);
      }
    }
  }

  render(ctx, cx, cy, scale = 1) {
    const frame = this._getCurrentFrame();
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    
    // Render tier-specific structure
    if (this.tier === 1) this._renderT1(ctx, frame);
    else if (this.tier === 2) this._renderT2(ctx, frame);
    else this._renderT3(ctx, frame);
    
    ctx.restore();
  }

  triggerFire() {
    this.setState(AnimState.FIRE);
  }

  setTier(tier) {
    this.tier = tier;
    this.parts = tier === 1 ? T1_PARTS : tier === 2 ? T2_PARTS : T3_PARTS;
  }

  setState(state) {
    this.state = state;
    this.time = 0;
  }

  getState() {
    return this.state;
  }

  _getCurrentFrame() {
    const frames = this.state === AnimState.FIRE ? this._getFireFrames() : this._getIdleFrames();
    const fps = this.state === AnimState.FIRE ? 6 : 2;
    const frameIndex = Math.floor(this.time * fps) % frames.length;
    const nextIndex = (frameIndex + 1) % frames.length;
    const t = (this.time * fps) % 1;
    return lerpFrame(frames[frameIndex], frames[nextIndex], t);
  }

  _getIdleFrames() {
    return this.tier === 1 ? T1_IDLE : this.tier === 2 ? T2_IDLE : T3_IDLE;
  }

  _getFireFrames() {
    return this.tier === 1 ? T1_FIRE : this.tier === 2 ? T2_FIRE : T3_FIRE;
  }

  _drawPart(ctx, part, offsets = {}) {
    const rot = ((offsets.rot || 0) * Math.PI) / 180;
    const x = offsets.x || 0;
    const y = offsets.y || 0;
    
    ctx.save();
    ctx.translate(part.x + x, part.y + y);
    ctx.rotate(rot);
    ctx.fillStyle = part.color;
    ctx.fillRect(0, 0, part.w, part.h);
    ctx.restore();
  }

  _renderT1(ctx, frame) {
    this._drawPart(ctx, T1_PARTS.base);
    this._drawPart(ctx, T1_PARTS.platform);
    this._drawPart(ctx, T1_PARTS.pillarL);
    this._drawPart(ctx, T1_PARTS.pillarR);
    this._drawPart(ctx, T1_PARTS.roof);
    this._drawPart(ctx, T1_PARTS.roofTrim);
    this._drawPart(ctx, T1_PARTS.archer, frame.archer);
    this._drawPart(ctx, T1_PARTS.bow, frame.bow);
    if (frame.arrow?.visible) this._drawPart(ctx, T1_PARTS.arrow, frame.arrow);
  }

  _renderT2(ctx, frame) {
    this._drawPart(ctx, T2_PARTS.base);
    this._drawPart(ctx, T2_PARTS.tier1Platform);
    this._drawPart(ctx, T2_PARTS.tier1Wall);
    this._drawPart(ctx, T2_PARTS.tier1Roof);
    this._drawPart(ctx, T2_PARTS.tier2Platform);
    this._drawPart(ctx, T2_PARTS.tier2Wall);
    this._drawPart(ctx, T2_PARTS.tier2Roof);
    this._drawPart(ctx, T2_PARTS.archerL, frame.archerL);
    this._drawPart(ctx, T2_PARTS.archerR, frame.archerR);
    this._drawPart(ctx, T2_PARTS.bowL, frame.bowL);
    this._drawPart(ctx, T2_PARTS.bowR, frame.bowR);
    if (frame.arrowL?.visible) this._drawPart(ctx, T2_PARTS.arrowL, frame.arrowL);
    if (frame.arrowR?.visible) this._drawPart(ctx, T2_PARTS.arrowR, frame.arrowR);
  }

  _renderT3(ctx, frame) {
    this._drawPart(ctx, T3_PARTS.base);
    this._drawPart(ctx, T3_PARTS.tier1Platform);
    this._drawPart(ctx, T3_PARTS.tier1Wall);
    this._drawPart(ctx, T3_PARTS.tier1Roof);
    this._drawPart(ctx, T3_PARTS.tier2Platform);
    this._drawPart(ctx, T3_PARTS.tier2Wall);
    this._drawPart(ctx, T3_PARTS.tier2Roof);
    this._drawPart(ctx, T3_PARTS.tier3Platform);
    this._drawPart(ctx, T3_PARTS.tier3Wall);
    this._drawPart(ctx, T3_PARTS.tier3Roof);
    this._drawPart(ctx, T3_PARTS.spire);
    this._drawPart(ctx, T3_PARTS.archerL, frame.archerL);
    this._drawPart(ctx, T3_PARTS.archerC, frame.archerC);
    this._drawPart(ctx, T3_PARTS.archerR, frame.archerR);
    this._drawPart(ctx, T3_PARTS.bowL, frame.bowL);
    this._drawPart(ctx, T3_PARTS.bowC, frame.bowC);
    this._drawPart(ctx, T3_PARTS.bowR, frame.bowR);
    if (frame.arrowL?.visible) this._drawPart(ctx, T3_PARTS.arrowL, frame.arrowL);
    if (frame.arrowC?.visible) this._drawPart(ctx, T3_PARTS.arrowC, frame.arrowC);
    if (frame.arrowR?.visible) this._drawPart(ctx, T3_PARTS.arrowR, frame.arrowR);
  }
}
