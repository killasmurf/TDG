// src/animation/enemyAnimators/MiniBossAnimator.js
// Mini Boss skeletal animation — a hulking armored warlord with a greataxe
// Walk: heavy stomp cycle with shoulder sway
// Death: dramatic collapse with ground-slam shockwave particles

import { AnimState } from '../AnimState.js';

// ─── Interpolation helpers (local copies to keep this file self-contained) ───
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpFrame(a, b, t) {
  const result = {};
  for (const key of Object.keys(a)) {
    if (typeof a[key] === 'object' && a[key] !== null) {
      result[key] = {};
      for (const prop of Object.keys(a[key])) {
        result[key][prop] = lerp(a[key][prop] || 0, b[key]?.[prop] || 0, t);
      }
    } else if (typeof a[key] === 'number') {
      result[key] = lerp(a[key], b[key] ?? a[key], t);
    } else {
      result[key] = t < 0.5 ? a[key] : b[key];
    }
  }
  return result;
}

// ─── Body parts (relative to center-bottom origin, model is ~130 local units tall) ───
// The mini boss is bulkier: wider torso, thick legs, massive axe
const PARTS = {
  // Core body
  torso:      { x: -24, y: -80, w: 48, h: 60 },
  // Shoulder pauldrons (wide armor plates)
  lPauldron:  { x: -42, y: -78, w: 22, h: 12 },
  rPauldron:  { x: 20,  y: -78, w: 22, h: 12 },
  // Head with full-face helm
  head:       { x: -14, y: -108, w: 28, h: 28 },
  helm:       { x: -18, y: -120, w: 36, h: 14 },
  // Legs — thick, armored
  lLeg:       { x: -20, y: -20, w: 18, h: 40 },
  rLeg:       { x: 2,   y: -20, w: 18, h: 40 },
  // Arms
  lArm:       { x: -40, y: -74, w: 14, h: 42 },
  rArm:       { x: 26,  y: -74, w: 14, h: 42 },
  // Greataxe — long handle + two-sided axe head
  axeHandle:  { x: 32,  y: -90, w: 6,  h: 80 },
  axeHead:    { x: 22,  y: -98, w: 26, h: 16 },
  axeHead2:   { x: 22,  y: -82, w: 26, h: 14 },
  // Belly plate (lower armor)
  bellyPlate: { x: -20, y: -30, w: 40, h: 12 },
};

// Pivot points (rotation centers for each part)
const PIVOTS = {
  torso:      { x: 0,   y: -50 },
  lPauldron:  { x: -30, y: -72 },
  rPauldron:  { x: 30,  y: -72 },
  head:       { x: 0,   y: -94 },
  helm:       { x: 0,   y: -113 },
  lLeg:       { x: -11, y: -20 },
  rLeg:       { x: 11,  y: -20 },
  lArm:       { x: -33, y: -64 },
  rArm:       { x: 33,  y: -64 },
  axeHandle:  { x: 35,  y: -30 },
  axeHead:    { x: 35,  y: -90 },
  axeHead2:   { x: 35,  y: -74 },
  bellyPlate: { x: 0,   y: -24 },
};

// ─── Color palette ───
// Dark iron armor with blood-red accents — distinct from other enemy types
const PALETTE = {
  armor:     '#1a1a1a',   // near-black plate
  armorEdge: '#2e2e2e',   // armor highlight
  cloth:     '#3a0808',   // dark crimson undercloth
  skin:      '#8a5a3a',   // rough skin (barely visible)
  helm:      '#111111',
  helmVisor: '#8B0000',   // glowing red visor slit
  axe:       '#606060',   // dark steel
  axeEdge:   '#c0c0c0',   // sharp silver edge
  axeWrap:   '#3a1a00',   // leather wrap
  crest:     '#8B0000',   // blood-red crest plume
};

