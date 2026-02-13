// src/animation/enemyAnimators/DemonDogAnimator.js
// Demon Dog skeletal animation system - Fast enemy type
// Quadruped gallop cycle with hellfire death dissolution

import { lerp, lerpFrame } from '../interpolation.js';
import { ParticleSystem } from '../Particle.js';
import { AnimState } from '../AnimState.js';

// ═══════════════════════════════════════════════════════════════════════
// BODY PARTS — 17 components for full quadruped anatomy
// ═══════════════════════════════════════════════════════════════════════

const DEMON_DOG_PARTS = {
  body:      { x: -22, y: -45, w: 44, h: 24 },
  chest:     { x: -18, y: -50, w: 20, h: 18 },
  belly:     { x: -5,  y: -38, w: 22, h: 12 },
  head:      { x: -30, y: -60, w: 22, h: 18 },
  snout:     { x: -42, y: -56, w: 14, h: 10 },
  jaw:       { x: -40, y: -48, w: 12, h: 6  },
  earL:      { x: -28, y: -68, w: 5,  h: 10 },
  earR:      { x: -18, y: -68, w: 5,  h: 10 },
  hornL:     { x: -30, y: -74, w: 4,  h: 12 },
  hornR:     { x: -16, y: -74, w: 4,  h: 12 },
  fLegL:     { x: -20, y: -22, w: 8,  h: 22 },
  fLegR:     { x: -14, y: -22, w: 8,  h: 22 },
  hLegL:     { x: 10,  y: -22, w: 8,  h: 22 },
  hLegR:     { x: 16,  y: -22, w: 8,  h: 22 },
  tail:      { x: 20,  y: -52, w: 18, h: 5  },
  tailTip:   { x: 36,  y: -54, w: 8,  h: 4  },
  spines:    { x: -10, y: -52, w: 24, h: 6  },
};

// Rotation pivots for each part
const PIVOTS = {
  body: { x: 0, y: -33 }, chest: { x: -8, y: -41 }, belly: { x: 6, y: -32 },
  head: { x: -19, y: -51 }, snout: { x: -35, y: -51 }, jaw: { x: -34, y: -45 },
  earL: { x: -26, y: -63 }, earR: { x: -16, y: -63 },
  hornL: { x: -28, y: -68 }, hornR: { x: -14, y: -68 },
  fLegL: { x: -16, y: -10 }, fLegR: { x: -10, y: -10 },
  hLegL: { x: 13, y: -10 }, hLegR: { x: 19, y: -10 },
  tail: { x: 22, y: -50 }, tailTip: { x: 38, y: -52 },
  spines: { x: 2, y: -49 },
};

// Color variants: basic (red demon), hellhound (purple), infernal (fire)
const PALETTES = {
  basic: {
    body: '#3a1a1a', chest: '#4a1a1a', belly: '#2a0e0e',
    head: '#3a1a1a', snout: '#2a1010', jaw: '#1a0808',
    ear: '#2a0e0e', horn: '#1a1a1a', leg: '#2a1010',
    tail: '#2a0e0e', tailTip: '#5a1a1a', spines: '#1a1a1a',
    eye: '#ff3300', eyeGlow: '#ff6600',
  },
  hellhound: {
    body: '#1a1a2a', chest: '#2a1a3a', belly: '#0e0e2a',
    head: '#1a1a2a', snout: '#10102a', jaw: '#08081a',
    ear: '#0e0e2a', horn: '#3a1a4a', leg: '#10102a',
    tail: '#0e0e2a', tailTip: '#4a1a5a', spines: '#2a1a3a',
    eye: '#aa00ff', eyeGlow: '#cc44ff',
  },
  infernal: {
    body: '#2a0a00', chest: '#3a1500', belly: '#1a0500',
    head: '#2a0a00', snout: '#1a0500', jaw: '#0a0200',
    ear: '#1a0500', horn: '#4a2000', leg: '#1a0500',
    tail: '#1a0500', tailTip: '#ff4400', spines: '#3a1500',
    eye: '#ffcc00', eyeGlow: '#ffee44',
  },
};


