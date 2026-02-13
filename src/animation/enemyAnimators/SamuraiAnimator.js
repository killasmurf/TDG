// src/animation/enemyAnimators/SamuraiAnimator.js
// Samurai skeletal animation system - Standard enemy type
// Bipedal walk cycle with sword attack animations

import { lerp, lerpFrame } from '../interpolation.js';
import { ParticleSystem } from '../Particle.js';
import { AnimState } from '../AnimState.js';

// ═══════════════════════════════════════════════════════════════════════
// BODY PARTS — 9 components for humanoid samurai
// ═══════════════════════════════════════════════════════════════════════

const SAMURAI_PARTS = {
  torso:  { x: -17, y: -70, w: 34, h: 60 },
  head:   { x: -12, y: -95, w: 24, h: 25 },
  helmet: { x: -15, y: -107, w: 30, h: 15 },
  lLeg:   { x: -14, y: -10, w: 12, h: 35 },
  rLeg:   { x: 2,   y: -10, w: 12, h: 35 },
  lArm:   { x: -28, y: -65, w: 10, h: 35 },
  rArm:   { x: 18,  y: -65, w: 10, h: 35 },
  blade:  { x: 20,  y: -70, w: 4,  h: 50 },
  handle: { x: 19,  y: -25, w: 6,  h: 15 },
};

const PIVOTS = {
  torso:  { x: 0,   y: -40 },
  head:   { x: 0,   y: -82 },
  helmet: { x: 0,   y: -100 },
  lLeg:   { x: -8,  y: -10 },
  rLeg:   { x: 8,   y: -10 },
  lArm:   { x: -28, y: -55 },
  rArm:   { x: 23,  y: -55 },
  blade:  { x: 22,  y: -45 },
  handle: { x: 22,  y: -18 },
};

const PALETTES = {
  basic: { armor: '#1a3a5c', cloth: '#1a1a1a', skin: '#d4a574', helmet: '#2c2c2c', blade: '#c0c0c0', handle: '#0a0a0a', armorDetail: '#2a4a6c', crest: '#8B0000' },
  fast:  { armor: '#5c1a1a', cloth: '#2a1a1a', skin: '#c49564', helmet: '#3c1c1c', blade: '#d0d0d0', handle: '#1a0a0a', armorDetail: '#6c2a2a', crest: '#cc0000' },
  tank:  { armor: '#3c1a5c', cloth: '#0a0a2a', skin: '#b48564', helmet: '#1c1c3c', blade: '#a0a0b0', handle: '#0a0a1a', armorDetail: '#4c2a6c', crest: '#660066' },
};

// WALK CYCLE — 8 frames
const WALK_FRAMES = [
  { lLeg: { rot: 25 }, rLeg: { rot: -25 }, lArm: { rot: -15 }, rArm: { rot: 15 }, torso: { y: 0, rot: 0 }, head: { rot: 0, y: 0 }, helmet: { rot: 0, y: 0 }, blade: { rot: 5 }, handle: {} },
  { lLeg: { rot: 15 }, rLeg: { rot: -15 }, lArm: { rot: -10 }, rArm: { rot: 10 }, torso: { y: 2, rot: -1 }, head: { y: 2 }, helmet: { y: 2 }, blade: { rot: 3, y: 2 }, handle: { y: 2 } },
  { lLeg: { rot: 0 }, rLeg: { rot: 0 }, lArm: { rot: 0 }, rArm: { rot: 0 }, torso: { y: -1 }, head: { y: -1 }, helmet: { y: -1 }, blade: { y: -1 }, handle: { y: -1 } },
  { lLeg: { rot: -15 }, rLeg: { rot: 15 }, lArm: { rot: 10 }, rArm: { rot: -10 }, torso: { y: -2, rot: 1 }, head: { y: -2 }, helmet: { y: -2 }, blade: { rot: -3, y: -2 }, handle: { y: -2 } },
  { lLeg: { rot: -25 }, rLeg: { rot: 25 }, lArm: { rot: 15 }, rArm: { rot: -15 }, torso: { y: 0 }, head: { y: 0 }, helmet: { y: 0 }, blade: { rot: -5 }, handle: {} },
  { lLeg: { rot: -15 }, rLeg: { rot: 15 }, lArm: { rot: 10 }, rArm: { rot: -10 }, torso: { y: 2, rot: 1 }, head: { y: 2 }, helmet: { y: 2 }, blade: { rot: -3, y: 2 }, handle: { y: 2 } },
  { lLeg: { rot: 0 }, rLeg: { rot: 0 }, lArm: { rot: 0 }, rArm: { rot: 0 }, torso: { y: -1 }, head: { y: -1 }, helmet: { y: -1 }, blade: { y: -1 }, handle: { y: -1 } },
  { lLeg: { rot: 15 }, rLeg: { rot: -15 }, lArm: { rot: -10 }, rArm: { rot: 10 }, torso: { y: -2, rot: -1 }, head: { y: -2 }, helmet: { y: -2 }, blade: { rot: 3, y: -2 }, handle: { y: -2 } },
];