// ─── WALK CYCLE — 8 frames, heavy stomp ───
// Slower, more exaggerated leg lift than the samurai. Torso bobs and sways side to side.
const WALK_FRAMES = [
  // Frame 0: Left foot strikes ground (stomp)
  { lLeg: { rot: 20 }, rLeg: { rot: -20 }, lArm: { rot: -12, y: 0 }, rArm: { rot: 10, y: 0 },
    torso: { y: -2, rot: -2 }, head: { y: -2, rot: 1 }, helm: { y: -2, rot: 1 },
    lPauldron: { rot: -4, y: -2 }, rPauldron: { rot: 4, y: -2 },
    axeHandle: { rot: 8, y: 0 }, axeHead: { rot: 8, y: 0 }, axeHead2: { rot: 8, y: 0 }, bellyPlate: { y: -2 } },
  // Frame 1: Transition
  { lLeg: { rot: 10 }, rLeg: { rot: -10 }, lArm: { rot: -8, y: 2 }, rArm: { rot: 6, y: 2 },
    torso: { y: 2, rot: -1 }, head: { y: 2, rot: 0 }, helm: { y: 2, rot: 0 },
    lPauldron: { rot: -2, y: 2 }, rPauldron: { rot: 2, y: 2 },
    axeHandle: { rot: 5, y: 2 }, axeHead: { rot: 5, y: 2 }, axeHead2: { rot: 5, y: 2 }, bellyPlate: { y: 2 } },
  // Frame 2: Mid-stride neutral
  { lLeg: { rot: 0 }, rLeg: { rot: 0 }, lArm: { rot: 0, y: 0 }, rArm: { rot: 0, y: 0 },
    torso: { y: -1, rot: 0 }, head: { y: -1, rot: 0 }, helm: { y: -1, rot: 0 },
    lPauldron: { rot: 0, y: -1 }, rPauldron: { rot: 0, y: -1 },
    axeHandle: { rot: 2, y: -1 }, axeHead: { rot: 2, y: -1 }, axeHead2: { rot: 2, y: -1 }, bellyPlate: { y: -1 } },
  // Frame 3: Transition to right stomp
  { lLeg: { rot: -10 }, rLeg: { rot: 10 }, lArm: { rot: 8, y: 2 }, rArm: { rot: -6, y: 2 },
    torso: { y: 2, rot: 1 }, head: { y: 2, rot: 0 }, helm: { y: 2, rot: 0 },
    lPauldron: { rot: 2, y: 2 }, rPauldron: { rot: -2, y: 2 },
    axeHandle: { rot: -2, y: 2 }, axeHead: { rot: -2, y: 2 }, axeHead2: { rot: -2, y: 2 }, bellyPlate: { y: 2 } },
  // Frame 4: Right foot strikes (mirror stomp)
  { lLeg: { rot: -20 }, rLeg: { rot: 20 }, lArm: { rot: 12, y: 0 }, rArm: { rot: -10, y: 0 },
    torso: { y: -2, rot: 2 }, head: { y: -2, rot: -1 }, helm: { y: -2, rot: -1 },
    lPauldron: { rot: 4, y: -2 }, rPauldron: { rot: -4, y: -2 },
    axeHandle: { rot: -5, y: 0 }, axeHead: { rot: -5, y: 0 }, axeHead2: { rot: -5, y: 0 }, bellyPlate: { y: -2 } },
  // Frame 5: Transition back
  { lLeg: { rot: -10 }, rLeg: { rot: 10 }, lArm: { rot: 8, y: 2 }, rArm: { rot: -6, y: 2 },
    torso: { y: 2, rot: 1 }, head: { y: 2, rot: 0 }, helm: { y: 2, rot: 0 },
    lPauldron: { rot: 2, y: 2 }, rPauldron: { rot: -2, y: 2 },
    axeHandle: { rot: -3, y: 2 }, axeHead: { rot: -3, y: 2 }, axeHead2: { rot: -3, y: 2 }, bellyPlate: { y: 2 } },
  // Frame 6: Neutral
  { lLeg: { rot: 0 }, rLeg: { rot: 0 }, lArm: { rot: 0, y: 0 }, rArm: { rot: 0, y: 0 },
    torso: { y: -1, rot: 0 }, head: { y: -1, rot: 0 }, helm: { y: -1, rot: 0 },
    lPauldron: { rot: 0, y: -1 }, rPauldron: { rot: 0, y: -1 },
    axeHandle: { rot: 0, y: -1 }, axeHead: { rot: 0, y: -1 }, axeHead2: { rot: 0, y: -1 }, bellyPlate: { y: -1 } },
  // Frame 7: Preparing for next left stomp
  { lLeg: { rot: 10 }, rLeg: { rot: -10 }, lArm: { rot: -8, y: 2 }, rArm: { rot: 6, y: 2 },
    torso: { y: 2, rot: -1 }, head: { y: 2, rot: 0 }, helm: { y: 2, rot: 0 },
    lPauldron: { rot: -2, y: 2 }, rPauldron: { rot: 2, y: 2 },
    axeHandle: { rot: 4, y: 2 }, axeHead: { rot: 4, y: 2 }, axeHead2: { rot: 4, y: 2 }, bellyPlate: { y: 2 } },
];

