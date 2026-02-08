import { useState, useEffect, useRef, useCallback } from "react";

// ─── Samurai body part definitions (derived from the OBJ model) ───
// Each part is defined relative to center-bottom of the character
const SAMURAI_PARTS = {
  torso:   { x: -17, y: -70, w: 34, h: 60, color: "#1a3a5c" },  // ArmorDark
  head:    { x: -12, y: -95, w: 24, h: 25, color: "#d4a574" },   // Skin
  helmet:  { x: -15, y: -107, w: 30, h: 15, color: "#2c2c2c" },  // Helmet
  lLeg:    { x: -14, y: -10, w: 12, h: 35, color: "#1a1a1a" },   // ClothBlack
  rLeg:    { x: 2,   y: -10, w: 12, h: 35, color: "#1a1a1a" },
  lArm:    { x: -28, y: -65, w: 10, h: 35, color: "#1a1a1a" },
  rArm:    { x: 18,  y: -65, w: 10, h: 35, color: "#1a1a1a" },
  blade:   { x: 20,  y: -70, w: 4,  h: 50, color: "#c0c0c0" },   // Metal
  handle:  { x: 19,  y: -25, w: 6,  h: 15, color: "#0a0a0a" },   // HandleBlack
};

// ─── Animation keyframe definitions ───

// WALK CYCLE: 8 frames, ~0.6s total
const WALK_FRAMES = [
  // Frame 0: Contact (left foot forward)
  { lLeg: { rot: 25, y: 0 }, rLeg: { rot: -25, y: 0 }, lArm: { rot: -15, y: 0 }, rArm: { rot: 15, y: 0 }, torso: { y: 0, rot: 0 }, head: { rot: 0, y: 0 }, helmet: { rot: 0, y: 0 }, blade: { rot: 5, y: 0 }, handle: { rot: 0, y: 0 } },
  // Frame 1: Down
  { lLeg: { rot: 15, y: 0 }, rLeg: { rot: -15, y: 0 }, lArm: { rot: -10, y: 0 }, rArm: { rot: 10, y: 0 }, torso: { y: 2, rot: -1 }, head: { rot: 0, y: 2 }, helmet: { rot: 0, y: 2 }, blade: { rot: 3, y: 2 }, handle: { rot: 0, y: 2 } },
  // Frame 2: Passing (legs together)
  { lLeg: { rot: 0, y: 0 }, rLeg: { rot: 0, y: 0 }, lArm: { rot: 0, y: 0 }, rArm: { rot: 0, y: 0 }, torso: { y: -1, rot: 0 }, head: { rot: 0, y: -1 }, helmet: { rot: 0, y: -1 }, blade: { rot: 0, y: -1 }, handle: { rot: 0, y: -1 } },
  // Frame 3: Up
  { lLeg: { rot: -15, y: 0 }, rLeg: { rot: 15, y: 0 }, lArm: { rot: 10, y: 0 }, rArm: { rot: -10, y: 0 }, torso: { y: -2, rot: 1 }, head: { rot: 0, y: -2 }, helmet: { rot: 0, y: -2 }, blade: { rot: -3, y: -2 }, handle: { rot: 0, y: -2 } },
  // Frame 4: Contact (right foot forward)
  { lLeg: { rot: -25, y: 0 }, rLeg: { rot: 25, y: 0 }, lArm: { rot: 15, y: 0 }, rArm: { rot: -15, y: 0 }, torso: { y: 0, rot: 0 }, head: { rot: 0, y: 0 }, helmet: { rot: 0, y: 0 }, blade: { rot: -5, y: 0 }, handle: { rot: 0, y: 0 } },
  // Frame 5: Down
  { lLeg: { rot: -15, y: 0 }, rLeg: { rot: 15, y: 0 }, lArm: { rot: 10, y: 0 }, rArm: { rot: -10, y: 0 }, torso: { y: 2, rot: 1 }, head: { rot: 0, y: 2 }, helmet: { rot: 0, y: 2 }, blade: { rot: -3, y: 2 }, handle: { rot: 0, y: 2 } },
  // Frame 6: Passing
  { lLeg: { rot: 0, y: 0 }, rLeg: { rot: 0, y: 0 }, lArm: { rot: 0, y: 0 }, rArm: { rot: 0, y: 0 }, torso: { y: -1, rot: 0 }, head: { rot: 0, y: -1 }, helmet: { rot: 0, y: -1 }, blade: { rot: 0, y: -1 }, handle: { rot: 0, y: -1 } },
  // Frame 7: Up
  { lLeg: { rot: 15, y: 0 }, rLeg: { rot: -15, y: 0 }, lArm: { rot: -10, y: 0 }, rArm: { rot: 10, y: 0 }, torso: { y: -2, rot: -1 }, head: { rot: 0, y: -2 }, helmet: { rot: 0, y: -2 }, blade: { rot: 3, y: -2 }, handle: { rot: 0, y: -2 } },
];