// DEATH SEQUENCE — 12 frames
const DEATH_FRAMES = [
  { torso: { y: 0, rot: -5 }, head: { rot: 10, y: -2 }, helmet: { rot: 12, y: -3 }, lLeg: { rot: 5 }, rLeg: { rot: -5 }, lArm: { rot: -30 }, rArm: { rot: 30 }, blade: { rot: 25 }, handle: { rot: 10 }, opacity: 1, flash: true },
  { torso: { y: 0, rot: -10 }, head: { rot: 15, y: -3 }, helmet: { rot: 18, y: -5 }, lLeg: { rot: 10 }, rLeg: { rot: -10 }, lArm: { rot: -45, y: 5 }, rArm: { rot: 50, y: 5 }, blade: { rot: 40, y: 5 }, handle: { rot: 15, y: 5 }, opacity: 1 },
  { torso: { y: 2, rot: -18 }, head: { rot: 20, y: -2 }, helmet: { rot: 25, y: -4 }, lLeg: { rot: 15 }, rLeg: { rot: -8 }, lArm: { rot: -55, y: 10 }, rArm: { rot: 70, y: 15 }, blade: { rot: 60, y: 20 }, handle: { rot: 30, y: 18 }, opacity: 1 },
  { torso: { y: 8, rot: -25 }, head: { rot: 25, y: 3 }, helmet: { rot: 30, y: 1 }, lLeg: { rot: 25, y: 5 }, rLeg: { rot: -20, y: 5 }, lArm: { rot: -60, y: 15 }, rArm: { rot: 80, y: 25 }, blade: { rot: 80, y: 35 }, handle: { rot: 45, y: 30 }, opacity: 1 },
  { torso: { y: 18, rot: -40 }, head: { rot: 30, y: 10 }, helmet: { rot: 35, y: 8 }, lLeg: { rot: 35, y: 10 }, rLeg: { rot: -30, y: 10 }, lArm: { rot: -70, y: 22 }, rArm: { rot: 85, y: 30 }, blade: { rot: 90, y: 45 }, handle: { rot: 50, y: 40 }, opacity: 0.95 },
  { torso: { y: 30, rot: -60 }, head: { rot: 35, y: 22 }, helmet: { rot: 40, y: 18 }, lLeg: { rot: 45, y: 18 }, rLeg: { rot: -40, y: 18 }, lArm: { rot: -75, y: 28 }, rArm: { rot: 85, y: 32 }, blade: { rot: 90, y: 50 }, handle: { rot: 55, y: 45 }, opacity: 0.9 },
  { torso: { y: 42, rot: -75 }, head: { rot: 38, y: 34 }, helmet: { rot: 42, y: 30 }, lLeg: { rot: 55, y: 25 }, rLeg: { rot: -45, y: 25 }, lArm: { rot: -80, y: 32 }, rArm: { rot: 85, y: 34 }, blade: { rot: 90, y: 52 }, handle: { rot: 58, y: 48 }, opacity: 0.85, flash: true },
  { torso: { y: 46, rot: -82 }, head: { rot: 40, y: 38 }, helmet: { rot: 44, y: 34 }, lLeg: { rot: 60, y: 28 }, rLeg: { rot: -50, y: 28 }, lArm: { rot: -82, y: 34 }, rArm: { rot: 85, y: 35 }, blade: { rot: 90, y: 53 }, handle: { rot: 60, y: 50 }, opacity: 0.75 },
  { torso: { y: 48, rot: -85 }, head: { rot: 42, y: 40 }, helmet: { rot: 45, y: 36 }, lLeg: { rot: 62, y: 30 }, rLeg: { rot: -52, y: 30 }, lArm: { rot: -84, y: 35 }, rArm: { rot: 85, y: 36 }, blade: { rot: 90, y: 54 }, handle: { rot: 62, y: 51 }, opacity: 0.6 },
  { torso: { y: 49, rot: -87 }, head: { rot: 43, y: 41 }, helmet: { rot: 45, y: 37 }, lLeg: { rot: 63, y: 31 }, rLeg: { rot: -53, y: 31 }, lArm: { rot: -85, y: 35 }, rArm: { rot: 85, y: 36 }, blade: { rot: 90, y: 55 }, handle: { rot: 63, y: 52 }, opacity: 0.4 },
  { torso: { y: 50, rot: -88 }, head: { rot: 43, y: 42 }, helmet: { rot: 46, y: 38 }, lLeg: { rot: 64, y: 32 }, rLeg: { rot: -54, y: 32 }, lArm: { rot: -85, y: 35 }, rArm: { rot: 85, y: 36 }, blade: { rot: 90, y: 55 }, handle: { rot: 63, y: 52 }, opacity: 0.2 },
  { torso: { y: 50, rot: -90 }, head: { rot: 44, y: 42 }, helmet: { rot: 46, y: 38 }, lLeg: { rot: 65, y: 33 }, rLeg: { rot: -55, y: 33 }, lArm: { rot: -85, y: 35 }, rArm: { rot: 85, y: 36 }, blade: { rot: 90, y: 55 }, handle: { rot: 63, y: 52 }, opacity: 0 },
];