// ─── DEATH SEQUENCE — 14 frames ───
// The mini boss raises its axe, staggers, slams axe into ground, then collapses forward.
// Ground slam triggers a shockwave particle burst at frame 8.
const DEATH_FRAMES = [
  // 0: Hit reaction — reel backward, axe flies up
  { torso: { y: 0, rot: -8 }, head: { rot: 12, y: -3 }, helm: { rot: 14, y: -4 },
    lLeg: { rot: 8 }, rLeg: { rot: -8 }, lArm: { rot: -50, y: -5 }, rArm: { rot: -60, y: -8 },
    lPauldron: { rot: -6, y: -3 }, rPauldron: { rot: -8, y: -3 },
    axeHandle: { rot: -45, y: -15 }, axeHead: { rot: -45, y: -15 }, axeHead2: { rot: -45, y: -15 }, bellyPlate: { y: 0 },
    opacity: 1, flash: true },
  // 1: Staggers — axe swings wildly
  { torso: { y: 2, rot: -15 }, head: { rot: 18, y: 0 }, helm: { rot: 20, y: -2 },
    lLeg: { rot: 15 }, rLeg: { rot: -12 }, lArm: { rot: -60, y: 0 }, rArm: { rot: -70, y: 5 },
    lPauldron: { rot: -8, y: 2 }, rPauldron: { rot: -10, y: 2 },
    axeHandle: { rot: -55, y: -5 }, axeHead: { rot: -55, y: -5 }, axeHead2: { rot: -55, y: -5 }, bellyPlate: { y: 2 },
    opacity: 1 },
  // 2: Axe raised overhead (last stand pose)
  { torso: { y: -2, rot: -5 }, head: { rot: 8, y: -5 }, helm: { rot: 10, y: -6 },
    lLeg: { rot: 5 }, rLeg: { rot: -5 }, lArm: { rot: -30, y: -8 }, rArm: { rot: -80, y: -12 },
    lPauldron: { rot: -4, y: -2 }, rPauldron: { rot: -6, y: -2 },
    axeHandle: { rot: -80, y: -20 }, axeHead: { rot: -80, y: -20 }, axeHead2: { rot: -80, y: -20 }, bellyPlate: { y: -2 },
    opacity: 1 },
  // 3: Begins to topple forward
  { torso: { y: 5, rot: 10 }, head: { rot: -5, y: 3 }, helm: { rot: -6, y: 2 },
    lLeg: { rot: -5 }, rLeg: { rot: 5 }, lArm: { rot: 10, y: 5 }, rArm: { rot: -40, y: 0 },
    lPauldron: { rot: 4, y: 5 }, rPauldron: { rot: 2, y: 5 },
    axeHandle: { rot: -30, y: -5 }, axeHead: { rot: -30, y: -5 }, axeHead2: { rot: -30, y: -5 }, bellyPlate: { y: 5 },
    opacity: 1 },
  // 4: Falls faster
  { torso: { y: 14, rot: 25 }, head: { rot: -12, y: 10 }, helm: { rot: -14, y: 8 },
    lLeg: { rot: -15, y: 5 }, rLeg: { rot: 10, y: 5 }, lArm: { rot: 25, y: 10 }, rArm: { rot: -20, y: 5 },
    lPauldron: { rot: 8, y: 14 }, rPauldron: { rot: 6, y: 14 },
    axeHandle: { rot: -10, y: 5 }, axeHead: { rot: -10, y: 5 }, axeHead2: { rot: -10, y: 5 }, bellyPlate: { y: 14 },
    opacity: 1 },
  // 5: Falling — arms outstretched
  { torso: { y: 26, rot: 42 }, head: { rot: -20, y: 20 }, helm: { rot: -22, y: 18 },
    lLeg: { rot: -25, y: 12 }, rLeg: { rot: 18, y: 12 }, lArm: { rot: 40, y: 18 }, rArm: { rot: -5, y: 12 },
    lPauldron: { rot: 14, y: 26 }, rPauldron: { rot: 10, y: 26 },
    axeHandle: { rot: 10, y: 15 }, axeHead: { rot: 10, y: 15 }, axeHead2: { rot: 10, y: 15 }, bellyPlate: { y: 26 },
    opacity: 0.95 },
  // 6: Almost horizontal
  { torso: { y: 36, rot: 58 }, head: { rot: -28, y: 30 }, helm: { rot: -30, y: 28 },
    lLeg: { rot: -35, y: 20 }, rLeg: { rot: 28, y: 20 }, lArm: { rot: 55, y: 26 }, rArm: { rot: 10, y: 20 },
    lPauldron: { rot: 20, y: 36 }, rPauldron: { rot: 16, y: 36 },
    axeHandle: { rot: 25, y: 28 }, axeHead: { rot: 25, y: 28 }, axeHead2: { rot: 25, y: 28 }, bellyPlate: { y: 36 },
    opacity: 0.9 },
  // 7: Pre-impact (axe tip about to hit ground)
  { torso: { y: 44, rot: 72 }, head: { rot: -35, y: 38 }, helm: { rot: -36, y: 36 },
    lLeg: { rot: -45, y: 28 }, rLeg: { rot: 35, y: 28 }, lArm: { rot: 65, y: 34 }, rArm: { rot: 20, y: 28 },
    lPauldron: { rot: 26, y: 44 }, rPauldron: { rot: 20, y: 44 },
    axeHandle: { rot: 38, y: 40 }, axeHead: { rot: 38, y: 40 }, axeHead2: { rot: 38, y: 40 }, bellyPlate: { y: 44 },
    opacity: 0.85 },
  // 8: GROUND SLAM — body hits ground (triggers shockwave particles)
  { torso: { y: 48, rot: 82 }, head: { rot: -40, y: 43 }, helm: { rot: -42, y: 41 },
    lLeg: { rot: -52, y: 34 }, rLeg: { rot: 42, y: 34 }, lArm: { rot: 70, y: 40 }, rArm: { rot: 30, y: 34 },
    lPauldron: { rot: 30, y: 48 }, rPauldron: { rot: 24, y: 48 },
    axeHandle: { rot: 45, y: 48 }, axeHead: { rot: 45, y: 48 }, axeHead2: { rot: 45, y: 48 }, bellyPlate: { y: 48 },
    opacity: 0.8, flash: true },
  // 9-13: Fade out lying flat
  { torso: { y: 50, rot: 86 }, head: { rot: -42, y: 45 }, helm: { rot: -44, y: 43 },
    lLeg: { rot: -55, y: 36 }, rLeg: { rot: 44, y: 36 }, lArm: { rot: 72, y: 42 }, rArm: { rot: 32, y: 36 },
    lPauldron: { rot: 32, y: 50 }, rPauldron: { rot: 26, y: 50 },
    axeHandle: { rot: 46, y: 50 }, axeHead: { rot: 46, y: 50 }, axeHead2: { rot: 46, y: 50 }, bellyPlate: { y: 50 },
    opacity: 0.6 },
  { torso: { y: 51, rot: 88 }, head: { rot: -43, y: 46 }, helm: { rot: -44, y: 44 },
    lLeg: { rot: -56, y: 37 }, rLeg: { rot: 45, y: 37 }, lArm: { rot: 73, y: 43 }, rArm: { rot: 33, y: 37 },
    lPauldron: { rot: 33, y: 51 }, rPauldron: { rot: 27, y: 51 },
    axeHandle: { rot: 46, y: 51 }, axeHead: { rot: 46, y: 51 }, axeHead2: { rot: 46, y: 51 }, bellyPlate: { y: 51 },
    opacity: 0.4 },
  { torso: { y: 52, rot: 89 }, head: { rot: -43, y: 47 }, helm: { rot: -45, y: 45 },
    lLeg: { rot: -56, y: 38 }, rLeg: { rot: 45, y: 38 }, lArm: { rot: 73, y: 44 }, rArm: { rot: 33, y: 38 },
    lPauldron: { rot: 33, y: 52 }, rPauldron: { rot: 27, y: 52 },
    axeHandle: { rot: 46, y: 52 }, axeHead: { rot: 46, y: 52 }, axeHead2: { rot: 46, y: 52 }, bellyPlate: { y: 52 },
    opacity: 0.2 },
  { torso: { y: 52, rot: 90 }, head: { rot: -44, y: 47 }, helm: { rot: -45, y: 45 },
    lLeg: { rot: -57, y: 38 }, rLeg: { rot: 46, y: 38 }, lArm: { rot: 74, y: 44 }, rArm: { rot: 34, y: 38 },
    lPauldron: { rot: 33, y: 52 }, rPauldron: { rot: 27, y: 52 },
    axeHandle: { rot: 46, y: 52 }, axeHead: { rot: 46, y: 52 }, axeHead2: { rot: 46, y: 52 }, bellyPlate: { y: 52 },
    opacity: 0 },
];