// GALLOP WALK CYCLE — 8 frames, asymmetric quadruped gait
const WALK_FRAMES = [
  { body: { y: 2, rot: 3 }, chest: { y: 2, rot: 3 }, belly: { y: 2, rot: 2 }, head: { y: 1, rot: -5 }, snout: { y: 1, rot: -5 }, jaw: { y: 2, rot: -3 }, earL: { rot: -10, y: 0 }, earR: { rot: -10, y: 0 }, hornL: { rot: -8, y: 0 }, hornR: { rot: -8, y: 0 }, fLegL: { rot: -30, y: 0 }, fLegR: { rot: -20, y: 0 }, hLegL: { rot: 30, y: 0 }, hLegR: { rot: 20, y: 0 }, tail: { rot: -15, y: 0 }, tailTip: { rot: -20, y: 0 }, spines: { y: 2, rot: 3 } },
  { body: { y: 0, rot: 1 }, chest: { y: -1, rot: -2 }, belly: { y: 0, rot: 1 }, head: { y: -2, rot: -8 }, snout: { y: -2, rot: -8 }, jaw: { y: -1, rot: -6 }, earL: { rot: -15, y: -1 }, earR: { rot: -15, y: -1 }, hornL: { rot: -12, y: -1 }, hornR: { rot: -12, y: -1 }, fLegL: { rot: 25, y: 0 }, fLegR: { rot: 15, y: 0 }, hLegL: { rot: 15, y: 0 }, hLegR: { rot: 5, y: 0 }, tail: { rot: 5, y: 0 }, tailTip: { rot: 10, y: 0 }, spines: { y: 0, rot: 1 } },
  { body: { y: -2, rot: -2 }, chest: { y: -3, rot: -4 }, belly: { y: -1, rot: -2 }, head: { y: -3, rot: -3 }, snout: { y: -3, rot: -3 }, jaw: { y: -2, rot: -2 }, earL: { rot: 5, y: -2 }, earR: { rot: 5, y: -2 }, hornL: { rot: 3, y: -2 }, hornR: { rot: 3, y: -2 }, fLegL: { rot: 5, y: 0 }, fLegR: { rot: -5, y: 0 }, hLegL: { rot: -10, y: 0 }, hLegR: { rot: -20, y: 0 }, tail: { rot: 15, y: -1 }, tailTip: { rot: 25, y: -2 }, spines: { y: -2, rot: -2 } },
  { body: { y: -3, rot: -4 }, chest: { y: -4, rot: -5 }, belly: { y: -2, rot: -3 }, head: { y: -4, rot: 0 }, snout: { y: -4, rot: 0 }, jaw: { y: -3, rot: 2 }, earL: { rot: 10, y: -3 }, earR: { rot: 10, y: -3 }, hornL: { rot: 8, y: -3 }, hornR: { rot: 8, y: -3 }, fLegL: { rot: -20, y: 0 }, fLegR: { rot: -30, y: 0 }, hLegL: { rot: -30, y: 0 }, hLegR: { rot: -20, y: 0 }, tail: { rot: 25, y: -2 }, tailTip: { rot: 35, y: -3 }, spines: { y: -3, rot: -4 } },
  { body: { y: -1, rot: -2 }, chest: { y: -2, rot: -3 }, belly: { y: -1, rot: -1 }, head: { y: -2, rot: 2 }, snout: { y: -2, rot: 2 }, jaw: { y: -1, rot: 3 }, earL: { rot: 5, y: -1 }, earR: { rot: 5, y: -1 }, hornL: { rot: 3, y: -1 }, hornR: { rot: 3, y: -1 }, fLegL: { rot: -15, y: 0 }, fLegR: { rot: -10, y: 0 }, hLegL: { rot: 25, y: 0 }, hLegR: { rot: 35, y: 0 }, tail: { rot: 10, y: -1 }, tailTip: { rot: 15, y: -1 }, spines: { y: -1, rot: -2 } },
  { body: { y: -4, rot: 0 }, chest: { y: -5, rot: -1 }, belly: { y: -3, rot: 0 }, head: { y: -5, rot: -4 }, snout: { y: -5, rot: -4 }, jaw: { y: -4, rot: -2 }, earL: { rot: -20, y: -4 }, earR: { rot: -20, y: -4 }, hornL: { rot: -15, y: -4 }, hornR: { rot: -15, y: -4 }, fLegL: { rot: -10, y: -3 }, fLegR: { rot: -15, y: -3 }, hLegL: { rot: 10, y: -3 }, hLegR: { rot: 15, y: -3 }, tail: { rot: -10, y: -3 }, tailTip: { rot: -15, y: -4 }, spines: { y: -4, rot: 0 } },
  { body: { y: -1, rot: 2 }, chest: { y: -1, rot: 1 }, belly: { y: 0, rot: 1 }, head: { y: -1, rot: -6 }, snout: { y: -1, rot: -6 }, jaw: { y: 0, rot: -4 }, earL: { rot: -12, y: 0 }, earR: { rot: -12, y: 0 }, hornL: { rot: -10, y: 0 }, hornR: { rot: -10, y: 0 }, fLegL: { rot: -25, y: 0 }, fLegR: { rot: -15, y: 0 }, hLegL: { rot: 20, y: 0 }, hLegR: { rot: 10, y: 0 }, tail: { rot: -5, y: 0 }, tailTip: { rot: -8, y: 0 }, spines: { y: -1, rot: 2 } },
  { body: { y: 3, rot: 4 }, chest: { y: 3, rot: 4 }, belly: { y: 2, rot: 3 }, head: { y: 2, rot: -2 }, snout: { y: 2, rot: -2 }, jaw: { y: 3, rot: 0 }, earL: { rot: -5, y: 1 }, earR: { rot: -5, y: 1 }, hornL: { rot: -3, y: 1 }, hornR: { rot: -3, y: 1 }, fLegL: { rot: 10, y: 2 }, fLegR: { rot: 5, y: 2 }, hLegL: { rot: -5, y: 0 }, hLegR: { rot: -15, y: 0 }, tail: { rot: -20, y: 1 }, tailTip: { rot: -25, y: 2 }, spines: { y: 3, rot: 4 } },
];