// ═══════════════════════════════════════════════════════════════════════
// SAMURAI ANIMATOR CLASS
// ═══════════════════════════════════════════════════════════════════════

export class SamuraiAnimator {
  constructor(variant = 'basic') {
    this.variant = variant;
    this.palette = PALETTES[variant] || PALETTES.basic;
    this.state = AnimState.WALK;
    this.time = 0;
    this.deathDone = false;
    this.flashTimer = 0;
    this.particleSystem = new ParticleSystem();
  }

  update(deltaTime) {
    this.time += deltaTime;
    if (this.flashTimer > 0) this.flashTimer -= deltaTime;
    this.particleSystem.update(deltaTime);
    
    if (this.state === AnimState.DEATH) {
      const deathDuration = DEATH_FRAMES.length / 6;
      if (this.time >= deathDuration) this.deathDone = true;
    }
  }

  render(ctx, cx, cy, scale = 1) {
    const frame = this._getCurrentFrame();
    const opacity = frame.opacity ?? 1;
    const isFlash = (frame.flash || this.flashTimer > 0);
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.globalAlpha = opacity;
    
    // Draw order: legs → torso → arms → head → helmet
    this._drawPart(ctx, 'lLeg', frame, isFlash);
    this._drawPart(ctx, 'rLeg', frame, isFlash);
    this._drawPart(ctx, 'torso', frame, isFlash);
    this._drawPart(ctx, 'lArm', frame, isFlash);
    this._drawPart(ctx, 'rArm', frame, isFlash);
    this._drawPart(ctx, 'handle', frame, isFlash);
    this._drawPart(ctx, 'blade', frame, isFlash);
    this._drawPart(ctx, 'head', frame, isFlash);
    this._drawPart(ctx, 'helmet', frame, isFlash);
    
    // Armor details
    if (!isFlash) this._renderArmorDetails(ctx, frame, opacity);
    
    ctx.restore();
    this.particleSystem.render(ctx, cx, cy);
  }

  setState(state) {
    if (this.state !== state) {
      this.state = state;
      this.time = 0;
      if (state === AnimState.DEATH) {
        this.deathDone = false;
        this.particleSystem.spawnDeathSmoke(12);
      }
    }
  }

  flash() {
    this.flashTimer = 0.1;
  }

  reset(variant = 'basic') {
    this.variant = variant;
    this.palette = PALETTES[variant] || PALETTES.basic;
    this.state = AnimState.WALK;
    this.time = 0;
    this.deathDone = false;
    this.flashTimer = 0;
    this.particleSystem.clear();
  }

  isDeathComplete() {
    return this.state === AnimState.DEATH && this.deathDone && this.particleSystem.getCount() === 0;
  }

  _getCurrentFrame() {
    const frames = this.state === AnimState.DEATH ? DEATH_FRAMES : WALK_FRAMES;
    const fps = this.state === AnimState.DEATH ? 6 : 8;
    const frameIndex = Math.floor(this.time * fps) % frames.length;
    const nextIndex = (frameIndex + 1) % frames.length;
    const t = (this.time * fps) % 1;
    return lerpFrame(frames[frameIndex], frames[nextIndex], t);
  }

  _drawPart(ctx, partName, frame, isFlash) {
    const part = SAMURAI_PARTS[partName];
    const pivot = PIVOTS[partName];
    const frameData = frame[partName] || {};
    const rot = ((frameData.rot || 0) * Math.PI) / 180;
    const offY = frameData.y || 0;
    
    ctx.save();
    ctx.translate(pivot.x, pivot.y + offY);
    ctx.rotate(rot);
    
    const colorMap = { torso: 'armor', head: 'skin', helmet: 'helmet',
      lLeg: 'cloth', rLeg: 'cloth', lArm: 'armor', rArm: 'armor',
      blade: 'blade', handle: 'handle' };
    const color = this.palette[colorMap[partName]];
    
    ctx.fillStyle = isFlash ? '#fff' : color;
    ctx.fillRect(part.x - pivot.x, part.y - pivot.y, part.w, part.h);
    ctx.restore();
  }

  _renderArmorDetails(ctx, frame, opacity) {
    // Crest on helmet
    const hRot = ((frame.helmet?.rot || 0) * Math.PI) / 180;
    const hY = frame.helmet?.y || 0;
    ctx.save();
    ctx.translate(0, -100 + hY);
    ctx.rotate(hRot);
    ctx.fillStyle = this.palette.crest;
    ctx.fillRect(-6, -10, 12, 4);
    ctx.restore();
    
    // Armor plating
    const tRot = ((frame.torso?.rot || 0) * Math.PI) / 180;
    const tY = frame.torso?.y || 0;
    ctx.save();
    ctx.translate(0, -40 + tY);
    ctx.rotate(tRot);
    ctx.fillStyle = this.palette.armorDetail;
    ctx.fillRect(-14, -25, 28, 3);
    ctx.fillRect(-14, -18, 28, 3);
    ctx.restore();
  }
}