// ─── MiniBossAnimator class ───
class MiniBossAnimator {
  constructor() {
    this.state = AnimState.WALK;
    this.time = 0;
    this.walkSpeed = 5;   // slower stomp cycle — 5 fps
    this.deathSpeed = 5;  // death slightly slower for drama
    this.deathDone = false;
    this.flashTimer = 0;
    this.particles = [];
  }

  setState(state) {
    if (state === AnimState.DEATH && this.state !== AnimState.DEATH) {
      this.time = 0;
      this.deathDone = false;
      this._spawnImpactParticles(14); // big burst on death start
    }
    this.state = state;
  }

  flash() {
    this.flashTimer = 0.12; // slightly longer flash than regular enemies
  }

  update(deltaTime) {
    if (this.flashTimer > 0) this.flashTimer -= deltaTime;

    // Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx * deltaTime * 60;
      p.y += p.vy * deltaTime * 60;
      p.vy += p.gravity * deltaTime * 60;
      p.life -= p.decay * deltaTime * 60;
      return p.life > 0;
    });

    switch (this.state) {
      case AnimState.WALK:
        this.time += deltaTime * this.walkSpeed;
        break;
      case AnimState.DEATH:
        if (!this.deathDone) {
          this.time += deltaTime * this.deathSpeed;
          if (this.time >= DEATH_FRAMES.length - 1) {
            this.time = DEATH_FRAMES.length - 1.001;
            this.deathDone = true;
          }
          // Shockwave burst when body slams ground (frame 8)
          const frameIdx = Math.floor(this.time);
          if (frameIdx === 8 && (this.time - frameIdx) < 0.1) {
            this._spawnShockwaveParticles(20);
          }
        }
        break;
    }
  }

  getCurrentFrame() {
    if (this.state === AnimState.WALK) {
      const totalFrames = WALK_FRAMES.length;
      const rawFrame = this.time % totalFrames;
      const frameIdx = Math.floor(rawFrame);
      const t = rawFrame - frameIdx;
      const nextIdx = (frameIdx + 1) % totalFrames;
      return lerpFrame(WALK_FRAMES[frameIdx], WALK_FRAMES[nextIdx], t);
    }
    if (this.state === AnimState.DEATH) {
      const totalFrames = DEATH_FRAMES.length;
      const rawFrame = Math.min(this.time, totalFrames - 1.001);
      const frameIdx = Math.floor(rawFrame);
      const t = rawFrame - frameIdx;
      const nextIdx = Math.min(frameIdx + 1, totalFrames - 1);
      return lerpFrame(DEATH_FRAMES[frameIdx], DEATH_FRAMES[nextIdx], t);
    }
    // Idle — neutral pose
    return {
      torso: { y: 0, rot: 0 }, head: { y: 0, rot: 0 }, helm: { y: 0, rot: 0 },
      lLeg: { rot: 0, y: 0 }, rLeg: { rot: 0, y: 0 },
      lArm: { rot: 0, y: 0 }, rArm: { rot: 0, y: 0 },
      lPauldron: { rot: 0, y: 0 }, rPauldron: { rot: 0, y: 0 },
      axeHandle: { rot: 0, y: 0 }, axeHead: { rot: 0, y: 0 }, axeHead2: { rot: 0, y: 0 },
      bellyPlate: { y: 0 },
      opacity: 1, flash: false,
    };
  }

  /**
   * Render the mini boss skeleton
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cx - center X (world)
   * @param {number} cy - bottom Y / feet (world)
   * @param {number} scale - maps 130 local units to enemy pixel height
   */
  render(ctx, cx, cy, scale = 0.42) {
    const frame = this.getCurrentFrame();
    const opacity = frame.opacity ?? 1;
    const isFlash = (frame.flash || this.flashTimer > 0);
    const pal = PALETTE;

    if (opacity <= 0.01) return;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.globalAlpha = opacity;

    const drawPart = (partDef, frameData, pivot, color) => {
      const rot = ((frameData?.rot || 0) * Math.PI) / 180;
      const offY = frameData?.y || 0;
      ctx.save();
      ctx.translate(pivot.x, pivot.y + offY);
      ctx.rotate(rot);
      ctx.fillStyle = isFlash ? '#ffffff' : color;
      ctx.fillRect(partDef.x - pivot.x, partDef.y - pivot.y, partDef.w, partDef.h);
      ctx.restore();
    };

    // ── Draw order: back limbs → body → details → front limbs → head → weapon ──

    // Back leg + arm
    drawPart(PARTS.lLeg, frame.lLeg, PIVOTS.lLeg, pal.armor);
    drawPart(PARTS.lArm, frame.lArm, PIVOTS.lArm, pal.armor);

    // Torso (main body)
    drawPart(PARTS.torso, frame.torso, PIVOTS.torso, pal.armor);
    drawPart(PARTS.bellyPlate, frame.bellyPlate, PIVOTS.bellyPlate, pal.cloth);

    // Armor edge detail on torso
    if (!isFlash) {
      const tRot = ((frame.torso?.rot || 0) * Math.PI) / 180;
      const tY = frame.torso?.y || 0;
      ctx.save();
      ctx.translate(PIVOTS.torso.x, PIVOTS.torso.y + tY);
      ctx.rotate(tRot);
      ctx.fillStyle = pal.armorEdge;
      ctx.fillRect(-22, -38, 44, 5);
      ctx.fillRect(-20, -30, 40, 4);
      ctx.fillRect(-18, -22, 36, 3);
      ctx.restore();
    }

    // Shoulder pauldrons
    drawPart(PARTS.lPauldron, frame.lPauldron, PIVOTS.lPauldron, pal.armor);
    drawPart(PARTS.rPauldron, frame.rPauldron, PIVOTS.rPauldron, pal.armor);

    // Front leg + arm
    drawPart(PARTS.rLeg, frame.rLeg, PIVOTS.rLeg, pal.armor);
    drawPart(PARTS.rArm, frame.rArm, PIVOTS.rArm, pal.armor);

    // Greataxe (drawn before head so it appears behind upper body)
    drawPart(PARTS.axeHandle, frame.axeHandle, PIVOTS.axeHandle, pal.axeWrap);
    // Axe heads (bi-directional)
    drawPart(PARTS.axeHead, frame.axeHead, PIVOTS.axeHead, pal.axe);
    drawPart(PARTS.axeHead2, frame.axeHead2, PIVOTS.axeHead2, pal.axe);
    // Silver edge highlights
    if (!isFlash) {
      const aRot = ((frame.axeHead?.rot || 0) * Math.PI) / 180;
      const aY = frame.axeHead?.y || 0;
      ctx.save();
      ctx.translate(PIVOTS.axeHead.x, PIVOTS.axeHead.y + aY);
      ctx.rotate(aRot);
      ctx.fillStyle = pal.axeEdge;
      ctx.fillRect(PARTS.axeHead.x - PIVOTS.axeHead.x, PARTS.axeHead.y - PIVOTS.axeHead.y, PARTS.axeHead.w, 3);
      ctx.restore();

      const a2Rot = ((frame.axeHead2?.rot || 0) * Math.PI) / 180;
      const a2Y = frame.axeHead2?.y || 0;
      ctx.save();
      ctx.translate(PIVOTS.axeHead2.x, PIVOTS.axeHead2.y + a2Y);
      ctx.rotate(a2Rot);
      ctx.fillStyle = pal.axeEdge;
      ctx.fillRect(PARTS.axeHead2.x - PIVOTS.axeHead2.x, PARTS.axeHead2.y - PIVOTS.axeHead2.y + PARTS.axeHead2.h - 3, PARTS.axeHead2.w, 3);
      ctx.restore();
    }

    // Head + helm
    drawPart(PARTS.head, frame.head, PIVOTS.head, pal.skin);
    drawPart(PARTS.helm, frame.helm, PIVOTS.helm, pal.helm);

    // Helm visor slit (glowing red) + plume
    if (!isFlash) {
      const hmRot = ((frame.helm?.rot || 0) * Math.PI) / 180;
      const hmY = frame.helm?.y || 0;
      ctx.save();
      ctx.translate(PIVOTS.helm.x, PIVOTS.helm.y + hmY);
      ctx.rotate(hmRot);
      // Red glowing visor slit
      ctx.fillStyle = pal.helmVisor;
      ctx.fillRect(-10, -2, 20, 4);
      // Red plume crest on top
      ctx.fillStyle = pal.crest;
      ctx.fillRect(-3, -18, 6, 12);
      ctx.restore();
    }

    ctx.restore();

    // ── Particles (world space, not scaled) ──
    ctx.save();
    for (const p of this.particles) {
      if (p.life <= 0) continue;
      ctx.globalAlpha = p.life * opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(cx + p.x, cy + p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  isDeathComplete() {
    return this.state === AnimState.DEATH && this.deathDone && this.particles.length === 0;
  }

  reset() {
    this.state = AnimState.WALK;
    this.time = 0;
    this.deathDone = false;
    this.flashTimer = 0;
    this.particles = [];
  }

  /** Initial hit burst — dark red blood/energy particles */
  _spawnImpactParticles(count) {
    const colors = ['#8B0000', '#cc2200', '#ff4400', '#ffaa00', '#ffffff'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 30,
        y: -50 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 5,
        vy: -Math.random() * 4 - 1,
        gravity: 0.06,
        life: 1,
        decay: 0.012 + Math.random() * 0.018,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  /** Ground slam shockwave — wide horizontal burst of debris */
  _spawnShockwaveParticles(count) {
    const colors = ['#444', '#666', '#888', '#cc2200', '#ff6600'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI; // mostly horizontal spread
      const speed = 3 + Math.random() * 5;
      this.particles.push({
        x: (Math.random() - 0.5) * 10,
        y: -5,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle)) * speed * 0.6,
        gravity: 0.1,
        life: 1,
        decay: 0.01 + Math.random() * 0.015,
        size: 2 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }
}

export default MiniBossAnimator;