// DEATH SEQUENCE — 12 frames, yelp → stumble → roll → dissolve
const DEATH_FRAMES = [
  { body: { y: 0, rot: 8 }, chest: { y: 0, rot: 10 }, belly: { y: 0, rot: 5 }, head: { y: -3, rot: 20 }, snout: { y: -3, rot: 25 }, jaw: { y: -1, rot: 35 }, earL: { rot: -25, y: -2 }, earR: { rot: -25, y: -2 }, hornL: { rot: -20, y: -2 }, hornR: { rot: -20, y: -2 }, fLegL: { rot: 15, y: 0 }, fLegR: { rot: 20, y: 0 }, hLegL: { rot: -10, y: 0 }, hLegR: { rot: -15, y: 0 }, tail: { rot: 30, y: 0 }, tailTip: { rot: 40, y: 0 }, spines: { y: 0, rot: 8 }, opacity: 1, flash: true, scale: 1 },
  { body: { y: 2, rot: 12 }, chest: { y: 2, rot: 15 }, belly: { y: 2, rot: 8 }, head: { y: 0, rot: 15 }, snout: { y: 0, rot: 18 }, jaw: { y: 2, rot: 28 }, earL: { rot: -30, y: 0 }, earR: { rot: -30, y: 0 }, hornL: { rot: -25, y: 0 }, hornR: { rot: -25, y: 0 }, fLegL: { rot: 30, y: 2 }, fLegR: { rot: -20, y: 0 }, hLegL: { rot: -25, y: 2 }, hLegR: { rot: 20, y: 0 }, tail: { rot: 40, y: 2 }, tailTip: { rot: 55, y: 3 }, spines: { y: 2, rot: 12 }, opacity: 1, flash: false, scale: 1 },
  { body: { y: 8, rot: 18 }, chest: { y: 10, rot: 22 }, belly: { y: 6, rot: 14 }, head: { y: 8, rot: 10 }, snout: { y: 10, rot: 12 }, jaw: { y: 12, rot: 20 }, earL: { rot: -20, y: 6 }, earR: { rot: -20, y: 6 }, hornL: { rot: -15, y: 6 }, hornR: { rot: -15, y: 6 }, fLegL: { rot: 45, y: 6 }, fLegR: { rot: 40, y: 5 }, hLegL: { rot: -15, y: 3 }, hLegR: { rot: -10, y: 3 }, tail: { rot: 50, y: 5 }, tailTip: { rot: 65, y: 7 }, spines: { y: 8, rot: 18 }, opacity: 1, flash: false, scale: 1 },
  { body: { y: 16, rot: 25 }, chest: { y: 20, rot: 30 }, belly: { y: 12, rot: 20 }, head: { y: 18, rot: 5 }, snout: { y: 22, rot: 0 }, jaw: { y: 24, rot: 10 }, earL: { rot: -10, y: 14 }, earR: { rot: -10, y: 14 }, hornL: { rot: -5, y: 14 }, hornR: { rot: -5, y: 14 }, fLegL: { rot: 55, y: 12 }, fLegR: { rot: 50, y: 10 }, hLegL: { rot: 10, y: 8 }, hLegR: { rot: 5, y: 8 }, tail: { rot: 55, y: 10 }, tailTip: { rot: 70, y: 12 }, spines: { y: 16, rot: 25 }, opacity: 1, flash: true, scale: 1 },
  { body: { y: 24, rot: 40 }, chest: { y: 28, rot: 45 }, belly: { y: 20, rot: 32 }, head: { y: 26, rot: -10 }, snout: { y: 30, rot: -15 }, jaw: { y: 30, rot: -5 }, earL: { rot: 5, y: 22 }, earR: { rot: 5, y: 22 }, hornL: { rot: 10, y: 22 }, hornR: { rot: 10, y: 22 }, fLegL: { rot: 65, y: 18 }, fLegR: { rot: 70, y: 16 }, hLegL: { rot: 35, y: 14 }, hLegR: { rot: 30, y: 14 }, tail: { rot: 60, y: 16 }, tailTip: { rot: 75, y: 18 }, spines: { y: 24, rot: 40 }, opacity: 0.95, flash: false, scale: 1 },
  { body: { y: 32, rot: 55 }, chest: { y: 35, rot: 58 }, belly: { y: 28, rot: 48 }, head: { y: 33, rot: -20 }, snout: { y: 36, rot: -25 }, jaw: { y: 36, rot: -15 }, earL: { rot: 15, y: 28 }, earR: { rot: 15, y: 28 }, hornL: { rot: 20, y: 28 }, hornR: { rot: 20, y: 28 }, fLegL: { rot: 75, y: 24 }, fLegR: { rot: 78, y: 22 }, hLegL: { rot: 50, y: 20 }, hLegR: { rot: 45, y: 20 }, tail: { rot: 65, y: 22 }, tailTip: { rot: 80, y: 24 }, spines: { y: 32, rot: 55 }, opacity: 0.9, flash: false, scale: 0.98 },
  { body: { y: 34, rot: 60 }, chest: { y: 37, rot: 62 }, belly: { y: 30, rot: 52 }, head: { y: 35, rot: -15 }, snout: { y: 38, rot: -20 }, jaw: { y: 39, rot: -10 }, earL: { rot: 20, y: 30 }, earR: { rot: 10, y: 30 }, hornL: { rot: 25, y: 30 }, hornR: { rot: 15, y: 30 }, fLegL: { rot: 80, y: 26 }, fLegR: { rot: 70, y: 25 }, hLegL: { rot: 55, y: 22 }, hLegR: { rot: 60, y: 22 }, tail: { rot: 70, y: 24 }, tailTip: { rot: 85, y: 26 }, spines: { y: 34, rot: 60 }, opacity: 0.85, flash: true, scale: 0.97 },
  { body: { y: 35, rot: 65 }, chest: { y: 38, rot: 66 }, belly: { y: 31, rot: 56 }, head: { y: 36, rot: -18 }, snout: { y: 39, rot: -22 }, jaw: { y: 40, rot: -12 }, earL: { rot: 22, y: 31 }, earR: { rot: 22, y: 31 }, hornL: { rot: 28, y: 31 }, hornR: { rot: 28, y: 31 }, fLegL: { rot: 82, y: 27 }, fLegR: { rot: 80, y: 26 }, hLegL: { rot: 58, y: 23 }, hLegR: { rot: 55, y: 23 }, tail: { rot: 72, y: 25 }, tailTip: { rot: 88, y: 27 }, spines: { y: 35, rot: 65 }, opacity: 0.7, flash: false, scale: 0.95 },
  { body: { y: 36, rot: 68 }, chest: { y: 39, rot: 68 }, belly: { y: 32, rot: 58 }, head: { y: 37, rot: -20 }, snout: { y: 40, rot: -24 }, jaw: { y: 41, rot: -14 }, earL: { rot: 24, y: 32 }, earR: { rot: 24, y: 32 }, hornL: { rot: 30, y: 32 }, hornR: { rot: 30, y: 32 }, fLegL: { rot: 83, y: 28 }, fLegR: { rot: 82, y: 27 }, hLegL: { rot: 60, y: 24 }, hLegR: { rot: 58, y: 24 }, tail: { rot: 74, y: 26 }, tailTip: { rot: 90, y: 28 }, spines: { y: 36, rot: 68 }, opacity: 0.5, flash: false, scale: 0.93 },
  { body: { y: 37, rot: 70 }, chest: { y: 40, rot: 70 }, belly: { y: 33, rot: 60 }, head: { y: 38, rot: -22 }, snout: { y: 41, rot: -26 }, jaw: { y: 42, rot: -16 }, earL: { rot: 26, y: 33 }, earR: { rot: 26, y: 33 }, hornL: { rot: 32, y: 33 }, hornR: { rot: 32, y: 33 }, fLegL: { rot: 84, y: 29 }, fLegR: { rot: 83, y: 28 }, hLegL: { rot: 62, y: 25 }, hLegR: { rot: 60, y: 25 }, tail: { rot: 76, y: 27 }, tailTip: { rot: 90, y: 29 }, spines: { y: 37, rot: 70 }, opacity: 0.3, flash: false, scale: 0.91 },
  { body: { y: 38, rot: 72 }, chest: { y: 41, rot: 72 }, belly: { y: 34, rot: 62 }, head: { y: 39, rot: -24 }, snout: { y: 42, rot: -28 }, jaw: { y: 43, rot: -18 }, earL: { rot: 28, y: 34 }, earR: { rot: 28, y: 34 }, hornL: { rot: 34, y: 34 }, hornR: { rot: 34, y: 34 }, fLegL: { rot: 85, y: 30 }, fLegR: { rot: 84, y: 29 }, hLegL: { rot: 64, y: 26 }, hLegR: { rot: 62, y: 26 }, tail: { rot: 78, y: 28 }, tailTip: { rot: 90, y: 30 }, spines: { y: 38, rot: 72 }, opacity: 0.12, flash: false, scale: 0.88 },
  { body: { y: 38, rot: 75 }, chest: { y: 41, rot: 75 }, belly: { y: 34, rot: 65 }, head: { y: 39, rot: -26 }, snout: { y: 42, rot: -30 }, jaw: { y: 43, rot: -20 }, earL: { rot: 30, y: 35 }, earR: { rot: 30, y: 35 }, hornL: { rot: 36, y: 35 }, hornR: { rot: 36, y: 35 }, fLegL: { rot: 85, y: 31 }, fLegR: { rot: 85, y: 30 }, hLegL: { rot: 65, y: 27 }, hLegR: { rot: 63, y: 27 }, tail: { rot: 80, y: 29 }, tailTip: { rot: 90, y: 31 }, spines: { y: 38, rot: 75 }, opacity: 0, flash: false, scale: 0.85 },
];