// DEATH CYCLE: 12 frames, plays once
const DEATH_FRAMES = [
  // Frame 0: Hit reaction (recoil)
  { torso: { y: 0, rot: -5 }, head: { rot: 10, y: -2 }, helmet: { rot: 12, y: -3 }, lLeg: { rot: 5, y: 0 }, rLeg: { rot: -5, y: 0 }, lArm: { rot: -30, y: 0 }, rArm: { rot: 30, y: 0 }, blade: { rot: 25, y: 0 }, handle: { rot: 10, y: 0 }, opacity: 1, flash: true, scale: 1 },
  // Frame 1: Stagger back
  { torso: { y: 0, rot: -10 }, head: { rot: 15, y: -3 }, helmet: { rot: 18, y: -5 }, lLeg: { rot: 10, y: 0 }, rLeg: { rot: -10, y: 0 }, lArm: { rot: -45, y: 5 }, rArm: { rot: 50, y: 5 }, blade: { rot: 40, y: 5 }, handle: { rot: 15, y: 5 }, opacity: 1, flash: false, scale: 1 },
  // Frame 2: Dropping sword
  { torso: { y: 2, rot: -18 }, head: { rot: 20, y: -2 }, helmet: { rot: 25, y: -4 }, lLeg: { rot: 15, y: 0 }, rLeg: { rot: -8, y: 0 }, lArm: { rot: -55, y: 10 }, rArm: { rot: 70, y: 15 }, blade: { rot: 60, y: 20 }, handle: { rot: 30, y: 18 }, opacity: 1, flash: false, scale: 1 },
  // Frame 3: Knees buckling
  { torso: { y: 8, rot: -25 }, head: { rot: 25, y: 3 }, helmet: { rot: 30, y: 1 }, lLeg: { rot: 25, y: 5 }, rLeg: { rot: -20, y: 5 }, lArm: { rot: -60, y: 15 }, rArm: { rot: 80, y: 25 }, blade: { rot: 80, y: 35 }, handle: { rot: 45, y: 30 }, opacity: 1, flash: false, scale: 1 },
  // Frame 4: Falling
  { torso: { y: 18, rot: -40 }, head: { rot: 30, y: 10 }, helmet: { rot: 35, y: 8 }, lLeg: { rot: 35, y: 10 }, rLeg: { rot: -30, y: 10 }, lArm: { rot: -70, y: 22 }, rArm: { rot: 85, y: 30 }, blade: { rot: 90, y: 45 }, handle: { rot: 50, y: 40 }, opacity: 0.95, flash: false, scale: 1 },
  // Frame 5: Almost down
  { torso: { y: 30, rot: -60 }, head: { rot: 35, y: 22 }, helmet: { rot: 40, y: 18 }, lLeg: { rot: 45, y: 18 }, rLeg: { rot: -40, y: 18 }, lArm: { rot: -75, y: 28 }, rArm: { rot: 85, y: 32 }, blade: { rot: 90, y: 50 }, handle: { rot: 55, y: 45 }, opacity: 0.9, flash: false, scale: 1 },
  // Frame 6: Hitting ground
  { torso: { y: 42, rot: -75 }, head: { rot: 38, y: 34 }, helmet: { rot: 42, y: 30 }, lLeg: { rot: 55, y: 25 }, rLeg: { rot: -45, y: 25 }, lArm: { rot: -80, y: 32 }, rArm: { rot: 85, y: 34 }, blade: { rot: 90, y: 52 }, handle: { rot: 58, y: 48 }, opacity: 0.85, flash: true, scale: 1 },
  // Frame 7: Bounce
  { torso: { y: 46, rot: -82 }, head: { rot: 40, y: 38 }, helmet: { rot: 44, y: 34 }, lLeg: { rot: 60, y: 28 }, rLeg: { rot: -50, y: 28 }, lArm: { rot: -82, y: 34 }, rArm: { rot: 85, y: 35 }, blade: { rot: 90, y: 53 }, handle: { rot: 60, y: 50 }, opacity: 0.75, flash: false, scale: 0.98 },
  // Frame 8: Settle
  { torso: { y: 48, rot: -85 }, head: { rot: 42, y: 40 }, helmet: { rot: 45, y: 36 }, lLeg: { rot: 62, y: 30 }, rLeg: { rot: -52, y: 30 }, lArm: { rot: -84, y: 35 }, rArm: { rot: 85, y: 36 }, blade: { rot: 90, y: 54 }, handle: { rot: 62, y: 51 }, opacity: 0.6, flash: false, scale: 0.96 },
  // Frame 9: Fading 1
  { torso: { y: 49, rot: -87 }, head: { rot: 43, y: 41 }, helmet: { rot: 45, y: 37 }, lLeg: { rot: 63, y: 31 }, rLeg: { rot: -53, y: 31 }, lArm: { rot: -85, y: 35 }, rArm: { rot: 85, y: 36 }, blade: { rot: 90, y: 55 }, handle: { rot: 63, y: 52 }, opacity: 0.4, flash: false, scale: 0.94 },
  // Frame 10: Fading 2
  { torso: { y: 50, rot: -88 }, head: { rot: 43, y: 42 }, helmet: { rot: 46, y: 38 }, lLeg: { rot: 64, y: 32 }, rLeg: { rot: -54, y: 32 }, lArm: { rot: -85, y: 35 }, rArm: { rot: 85, y: 36 }, blade: { rot: 90, y: 55 }, handle: { rot: 63, y: 52 }, opacity: 0.2, flash: false, scale: 0.92 },
  // Frame 11: Gone
  { torso: { y: 50, rot: -90 }, head: { rot: 44, y: 42 }, helmet: { rot: 46, y: 38 }, lLeg: { rot: 65, y: 33 }, rLeg: { rot: -55, y: 33 }, lArm: { rot: -85, y: 35 }, rArm: { rot: 85, y: 36 }, blade: { rot: 90, y: 55 }, handle: { rot: 63, y: 52 }, opacity: 0, flash: false, scale: 0.9 },
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpFrame(frameA, frameB, t) {
  const result = {};
  for (const key of Object.keys(frameA)) {
    if (typeof frameA[key] === "object" && frameA[key] !== null) {
      result[key] = {};
      for (const prop of Object.keys(frameA[key])) {
        result[key][prop] = lerp(frameA[key][prop] || 0, frameB[key]?.[prop] || 0, t);
      }
    } else if (typeof frameA[key] === "number") {
      result[key] = lerp(frameA[key], frameB[key] ?? frameA[key], t);
    } else {
      result[key] = t < 0.5 ? frameA[key] : frameB[key];
    }
  }
  return result;
}

// ─── Canvas-based samurai renderer ───
function drawSamurai(ctx, cx, cy, frame, scale = 2.2, variant = "basic") {
  const opacity = frame.opacity ?? 1;
  const frameScale = frame.scale ?? 1;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale * frameScale, scale * frameScale);
  ctx.globalAlpha = opacity;

  const variantColors = {
    basic: { armor: "#1a3a5c", cloth: "#1a1a1a", skin: "#d4a574", helmet: "#2c2c2c", blade: "#c0c0c0", handle: "#0a0a0a" },
    fast:  { armor: "#5c1a1a", cloth: "#2a1a1a", skin: "#c49564", helmet: "#3c1c1c", blade: "#d0d0d0", handle: "#1a0a0a" },
    tank:  { armor: "#3c1a5c", cloth: "#0a0a2a", skin: "#b48564", helmet: "#1c1c3c", blade: "#a0a0b0", handle: "#0a0a1a" },
  };
  const colors = variantColors[variant] || variantColors.basic;

  // Flash effect (white overlay on hit)
  const isFlash = frame.flash;

  const drawPart = (part, frameData, pivotX, pivotY, fillColor) => {
    const rot = (frameData?.rot || 0) * Math.PI / 180;
    const offY = frameData?.y || 0;
    ctx.save();
    ctx.translate(pivotX, pivotY + offY);
    ctx.rotate(rot);
    ctx.fillStyle = isFlash ? "#fff" : fillColor;
    ctx.fillRect(part.x - pivotX, part.y - pivotY, part.w, part.h);
    ctx.restore();
  };

  // Draw order: back arm, back leg, torso, front leg, front arm, head, helmet, sword
  // Back leg (left)
  drawPart(SAMURAI_PARTS.lLeg, frame.lLeg, -8, -10, colors.cloth);
  // Back arm (left)
  drawPart(SAMURAI_PARTS.lArm, frame.lArm, -28, -55, colors.cloth);
  // Torso
  drawPart(SAMURAI_PARTS.torso, frame.torso, 0, -40, colors.armor);
  // Armor detail (chest plate edge)
  if (!isFlash) {
    const tRot = (frame.torso?.rot || 0) * Math.PI / 180;
    const tY = frame.torso?.y || 0;
    ctx.save();
    ctx.translate(0, -40 + tY);
    ctx.rotate(tRot);
    ctx.fillStyle = "#2a4a6c";
    ctx.fillRect(-15, -28, 30, 4);
    ctx.fillRect(-13, -22, 26, 3);
    ctx.restore();
  }
  // Front leg (right)
  drawPart(SAMURAI_PARTS.rLeg, frame.rLeg, 8, -10, colors.cloth);
  // Front arm (right)
  drawPart(SAMURAI_PARTS.rArm, frame.rArm, 23, -55, colors.cloth);
  // Blade
  drawPart(SAMURAI_PARTS.blade, frame.blade, 22, -45, colors.blade);
  // Handle
  drawPart(SAMURAI_PARTS.handle, frame.handle, 22, -18, colors.handle);
  // Head
  drawPart(SAMURAI_PARTS.head, frame.head, 0, -82, colors.skin);
  // Face details
  if (!isFlash) {
    const hRot = (frame.head?.rot || 0) * Math.PI / 180;
    const hY = frame.head?.y || 0;
    ctx.save();
    ctx.translate(0, -82 + hY);
    ctx.rotate(hRot);
    // Eyes
    ctx.fillStyle = "#000";
    ctx.fillRect(-7, -90 + 82, 3, 2);
    ctx.fillRect(4, -90 + 82, 3, 2);
    // Mouth
    ctx.fillRect(-3, -84 + 82, 6, 1);
    ctx.restore();
  }
  // Helmet
  drawPart(SAMURAI_PARTS.helmet, frame.helmet, 0, -100, colors.helmet);
  // Helmet crest
  if (!isFlash) {
    const hmRot = (frame.helmet?.rot || 0) * Math.PI / 180;
    const hmY = frame.helmet?.y || 0;
    ctx.save();
    ctx.translate(0, -100 + hmY);
    ctx.rotate(hmRot);
    ctx.fillStyle = "#8B0000";
    ctx.fillRect(-2, -107 + 100 - 6, 4, 8);
    ctx.restore();
  }

  ctx.restore();
}

