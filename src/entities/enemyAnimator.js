/**
 * EnemyAnimator - Skeletal animation system for samurai enemies
 * Handles walk cycle and death sequence with per-body-part transforms
 * 
 * Integration: Import and attach to Enemy instances via enemy.animator
 */

// ─── Body part layout (relative to center-bottom origin) ───
const PARTS = {
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

// Rotation pivot points for each part
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

// ─── Color palettes per enemy variant ───
const PALETTES = {
  basic: { armor: '#1a3a5c', cloth: '#1a1a1a', skin: '#d4a574', helmet: '#2c2c2c', blade: '#c0c0c0', handle: '#0a0a0a', armorDetail: '#2a4a6c', crest: '#8B0000' },
  fast:  { armor: '#5c1a1a', cloth: '#2a1a1a', skin: '#c49564', helmet: '#3c1c1c', blade: '#d0d0d0', handle: '#1a0a0a', armorDetail: '#6c2a2a', crest: '#cc0000' },
  tank:  { armor: '#3c1a5c', cloth: '#0a0a2a', skin: '#b48564', helmet: '#1c1c3c', blade: '#a0a0b0', handle: '#0a0a1a', armorDetail: '#4c2a6c', crest: '#660066' },
};

// ─── WALK CYCLE keyframes (8 frames, loops) ───
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

// ─── DEATH SEQUENCE keyframes (12 frames, plays once) ───
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

// ─── Interpolation helpers ───
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

// ─── Animation States ───
const AnimState = {
  WALK: 'walk',
  DEATH: 'death',
  IDLE: 'idle',
};

/**
 * EnemyAnimator class
 * Attach one per enemy instance to drive skeletal animation
 */
class EnemyAnimator {
  constructor(type = 'basic') {
    this.type = type;
    this.state = AnimState.WALK;
    this.time = 0;
    this.walkSpeed = 8;        // frames per second
    this.deathSpeed = 6;       // frames per second
    this.deathDone = false;
    this.palette = PALETTES[type] || PALETTES.basic;
    this.flashTimer = 0;
    this.particles = [];
  }

  /**
   * Set animation state
   * @param {'walk'|'death'|'idle'} state
   */
  setState(state) {
    if (state === AnimState.DEATH && this.state !== AnimState.DEATH) {
      this.time = 0;
      this.deathDone = false;
      // Spawn hit particles
      this._spawnParticles(8);
    }
    this.state = state;
  }

  /**
   * Trigger a flash effect (e.g. when taking damage while walking)
   */
  flash() {
    this.flashTimer = 0.1; // 100ms flash
  }

  /**
   * Update animation time
   * @param {number} deltaTime - seconds since last frame
   */
  update(deltaTime) {
    if (this.flashTimer > 0) {
      this.flashTimer -= deltaTime;
    }

    // Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx * deltaTime * 60;
      p.y += p.vy * deltaTime * 60;
      p.vy += 0.08 * deltaTime * 60;
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
          // Spawn particles on ground impact frame
          const frameIdx = Math.floor(this.time);
          if (frameIdx === 6 && (this.time - frameIdx) < 0.1) {
            this._spawnParticles(6);
          }
        }
        break;
      case AnimState.IDLE:
        // No animation advancement
        break;
    }
  }

  /**
   * Get the current interpolated frame data
   * @returns {Object} Interpolated keyframe with part transforms
   */
  getCurrentFrame() {
    let frames, totalFrames, rawFrame, loop;

    switch (this.state) {
      case AnimState.WALK:
        frames = WALK_FRAMES;
        totalFrames = frames.length;
        rawFrame = this.time % totalFrames;
        loop = true;
        break;
      case AnimState.DEATH:
        frames = DEATH_FRAMES;
        totalFrames = frames.length;
        rawFrame = Math.min(this.time, totalFrames - 1.001);
        loop = false;
        break;
      default:
        // Idle: return neutral pose
        return {
          torso: { y: 0, rot: 0 }, head: { y: 0, rot: 0 }, helmet: { y: 0, rot: 0 },
          lLeg: { rot: 0, y: 0 }, rLeg: { rot: 0, y: 0 },
          lArm: { rot: 0, y: 0 }, rArm: { rot: 0, y: 0 },
          blade: { rot: 0, y: 0 }, handle: { rot: 0, y: 0 },
          opacity: 1, flash: false,
        };
    }

    const frameIdx = Math.floor(rawFrame);
    const t = rawFrame - frameIdx;
    const nextIdx = loop ? (frameIdx + 1) % totalFrames : Math.min(frameIdx + 1, totalFrames - 1);

    return lerpFrame(frames[frameIdx], frames[nextIdx], t);
  }

  /**
   * Render the animated samurai onto a 2D canvas context
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} cx - Center X position (world coords)
   * @param {number} cy - Bottom Y position (feet on ground)
   * @param {number} scale - Render scale (default 0.5 for ~30px tall to match Config.enemy sizes)
   */
  render(ctx, cx, cy, scale = 0.5) {
    const frame = this.getCurrentFrame();
    const opacity = frame.opacity ?? 1;
    const isFlash = (frame.flash || this.flashTimer > 0);
    const pal = this.palette;

    if (opacity <= 0.01) return; // Fully faded, skip render

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
      ctx.fillStyle = isFlash ? '#fff' : color;
      ctx.fillRect(partDef.x - pivot.x, partDef.y - pivot.y, partDef.w, partDef.h);
      ctx.restore();
    };

    // Draw order: back limbs → torso → front limbs → head → weapon
    drawPart(PARTS.lLeg, frame.lLeg, PIVOTS.lLeg, pal.cloth);
    drawPart(PARTS.lArm, frame.lArm, PIVOTS.lArm, pal.cloth);
    drawPart(PARTS.torso, frame.torso, PIVOTS.torso, pal.armor);

    // Armor detail lines
    if (!isFlash) {
      const tRot = ((frame.torso?.rot || 0) * Math.PI) / 180;
      const tY = frame.torso?.y || 0;
      ctx.save();
      ctx.translate(PIVOTS.torso.x, PIVOTS.torso.y + tY);
      ctx.rotate(tRot);
      ctx.fillStyle = pal.armorDetail;
      ctx.fillRect(-15, -28, 30, 4);
      ctx.fillRect(-13, -22, 26, 3);
      ctx.restore();
    }

    drawPart(PARTS.rLeg, frame.rLeg, PIVOTS.rLeg, pal.cloth);
    drawPart(PARTS.rArm, frame.rArm, PIVOTS.rArm, pal.cloth);
    drawPart(PARTS.blade, frame.blade, PIVOTS.blade, pal.blade);
    drawPart(PARTS.handle, frame.handle, PIVOTS.handle, pal.handle);
    drawPart(PARTS.head, frame.head, PIVOTS.head, pal.skin);

    // Face details
    if (!isFlash) {
      const hRot = ((frame.head?.rot || 0) * Math.PI) / 180;
      const hY = frame.head?.y || 0;
      ctx.save();
      ctx.translate(PIVOTS.head.x, PIVOTS.head.y + hY);
      ctx.rotate(hRot);
      ctx.fillStyle = '#000';
      ctx.fillRect(-7, -8, 3, 2);  // Left eye
      ctx.fillRect(4, -8, 3, 2);   // Right eye
      ctx.fillRect(-3, -2, 6, 1);  // Mouth
      ctx.restore();
    }

    drawPart(PARTS.helmet, frame.helmet, PIVOTS.helmet, pal.helmet);

    // Helmet crest
    if (!isFlash) {
      const hmRot = ((frame.helmet?.rot || 0) * Math.PI) / 180;
      const hmY = frame.helmet?.y || 0;
      ctx.save();
      ctx.translate(PIVOTS.helmet.x, PIVOTS.helmet.y + hmY);
      ctx.rotate(hmRot);
      ctx.fillStyle = pal.crest;
      ctx.fillRect(-2, -13, 4, 8);
      ctx.restore();
    }

    ctx.restore();

    // Draw particles (in world space, not scaled)
    ctx.save();
    for (const p of this.particles) {
      if (p.life <= 0) continue;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(cx + p.x - p.size / 2, cy + p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /**
   * @returns {boolean} True if death animation has completed
   */
  isDeathComplete() {
    return this.state === AnimState.DEATH && this.deathDone && this.particles.length === 0;
  }

  /**
   * Reset animator for object pooling reuse
   * @param {string} type - Enemy type
   */
  reset(type = 'basic') {
    this.type = type;
    this.state = AnimState.WALK;
    this.time = 0;
    this.deathDone = false;
    this.flashTimer = 0;
    this.particles = [];
    this.palette = PALETTES[type] || PALETTES.basic;
  }

  /** @private */
  _spawnParticles(count) {
    const colors = ['#ff4444', '#ff8844', '#ffcc44', '#ffffff'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 20,
        y: -40 + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 1,
        life: 1,
        decay: 0.015 + Math.random() * 0.02,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }
}

export { EnemyAnimator, AnimState };
export default EnemyAnimator;