// ═══════════════════════════════════════════════════════════════════════
// DEMON DOG ANIMATOR CLASS
// ═══════════════════════════════════════════════════════════════════════

export class DemonDogAnimator {
  constructor(variant = 'basic') {
    this.variant = variant;
    this.palette = PALETTES[variant] || PALETTES.basic;
    this.state = AnimState.WALK;
    this.time = 0;
    this.deathDone = false;
    this.flashTimer = 0;
    this.particleSystem = new ParticleSystem();
  }

  /**
   * Update animation state and time
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    this.time += deltaTime;
    
    // Update flash effect
    if (this.flashTimer > 0) {
      this.flashTimer -= deltaTime;
    }
    
    // Update particles
    this.particleSystem.update(deltaTime);
    
    // Death sequence completion check
    if (this.state === AnimState.DEATH) {
      const deathDuration = DEATH_FRAMES.length / 6; // 6 fps for death
      if (this.time >= deathDuration) {
        this.deathDone = true;
      }
    }
  }

  /**
   * Render demon dog to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} cx - Center X in world space
   * @param {number} cy - Center Y in world space
   * @param {number} scale - Render scale factor
   */
  render(ctx, cx, cy, scale = 1) {
    // Get current frame based on state
    const frame = this._getCurrentFrame();
    const opacity = frame.opacity ?? 1;
    const frameScale = frame.scale ?? 1;
    const isFlash = (frame.flash || this.flashTimer > 0);
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale * frameScale, scale * frameScale);
    ctx.globalAlpha = opacity;
    