// ─── Particle system for death effects ───
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = -Math.random() * 3 - 1;
    this.life = 1;
    this.decay = 0.015 + Math.random() * 0.02;
    this.size = 2 + Math.random() * 3;
    this.color = color;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.08;
    this.life -= this.decay;
  }
  draw(ctx) {
    if (this.life <= 0) return;
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

// ─── Main Component ───
export default function SamuraiAnimationPreview() {
  const walkCanvasRef = useRef(null);
  const deathCanvasRef = useRef(null);
  const [walkSpeed, setWalkSpeed] = useState(8);
  const [deathSpeed, setDeathSpeed] = useState(6);
  const [variant, setVariant] = useState("basic");
  const [walkPlaying, setWalkPlaying] = useState(true);
  const [deathPlaying, setDeathPlaying] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [currentWalkFrame, setCurrentWalkFrame] = useState(0);
  const [currentDeathFrame, setCurrentDeathFrame] = useState(0);
  const walkAnimRef = useRef({ time: 0 });
  const deathAnimRef = useRef({ time: 0, particles: [], done: false });

  // Walk animation loop
  useEffect(() => {
    const canvas = walkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (walkPlaying) {
        walkAnimRef.current.time += dt * walkSpeed;
      }

      const totalFrames = WALK_FRAMES.length;
      const rawFrame = walkAnimRef.current.time % totalFrames;
      const frameIdx = Math.floor(rawFrame);
      const t = rawFrame - frameIdx;
      const nextIdx = (frameIdx + 1) % totalFrames;
      const interpolated = lerpFrame(WALK_FRAMES[frameIdx], WALK_FRAMES[nextIdx], t);

      setCurrentWalkFrame(frameIdx);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = "#0f1923";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      if (showGrid) {
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        for (let gx = 0; gx < canvas.width; gx += 20) {
          ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, canvas.height); ctx.stroke();
        }
        for (let gy = 0; gy < canvas.height; gy += 20) {
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(canvas.width, gy); ctx.stroke();
        }
      }

      // Ground line
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 40);
      ctx.lineTo(canvas.width, canvas.height - 40);
      ctx.stroke();

      // Ground shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height - 38, 30, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Moving background dots for walk sense
      if (walkPlaying) {
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        for (let i = 0; i < 8; i++) {
          const bx = ((i * 80 - (walkAnimRef.current.time * 30) % 640) + 640) % 640;
          ctx.beginPath();
          ctx.arc(bx, canvas.height - 38, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      drawSamurai(ctx, canvas.width / 2, canvas.height - 40, interpolated, 2.2, variant);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [walkPlaying, walkSpeed, variant, showGrid]);

  // Death animation loop
  useEffect(() => {
    const canvas = deathCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (deathPlaying && !deathAnimRef.current.done) {
        deathAnimRef.current.time += dt * deathSpeed;
      }

      const totalFrames = DEATH_FRAMES.length;
      const rawFrame = Math.min(deathAnimRef.current.time, totalFrames - 1.001);
      const frameIdx = Math.floor(rawFrame);
      const t = rawFrame - frameIdx;
      const nextIdx = Math.min(frameIdx + 1, totalFrames - 1);
      const interpolated = lerpFrame(DEATH_FRAMES[frameIdx], DEATH_FRAMES[nextIdx], t);

      setCurrentDeathFrame(frameIdx);

      if (frameIdx >= totalFrames - 1) {
        deathAnimRef.current.done = true;
      }

      // Spawn particles on hit frames
      if (deathPlaying && (frameIdx === 0 || frameIdx === 6) && t < 0.1) {
        const colors = ["#ff4444", "#ff8844", "#ffcc44", "#ffffff"];
        for (let i = 0; i < 8; i++) {
          deathAnimRef.current.particles.push(
            new Particle(
              canvas.width / 2 + (Math.random() - 0.5) * 40,
              canvas.height - 80 + (Math.random() - 0.5) * 40,
              colors[Math.floor(Math.random() * colors.length)]
            )
          );
        }
      }

      // Update particles
      deathAnimRef.current.particles = deathAnimRef.current.particles.filter(p => {
        p.update();
        return p.life > 0;
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = "#0f1923";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (showGrid) {
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        for (let gx = 0; gx < canvas.width; gx += 20) {
          ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, canvas.height); ctx.stroke();
        }
        for (let gy = 0; gy < canvas.height; gy += 20) {
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(canvas.width, gy); ctx.stroke();
        }
      }

      // Ground
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 40);
      ctx.lineTo(canvas.width, canvas.height - 40);
      ctx.stroke();

      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height - 38, 30, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      drawSamurai(ctx, canvas.width / 2, canvas.height - 40, interpolated, 2.2, variant);

      // Draw particles
      for (const p of deathAnimRef.current.particles) {
        p.draw(ctx);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [deathPlaying, deathSpeed, variant, showGrid]);

  const resetDeath = useCallback(() => {
    deathAnimRef.current.time = 0;
    deathAnimRef.current.particles = [];
    deathAnimRef.current.done = false;
    setDeathPlaying(true);
  }, []);

  const toggleWalk = useCallback(() => setWalkPlaying(p => !p), []);

  return (
    <div style={{ background: "#0a0e14", minHeight: "100vh", color: "#c8d0d8", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", padding: "24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#e8b059", letterSpacing: "0.05em" }}>
            ⚔ SAMURAI ANIMATION SYSTEM
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#5a6a7a", letterSpacing: "0.08em" }}>
            TDG — WALK CYCLE &amp; DEATH SEQUENCE PREVIEW
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {["basic", "fast", "tank"].map(v => (
            <button key={v} onClick={() => setVariant(v)}
              style={{
                padding: "6px 16px", border: "1px solid",
                borderColor: variant === v ? "#e8b059" : "rgba(255,255,255,0.1)",
                background: variant === v ? "rgba(232,176,89,0.12)" : "transparent",
                color: variant === v ? "#e8b059" : "#5a6a7a",
                borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: "inherit",
                textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600,
              }}>
              {v}
            </button>
          ))}
          <button onClick={() => setShowGrid(g => !g)}
            style={{
              padding: "6px 16px", border: "1px solid rgba(255,255,255,0.1)",
              background: showGrid ? "rgba(255,255,255,0.05)" : "transparent",
              color: "#5a6a7a", borderRadius: 4, cursor: "pointer",
              fontSize: 11, fontFamily: "inherit", letterSpacing: "0.1em",
            }}>
            GRID {showGrid ? "ON" : "OFF"}
          </button>
        </div>

        {/* Walk Cycle */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontSize: 13, color: "#4a9eff", letterSpacing: "0.1em", fontWeight: 600 }}>
              🚶 WALK CYCLE
            </h2>
            <span style={{ fontSize: 11, color: "#3a4a5a" }}>
              FRAME {currentWalkFrame}/{WALK_FRAMES.length - 1}
            </span>
          </div>
          <canvas ref={walkCanvasRef} width={320} height={280}
            style={{ width: "100%", maxWidth: 640, height: "auto", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <button onClick={toggleWalk}
              style={{
                padding: "6px 20px", background: walkPlaying ? "#2a1a1a" : "#1a2a1a",
                border: `1px solid ${walkPlaying ? "#aa4444" : "#44aa44"}`,
                color: walkPlaying ? "#ff6666" : "#66ff66",
                borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: "inherit",
                letterSpacing: "0.08em", fontWeight: 600,
              }}>
              {walkPlaying ? "⏸ PAUSE" : "▶ PLAY"}
            </button>
            <span style={{ fontSize: 11, color: "#3a4a5a", minWidth: 50 }}>SPEED</span>
            <input type="range" min={2} max={16} step={0.5} value={walkSpeed}
              onChange={e => setWalkSpeed(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#4a9eff" }}
            />
            <span style={{ fontSize: 11, color: "#5a6a7a", minWidth: 30 }}>{walkSpeed}x</span>
          </div>
        </div>

        {/* Death Cycle */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontSize: 13, color: "#ff4a4a", letterSpacing: "0.1em", fontWeight: 600 }}>
              💀 DEATH SEQUENCE
            </h2>
            <span style={{ fontSize: 11, color: "#3a4a5a" }}>
              FRAME {currentDeathFrame}/{DEATH_FRAMES.length - 1}
            </span>
          </div>
          <canvas ref={deathCanvasRef} width={320} height={280}
            style={{ width: "100%", maxWidth: 640, height: "auto", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <button onClick={resetDeath}
              style={{
                padding: "6px 20px", background: "#1a1a2a",
                border: "1px solid #6644aa", color: "#aa88ff",
                borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: "inherit",
                letterSpacing: "0.08em", fontWeight: 600,
              }}>
              ▶ PLAY DEATH
            </button>
            <span style={{ fontSize: 11, color: "#3a4a5a", minWidth: 50 }}>SPEED</span>
            <input type="range" min={2} max={12} step={0.5} value={deathSpeed}
              onChange={e => setDeathSpeed(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#ff4a4a" }}
            />
            <span style={{ fontSize: 11, color: "#5a6a7a", minWidth: 30 }}>{deathSpeed}x</span>
          </div>
        </div>

        {/* Frame data / Integration info */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: 16 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 12, color: "#e8b059", letterSpacing: "0.1em" }}>
            📋 INTEGRATION NOTES
          </h3>
          <div style={{ fontSize: 11, lineHeight: 1.7, color: "#5a7a8a" }}>
            <p style={{ margin: "0 0 8px" }}>
              <strong style={{ color: "#7a9aaa" }}>Walk Cycle:</strong> 8 keyframes, looping. Leg/arm swing with torso bob. Frame interpolation for smooth motion.
            </p>
            <p style={{ margin: "0 0 8px" }}>
              <strong style={{ color: "#7a9aaa" }}>Death Sequence:</strong> 12 keyframes, plays once. Hit recoil → stagger → fall → ground impact → fade out. Includes white flash on hit frames and particle burst.
            </p>
            <p style={{ margin: "0 0 8px" }}>
              <strong style={{ color: "#7a9aaa" }}>Body Parts:</strong> torso, head, helmet, lLeg, rLeg, lArm, rArm, blade, handle — each with independent rotation + Y offset pivots.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#7a9aaa" }}>Variants:</strong> basic (blue armor), fast (red armor), tank (purple armor). Colors swap via config.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