    // Draw order: back legs → tail → body layers → front legs → head
    this._drawPart(ctx, 'hLegL', frame, isFlash, this.palette.leg);
    this._drawPart(ctx, 'hLegR', frame, isFlash, this.palette.leg);
    this._drawPart(ctx, 'tail', frame, isFlash, this.palette.tail);
    this._drawPart(ctx, 'tailTip', frame, isFlash, this.palette.tailTip);
    
    // Tail flame effect
    if (!isFlash) this._renderTailFlame(ctx, frame);
    
    this._drawPart(ctx, 'belly', frame, isFlash, this.palette.belly);
    this._drawPart(ctx, 'body', frame, isFlash, this.palette.body);
    
    // Rib cage detail
    if (!isFlash) this._renderRibCage(ctx, frame);
    
    this._drawPart(ctx, 'chest', frame, isFlash, this.palette.chest);
    this._drawPart(ctx, 'spines', frame, isFlash, this.palette.spines);
    
    // Spine ridges detail
    if (!isFlash) this._renderSpineRidges(ctx, frame);
    
    this._drawPart(ctx, 'fLegL', frame, isFlash, this.palette.leg);
    this._drawPart(ctx, 'fLegR', frame, isFlash, this.palette.leg);
    
    // Paw claws
    if (!isFlash) this._renderClaws(ctx, frame);
    
    this._drawPart(ctx, 'head', frame, isFlash, this.palette.head);
    this._drawPart(ctx, 'snout', frame, isFlash, this.palette.snout);
    this._drawPart(ctx, 'jaw', frame, isFlash, this.palette.jaw);
    
    // Teeth
    if (!isFlash) this._renderTeeth(ctx, frame);
    
    this._drawPart(ctx, 'earL', frame, isFlash, this.palette.ear);
    this._drawPart(ctx, 'earR', frame, isFlash, this.palette.ear);
    this._drawPart(ctx, 'hornL', frame, isFlash, this.palette.horn);
    this._drawPart(ctx, 'hornR', frame, isFlash, this.palette.horn);
    
    // Horn glow
    if (!isFlash) this._renderHornGlow(ctx, frame, opacity);
    
    // Eyes
    if (!isFlash) this._renderEyes(ctx, frame, opacity);
    
    // Nose
    if (!isFlash) this._renderNose(ctx, frame);
    
    ctx.restore();
    
    // Particles (in world space)
    this.particleSystem.render(ctx, cx, cy);
  }

  /**
   * Set animation state
   * @param {string} state - New state (WALK or DEATH)
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;
      this.time = 0;
      
      // Spawn death particles
      if (state === AnimState.DEATH) {
        this.deathDone = false;
        this.particleSystem.spawnHellfire(15);
      }
    }
  }

  /**
   * Trigger damage flash effect
   */
  flash() {
    this.flashTimer = 0.1; // 100ms flash
  }

  /**
   * Reset animator for object pooling
   * @param {string} variant - Enemy variant (basic/hellhound/infernal)
   */
  reset(variant = 'basic') {
    this.variant = variant;
    this.palette = PALETTES[variant] || PALETTES.basic;
    this.state = AnimState.WALK;
    this.time = 0;
    this.deathDone = false;
    this.flashTimer = 0;
    this.particleSystem.clear();
  }

  /**
   * Check if death animation is complete
   * @returns {boolean} True if death sequence finished
   */
  isDeathComplete() {
    return this.state === AnimState.DEATH && this.deathDone && this.particleSystem.getCount() === 0;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PRIVATE HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════

  /** @private */
  _getCurrentFrame() {
    const frames = this.state === AnimState.DEATH ? DEATH_FRAMES : WALK_FRAMES;
    const fps = this.state === AnimState.DEATH ? 6 : 10;
    const frameIndex = Math.floor(this.time * fps) % frames.length;
    const nextIndex = (frameIndex + 1) % frames.length;
    const t = (this.time * fps) % 1;
    
    // Interpolate between frames
    return lerpFrame(frames[frameIndex], frames[nextIndex], t);
  }

  /** @private */
  _drawPart(ctx, partName, frame, isFlash, color) {
    const part = DEMON_DOG_PARTS[partName];
    const pivot = PIVOTS[partName];
    const frameData = frame[partName];
    const rot = ((frameData?.rot || 0) * Math.PI) / 180;
    const offY = frameData?.y || 0;
    
    ctx.save();
    ctx.translate(pivot.x, pivot.y + offY);
    ctx.rotate(rot);
    ctx.fillStyle = isFlash ? '#fff' : color;
    ctx.fillRect(part.x - pivot.x, part.y - pivot.y, part.w, part.h);
    ctx.restore();
  }

  /** @private */
  _renderTailFlame(ctx, frame) {
    const tRot = ((frame.tailTip?.rot || 0) * Math.PI) / 180;
    const tY = frame.tailTip?.y || 0;
    ctx.save();
    ctx.translate(38, -52 + tY);
    ctx.rotate(tRot);
    
    const flicker = Math.sin(Date.now() / 80) * 2;
    ctx.fillStyle = this.variant === 'hellhound' ? 'rgba(170,0,255,0.6)' :
                    this.variant === 'infernal' ? 'rgba(255,200,0,0.6)' :
                    'rgba(255,60,0,0.6)';
    ctx.fillRect(-2 + flicker, -8, 4, 5);
    ctx.fillStyle = this.variant === 'hellhound' ? 'rgba(200,80,255,0.4)' :
                    this.variant === 'infernal' ? 'rgba(255,240,100,0.4)' :
                    'rgba(255,120,0,0.4)';
    ctx.fillRect(-1 - flicker, -11, 3, 4);
    ctx.restore();
  }

  /** @private */
  _renderRibCage(ctx, frame) {
    const bRot = ((frame.body?.rot || 0) * Math.PI) / 180;
    const bY = frame.body?.y || 0;
    ctx.save();
    ctx.translate(0, -33 + bY);
    ctx.rotate(bRot);
    ctx.fillStyle = 'rgba(80,30,30,0.5)';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(-12 + i * 8, -10, 5, 1.5);
    }
    ctx.restore();
  }

  /** @private */
  _renderSpineRidges(ctx, frame) {
    const sRot = ((frame.spines?.rot || 0) * Math.PI) / 180;
    const sY = frame.spines?.y || 0;
    ctx.save();
    ctx.translate(2, -49 + sY);
    ctx.rotate(sRot);
    ctx.fillStyle = this.variant === 'hellhound' ? '#4a2a5a' :
                    this.variant === 'infernal' ? '#5a2a00' : '#2a0e0e';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(-10 + i * 5, -5, 3, -4 - (i === 2 ? 3 : 0));
    }
    ctx.restore();
  }

  /** @private */
  _renderClaws(ctx, frame) {
    // Front left claws
    const fLRot = ((frame.fLegL?.rot || 0) * Math.PI) / 180;
    const fLY = frame.fLegL?.y || 0;
    ctx.save();
    ctx.translate(-16, -10 + fLY);
    ctx.rotate(fLRot);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-6, 10, 2, 3);
    ctx.fillRect(-3, 10, 2, 3);
    ctx.fillRect(0, 10, 2, 3);
    ctx.restore();
    
    // Front right claws
    const fRRot = ((frame.fLegR?.rot || 0) * Math.PI) / 180;
    const fRY = frame.fLegR?.y || 0;
    ctx.save();
    ctx.translate(-10, -10 + fRY);
    ctx.rotate(fRRot);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-6, 10, 2, 3);
    ctx.fillRect(-3, 10, 2, 3);
    ctx.fillRect(0, 10, 2, 3);
    ctx.restore();
  }

  /** @private */
  _renderTeeth(ctx, frame) {
    // Upper fangs on snout
    const sRot = ((frame.snout?.rot || 0) * Math.PI) / 180;
    const sY = frame.snout?.y || 0;
    ctx.save();
    ctx.translate(-35, -51 + sY);
    ctx.rotate(sRot);
    ctx.fillStyle = '#e8e8d0';
    ctx.fillRect(-8, 7, 2, 4);
    ctx.fillRect(-4, 7, 2, 3);
    ctx.fillRect(0, 7, 2, 4);
    ctx.restore();
    
    // Lower fangs on jaw
    const jRot = ((frame.jaw?.rot || 0) * Math.PI) / 180;
    const jY = frame.jaw?.y || 0;
    ctx.save();
    ctx.translate(-34, -45 + jY);
    ctx.rotate(jRot);
    ctx.fillStyle = '#d8d8c0';
    ctx.fillRect(-7, -4, 2, 3);
    ctx.fillRect(-3, -4, 2, 2);
    ctx.fillRect(1, -4, 2, 3);
    ctx.restore();
  }

  /** @private */
  _renderHornGlow(ctx, frame, opacity) {
    // Left horn glow
    const hlRot = ((frame.hornL?.rot || 0) * Math.PI) / 180;
    const hlY = frame.hornL?.y || 0;
    ctx.save();
    ctx.translate(-28, -68 + hlY);
    ctx.rotate(hlRot);
    ctx.fillStyle = this.palette.eyeGlow;
    ctx.globalAlpha = opacity * (0.5 + Math.sin(Date.now() / 200) * 0.3);
    ctx.fillRect(-3, -8, 3, 3);
    ctx.globalAlpha = opacity;
    ctx.restore();
    
    // Right horn glow
    const hrRot = ((frame.hornR?.rot || 0) * Math.PI) / 180;
    const hrY = frame.hornR?.y || 0;
    ctx.save();
    ctx.translate(-14, -68 + hrY);
    ctx.rotate(hrRot);
    ctx.fillStyle = this.palette.eyeGlow;
    ctx.globalAlpha = opacity * (0.5 + Math.sin(Date.now() / 200) * 0.3);
    ctx.fillRect(-3, -8, 3, 3);
    ctx.globalAlpha = opacity;
    ctx.restore();
  }

  /** @private */
  _renderEyes(ctx, frame, opacity) {
    const hRot = ((frame.head?.rot || 0) * Math.PI) / 180;
    const hY = frame.head?.y || 0;
    ctx.save();
    ctx.translate(-19, -51 + hY);
    ctx.rotate(hRot);
    
    // Eye glow halo
    ctx.fillStyle = this.palette.eyeGlow;
    ctx.globalAlpha = opacity * (0.3 + Math.sin(Date.now() / 150) * 0.15);
    ctx.fillRect(-12, -7, 6, 5);
    ctx.fillRect(-4, -7, 6, 5);
    
    // Eye core
    ctx.globalAlpha = opacity;
    ctx.fillStyle = this.palette.eye;
    ctx.fillRect(-11, -6, 4, 3);
    ctx.fillRect(-3, -6, 4, 3);
    
    // Pupil slit
    ctx.fillStyle = '#000';
    ctx.fillRect(-9.5, -6, 1.5, 3);
    ctx.fillRect(-1.5, -6, 1.5, 3);
    
    ctx.restore();
  }

  /** @private */
  _renderNose(ctx, frame) {
    const snRot = ((frame.snout?.rot || 0) * Math.PI) / 180;
    const snY = frame.snout?.y || 0;
    ctx.save();
    ctx.translate(-35, -51 + snY);
    ctx.rotate(snRot);
    ctx.fillStyle = '#0a0505';
    ctx.fillRect(-8, -3, 4, 3);
    ctx.restore();
  }
}
