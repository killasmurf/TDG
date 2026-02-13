import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// DEMON DOG — "Fast" Enemy Type
// Quadruped skeletal animation system matching samurai complexity
// Parts defined relative to center-bottom of the character
// ═══════════════════════════════════════════════════════════════════════════

const DEMON_DOG_PARTS = {
  body:      { x: -22, y: -45, w: 44, h: 24, color: "#3a1a1a" },   // DarkFlesh
  chest:     { x: -18, y: -50, w: 20, h: 18, color: "#4a1a1a" },   // ChestPlate
  belly:     { x: -5,  y: -38, w: 22, h: 12, color: "#2a0e0e" },   // Underbelly
  head:      { x: -30, y: -60, w: 22, h: 18, color: "#3a1a1a" },   // Head
  snout:     { x: -42, y: -56, w: 14, h: 10, color: "#2a1010" },   // Snout
  jaw:       { x: -40, y: -48, w: 12, h: 6,  color: "#1a0808" },   // Lower jaw
  earL:      { x: -28, y: -68, w: 5,  h: 10, color: "#2a0e0e" },   // Left ear
  earR:      { x: -18, y: -68, w: 5,  h: 10, color: "#2a0e0e" },   // Right ear
  hornL:     { x: -30, y: -74, w: 4,  h: 12, color: "#1a1a1a" },   // Left horn
  hornR:     { x: -16, y: -74, w: 4,  h: 12, color: "#1a1a1a" },   // Right horn
  fLegL:     { x: -20, y: -22, w: 8,  h: 22, color: "#2a1010" },   // Front left leg
  fLegR:     { x: -14, y: -22, w: 8,  h: 22, color: "#2a1010" },   // Front right leg
  hLegL:     { x: 10,  y: -22, w: 8,  h: 22, color: "#2a1010" },   // Hind left leg
  hLegR:     { x: 16,  y: -22, w: 8,  h: 22, color: "#2a1010" },   // Hind right leg
  tail:      { x: 20,  y: -52, w: 18, h: 5,  color: "#2a0e0e" },   // Tail
  tailTip:   { x: 36,  y: -54, w: 8,  h: 4,  color: "#5a1a1a" },   // Tail flame tip
  spines:    { x: -10, y: -52, w: 24, h: 6,  color: "#1a1a1a" },   // Back spines
};

// ═══════════════════════════════════════════════════════════════════════════
// GALLOP WALK CYCLE — 8 frames, fast quadruped locomotion
// Asymmetric gait: front legs lead, hind legs follow (rotary gallop)
// ═══════════════════════════════════════════════════════════════════════════

const WALK_FRAMES = [
  // Frame 0: Gathered — all legs under body, body compressed
  {
    body: { y: 2, rot: 3 }, chest: { y: 2, rot: 3 }, belly: { y: 2, rot: 2 },
    head: { y: 1, rot: -5 }, snout: { y: 1, rot: -5 }, jaw: { y: 2, rot: -3 },
    earL: { rot: -10, y: 0 }, earR: { rot: -10, y: 0 },
    hornL: { rot: -8, y: 0 }, hornR: { rot: -8, y: 0 },
    fLegL: { rot: -30, y: 0 }, fLegR: { rot: -20, y: 0 },
    hLegL: { rot: 30, y: 0 },  hLegR: { rot: 20, y: 0 },
    tail: { rot: -15, y: 0 }, tailTip: { rot: -20, y: 0 },
    spines: { y: 2, rot: 3 },
  },
  // Frame 1: Front reach — front legs extending forward
  {
    body: { y: 0, rot: 1 }, chest: { y: -1, rot: -2 }, belly: { y: 0, rot: 1 },
    head: { y: -2, rot: -8 }, snout: { y: -2, rot: -8 }, jaw: { y: -1, rot: -6 },
    earL: { rot: -15, y: -1 }, earR: { rot: -15, y: -1 },
    hornL: { rot: -12, y: -1 }, hornR: { rot: -12, y: -1 },
    fLegL: { rot: 25, y: 0 }, fLegR: { rot: 15, y: 0 },
    hLegL: { rot: 15, y: 0 }, hLegR: { rot: 5, y: 0 },
    tail: { rot: 5, y: 0 }, tailTip: { rot: 10, y: 0 },
    spines: { y: 0, rot: 1 },
  },
  // Frame 2: Front strike — front paws hitting ground
  {
    body: { y: -2, rot: -2 }, chest: { y: -3, rot: -4 }, belly: { y: -1, rot: -2 },
    head: { y: -3, rot: -3 }, snout: { y: -3, rot: -3 }, jaw: { y: -2, rot: -2 },
    earL: { rot: 5, y: -2 }, earR: { rot: 5, y: -2 },
    hornL: { rot: 3, y: -2 }, hornR: { rot: 3, y: -2 },
    fLegL: { rot: 5, y: 0 }, fLegR: { rot: -5, y: 0 },
    hLegL: { rot: -10, y: 0 }, hLegR: { rot: -20, y: 0 },
    tail: { rot: 15, y: -1 }, tailTip: { rot: 25, y: -2 },
    spines: { y: -2, rot: -2 },
  },
  // Frame 3: Extended — body fully stretched
  {
    body: { y: -3, rot: -4 }, chest: { y: -4, rot: -5 }, belly: { y: -2, rot: -3 },
    head: { y: -4, rot: 0 }, snout: { y: -4, rot: 0 }, jaw: { y: -3, rot: 2 },
    earL: { rot: 10, y: -3 }, earR: { rot: 10, y: -3 },
    hornL: { rot: 8, y: -3 }, hornR: { rot: 8, y: -3 },
    fLegL: { rot: -20, y: 0 }, fLegR: { rot: -30, y: 0 },
    hLegL: { rot: -30, y: 0 }, hLegR: { rot: -20, y: 0 },
    tail: { rot: 25, y: -2 }, tailTip: { rot: 35, y: -3 },
    spines: { y: -3, rot: -4 },
  },
  // Frame 4: Hind push — hind legs driving
  {
    body: { y: -1, rot: -2 }, chest: { y: -2, rot: -3 }, belly: { y: -1, rot: -1 },
    head: { y: -2, rot: 2 }, snout: { y: -2, rot: 2 }, jaw: { y: -1, rot: 3 },
    earL: { rot: 5, y: -1 }, earR: { rot: 5, y: -1 },
    hornL: { rot: 3, y: -1 }, hornR: { rot: 3, y: -1 },
    fLegL: { rot: -15, y: 0 }, fLegR: { rot: -10, y: 0 },
    hLegL: { rot: 25, y: 0 }, hLegR: { rot: 35, y: 0 },
    tail: { rot: 10, y: -1 }, tailTip: { rot: 15, y: -1 },
    spines: { y: -1, rot: -2 },
  },
  // Frame 5: Airborne — all legs off ground
  {
    body: { y: -4, rot: 0 }, chest: { y: -5, rot: -1 }, belly: { y: -3, rot: 0 },
    head: { y: -5, rot: -4 }, snout: { y: -5, rot: -4 }, jaw: { y: -4, rot: -2 },
    earL: { rot: -20, y: -4 }, earR: { rot: -20, y: -4 },
    hornL: { rot: -15, y: -4 }, hornR: { rot: -15, y: -4 },
    fLegL: { rot: -10, y: -3 }, fLegR: { rot: -15, y: -3 },
    hLegL: { rot: 10, y: -3 }, hLegR: { rot: 15, y: -3 },
    tail: { rot: -10, y: -3 }, tailTip: { rot: -15, y: -4 },
    spines: { y: -4, rot: 0 },
  },
  // Frame 6: Descending — preparing to land
  {
    body: { y: -1, rot: 2 }, chest: { y: -1, rot: 1 }, belly: { y: 0, rot: 1 },
    head: { y: -1, rot: -6 }, snout: { y: -1, rot: -6 }, jaw: { y: 0, rot: -4 },
    earL: { rot: -12, y: 0 }, earR: { rot: -12, y: 0 },
    hornL: { rot: -10, y: 0 }, hornR: { rot: -10, y: 0 },
    fLegL: { rot: -25, y: 0 }, fLegR: { rot: -15, y: 0 },
    hLegL: { rot: 20, y: 0 }, hLegR: { rot: 10, y: 0 },
    tail: { rot: -5, y: 0 }, tailTip: { rot: -8, y: 0 },
    spines: { y: -1, rot: 2 },
  },
  // Frame 7: Landing — front paws absorbing impact
  {
    body: { y: 3, rot: 4 }, chest: { y: 3, rot: 4 }, belly: { y: 2, rot: 3 },
    head: { y: 2, rot: -2 }, snout: { y: 2, rot: -2 }, jaw: { y: 3, rot: 0 },
    earL: { rot: -5, y: 1 }, earR: { rot: -5, y: 1 },
    hornL: { rot: -3, y: 1 }, hornR: { rot: -3, y: 1 },
    fLegL: { rot: 10, y: 2 }, fLegR: { rot: 5, y: 2 },
    hLegL: { rot: -5, y: 0 }, hLegR: { rot: -15, y: 0 },
    tail: { rot: -20, y: 1 }, tailTip: { rot: -25, y: 2 },
    spines: { y: 3, rot: 4 },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DEATH SEQUENCE — 12 frames, plays once
// Yelp → stumble → roll → dissolve into hellfire
// ═══════════════════════════════════════════════════════════════════════════

const DEATH_FRAMES = [
  // Frame 0: Hit impact — yelp, head snaps back
  {
    body: { y: 0, rot: 8 }, chest: { y: 0, rot: 10 }, belly: { y: 0, rot: 5 },
    head: { y: -3, rot: 20 }, snout: { y: -3, rot: 25 }, jaw: { y: -1, rot: 35 },
    earL: { rot: -25, y: -2 }, earR: { rot: -25, y: -2 },
    hornL: { rot: -20, y: -2 }, hornR: { rot: -20, y: -2 },
    fLegL: { rot: 15, y: 0 }, fLegR: { rot: 20, y: 0 },
    hLegL: { rot: -10, y: 0 }, hLegR: { rot: -15, y: 0 },
    tail: { rot: 30, y: 0 }, tailTip: { rot: 40, y: 0 },
    spines: { y: 0, rot: 8 },
    opacity: 1, flash: true, scale: 1,
  },
  // Frame 1: Stagger — legs splay
  {
    body: { y: 2, rot: 12 }, chest: { y: 2, rot: 15 }, belly: { y: 2, rot: 8 },
    head: { y: 0, rot: 15 }, snout: { y: 0, rot: 18 }, jaw: { y: 2, rot: 28 },
    earL: { rot: -30, y: 0 }, earR: { rot: -30, y: 0 },
    hornL: { rot: -25, y: 0 }, hornR: { rot: -25, y: 0 },
    fLegL: { rot: 30, y: 2 }, fLegR: { rot: -20, y: 0 },
    hLegL: { rot: -25, y: 2 }, hLegR: { rot: 20, y: 0 },
    tail: { rot: 40, y: 2 }, tailTip: { rot: 55, y: 3 },
    spines: { y: 2, rot: 12 },
    opacity: 1, flash: false, scale: 1,
  },
  // Frame 2: Front collapse — front legs buckle
  {
    body: { y: 8, rot: 18 }, chest: { y: 10, rot: 22 }, belly: { y: 6, rot: 14 },
    head: { y: 8, rot: 10 }, snout: { y: 10, rot: 12 }, jaw: { y: 12, rot: 20 },
    earL: { rot: -20, y: 6 }, earR: { rot: -20, y: 6 },
    hornL: { rot: -15, y: 6 }, hornR: { rot: -15, y: 6 },
    fLegL: { rot: 45, y: 6 }, fLegR: { rot: 40, y: 5 },
    hLegL: { rot: -15, y: 3 }, hLegR: { rot: -10, y: 3 },
    tail: { rot: 50, y: 5 }, tailTip: { rot: 65, y: 7 },
    spines: { y: 8, rot: 18 },
    opacity: 1, flash: false, scale: 1,
  },
  // Frame 3: Chin hits ground
  {
    body: { y: 16, rot: 25 }, chest: { y: 20, rot: 30 }, belly: { y: 12, rot: 20 },
    head: { y: 18, rot: 5 }, snout: { y: 22, rot: 0 }, jaw: { y: 24, rot: 10 },
    earL: { rot: -10, y: 14 }, earR: { rot: -10, y: 14 },
    hornL: { rot: -5, y: 14 }, hornR: { rot: -5, y: 14 },
    fLegL: { rot: 55, y: 12 }, fLegR: { rot: 50, y: 10 },
    hLegL: { rot: 10, y: 8 }, hLegR: { rot: 5, y: 8 },
    tail: { rot: 55, y: 10 }, tailTip: { rot: 70, y: 12 },
    spines: { y: 16, rot: 25 },
    opacity: 1, flash: true, scale: 1,
  },
  // Frame 4: Rolling — momentum carries body forward
  {
    body: { y: 24, rot: 40 }, chest: { y: 28, rot: 45 }, belly: { y: 20, rot: 32 },
    head: { y: 26, rot: -10 }, snout: { y: 30, rot: -15 }, jaw: { y: 30, rot: -5 },
    earL: { rot: 5, y: 22 }, earR: { rot: 5, y: 22 },
    hornL: { rot: 10, y: 22 }, hornR: { rot: 10, y: 22 },
    fLegL: { rot: 65, y: 18 }, fLegR: { rot: 70, y: 16 },
    hLegL: { rot: 35, y: 14 }, hLegR: { rot: 30, y: 14 },
    tail: { rot: 60, y: 16 }, tailTip: { rot: 75, y: 18 },
    spines: { y: 24, rot: 40 },
    opacity: 0.95, flash: false, scale: 1,
  },
  // Frame 5: Sprawled — body flat on ground
  {
    body: { y: 32, rot: 55 }, chest: { y: 35, rot: 58 }, belly: { y: 28, rot: 48 },
    head: { y: 33, rot: -20 }, snout: { y: 36, rot: -25 }, jaw: { y: 36, rot: -15 },
    earL: { rot: 15, y: 28 }, earR: { rot: 15, y: 28 },
    hornL: { rot: 20, y: 28 }, hornR: { rot: 20, y: 28 },
    fLegL: { rot: 75, y: 24 }, fLegR: { rot: 78, y: 22 },
    hLegL: { rot: 50, y: 20 }, hLegR: { rot: 45, y: 20 },
    tail: { rot: 65, y: 22 }, tailTip: { rot: 80, y: 24 },
    spines: { y: 32, rot: 55 },
    opacity: 0.9, flash: false, scale: 0.98,
  },
  // Frame 6: Twitching — last spasm
  {
    body: { y: 34, rot: 60 }, chest: { y: 37, rot: 62 }, belly: { y: 30, rot: 52 },
    head: { y: 35, rot: -15 }, snout: { y: 38, rot: -20 }, jaw: { y: 39, rot: -10 },
    earL: { rot: 20, y: 30 }, earR: { rot: 10, y: 30 },
    hornL: { rot: 25, y: 30 }, hornR: { rot: 15, y: 30 },
    fLegL: { rot: 80, y: 26 }, fLegR: { rot: 70, y: 25 },
    hLegL: { rot: 55, y: 22 }, hLegR: { rot: 60, y: 22 },
    tail: { rot: 70, y: 24 }, tailTip: { rot: 85, y: 26 },
    spines: { y: 34, rot: 60 },
    opacity: 0.85, flash: true, scale: 0.97,
  },
  // Frame 7: Settling
  {
    body: { y: 35, rot: 65 }, chest: { y: 38, rot: 66 }, belly: { y: 31, rot: 56 },
    head: { y: 36, rot: -18 }, snout: { y: 39, rot: -22 }, jaw: { y: 40, rot: -12 },
    earL: { rot: 22, y: 31 }, earR: { rot: 22, y: 31 },
    hornL: { rot: 28, y: 31 }, hornR: { rot: 28, y: 31 },
    fLegL: { rot: 82, y: 27 }, fLegR: { rot: 80, y: 26 },
    hLegL: { rot: 58, y: 23 }, hLegR: { rot: 55, y: 23 },
    tail: { rot: 72, y: 25 }, tailTip: { rot: 88, y: 27 },
    spines: { y: 35, rot: 65 },
    opacity: 0.7, flash: false, scale: 0.95,
  },
  // Frame 8: Hellfire start — body begins dissolving
  {
    body: { y: 36, rot: 68 }, chest: { y: 39, rot: 68 }, belly: { y: 32, rot: 58 },
    head: { y: 37, rot: -20 }, snout: { y: 40, rot: -24 }, jaw: { y: 41, rot: -14 },
    earL: { rot: 24, y: 32 }, earR: { rot: 24, y: 32 },
    hornL: { rot: 30, y: 32 }, hornR: { rot: 30, y: 32 },
    fLegL: { rot: 83, y: 28 }, fLegR: { rot: 82, y: 27 },
    hLegL: { rot: 60, y: 24 }, hLegR: { rot: 58, y: 24 },
    tail: { rot: 74, y: 26 }, tailTip: { rot: 90, y: 28 },
    spines: { y: 36, rot: 68 },
    opacity: 0.5, flash: false, scale: 0.93,
  },
  // Frame 9: Dissolving
  {
    body: { y: 37, rot: 70 }, chest: { y: 40, rot: 70 }, belly: { y: 33, rot: 60 },
    head: { y: 38, rot: -22 }, snout: { y: 41, rot: -26 }, jaw: { y: 42, rot: -16 },
    earL: { rot: 26, y: 33 }, earR: { rot: 26, y: 33 },
    hornL: { rot: 32, y: 33 }, hornR: { rot: 32, y: 33 },
    fLegL: { rot: 84, y: 29 }, fLegR: { rot: 83, y: 28 },
    hLegL: { rot: 62, y: 25 }, hLegR: { rot: 60, y: 25 },
    tail: { rot: 76, y: 27 }, tailTip: { rot: 90, y: 29 },
    spines: { y: 37, rot: 70 },
    opacity: 0.3, flash: false, scale: 0.91,
  },
  // Frame 10: Nearly gone
  {
    body: { y: 38, rot: 72 }, chest: { y: 41, rot: 72 }, belly: { y: 34, rot: 62 },
    head: { y: 39, rot: -24 }, snout: { y: 42, rot: -28 }, jaw: { y: 43, rot: -18 },
    earL: { rot: 28, y: 34 }, earR: { rot: 28, y: 34 },
    hornL: { rot: 34, y: 34 }, hornR: { rot: 34, y: 34 },
    fLegL: { rot: 85, y: 30 }, fLegR: { rot: 84, y: 29 },
    hLegL: { rot: 64, y: 26 }, hLegR: { rot: 62, y: 26 },
    tail: { rot: 78, y: 28 }, tailTip: { rot: 90, y: 30 },
    spines: { y: 38, rot: 72 },
    opacity: 0.12, flash: false, scale: 0.88,
  },
  // Frame 11: Gone — dissolved into hellfire
  {
    body: { y: 38, rot: 75 }, chest: { y: 41, rot: 75 }, belly: { y: 34, rot: 65 },
    head: { y: 39, rot: -26 }, snout: { y: 42, rot: -30 }, jaw: { y: 43, rot: -20 },
    earL: { rot: 30, y: 35 }, earR: { rot: 30, y: 35 },
    hornL: { rot: 36, y: 35 }, hornR: { rot: 36, y: 35 },
    fLegL: { rot: 85, y: 31 }, fLegR: { rot: 85, y: 30 },
    hLegL: { rot: 65, y: 27 }, hLegR: { rot: 63, y: 27 },
    tail: { rot: 80, y: 29 }, tailTip: { rot: 90, y: 31 },
    spines: { y: 38, rot: 75 },
    opacity: 0, flash: false, scale: 0.85,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// INTERPOLATION
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// CANVAS RENDERER
// ═══════════════════════════════════════════════════════════════════════════

function drawDemonDog(ctx, cx, cy, frame, scale = 2.2, variant = "basic") {
  const opacity = frame.opacity ?? 1;
  const frameScale = frame.scale ?? 1;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale * frameScale, scale * frameScale);
  ctx.globalAlpha = opacity;

  // Color variants
  const variantColors = {
    basic: {
      body: "#3a1a1a", chest: "#4a1a1a", belly: "#2a0e0e",
      head: "#3a1a1a", snout: "#2a1010", jaw: "#1a0808",
      ear: "#2a0e0e", horn: "#1a1a1a", leg: "#2a1010",
      tail: "#2a0e0e", tailTip: "#5a1a1a", spines: "#1a1a1a",
      eye: "#ff3300", eyeGlow: "#ff6600",
    },
    hellhound: {
      body: "#1a1a2a", chest: "#2a1a3a", belly: "#0e0e2a",
      head: "#1a1a2a", snout: "#10102a", jaw: "#08081a",
      ear: "#0e0e2a", horn: "#3a1a4a", leg: "#10102a",
      tail: "#0e0e2a", tailTip: "#4a1a5a", spines: "#2a1a3a",
      eye: "#aa00ff", eyeGlow: "#cc44ff",
    },
    infernal: {
      body: "#2a0a00", chest: "#3a1500", belly: "#1a0500",
      head: "#2a0a00", snout: "#1a0500", jaw: "#0a0200",
      ear: "#1a0500", horn: "#4a2000", leg: "#1a0500",
      tail: "#1a0500", tailTip: "#ff4400", spines: "#3a1500",
      eye: "#ffcc00", eyeGlow: "#ffee44",
    },
  };
  const colors = variantColors[variant] || variantColors.basic;

  const isFlash = frame.flash;

  // Draw a part with rotation and offset
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

  // === DRAW ORDER: back legs → tail → body → spines → front legs → head ===

  // Back hind legs
  drawPart(DEMON_DOG_PARTS.hLegL, frame.hLegL, 13, -10, colors.leg);
  drawPart(DEMON_DOG_PARTS.hLegR, frame.hLegR, 19, -10, colors.leg);

  // Tail
  drawPart(DEMON_DOG_PARTS.tail, frame.tail, 22, -50, colors.tail);
  // Tail flame tip
  drawPart(DEMON_DOG_PARTS.tailTip, frame.tailTip, 38, -52, colors.tailTip);

  // Tail fire effect (not during flash)
  if (!isFlash) {
    const tRot = (frame.tailTip?.rot || 0) * Math.PI / 180;
    const tY = frame.tailTip?.y || 0;
    ctx.save();
    ctx.translate(38, -52 + tY);
    ctx.rotate(tRot);
    // Flickering flame particles on tail
    const flicker = Math.sin(Date.now() / 80) * 2;
    ctx.fillStyle = variant === "hellhound" ? "rgba(170,0,255,0.6)" :
                    variant === "infernal" ? "rgba(255,200,0,0.6)" :
                    "rgba(255,60,0,0.6)";
    ctx.fillRect(-2 + flicker, -8, 4, 5);
    ctx.fillStyle = variant === "hellhound" ? "rgba(200,80,255,0.4)" :
                    variant === "infernal" ? "rgba(255,240,100,0.4)" :
                    "rgba(255,120,0,0.4)";
    ctx.fillRect(-1 - flicker, -11, 3, 4);
    ctx.restore();
  }

  // Belly
  drawPart(DEMON_DOG_PARTS.belly, frame.belly, 6, -32, colors.belly);

  // Body
  drawPart(DEMON_DOG_PARTS.body, frame.body, 0, -33, colors.body);

  // Chest
  drawPart(DEMON_DOG_PARTS.chest, frame.chest, -8, -41, colors.chest);

  // Rib cage detail (not during flash)
  if (!isFlash) {
    const bRot = (frame.body?.rot || 0) * Math.PI / 180;
    const bY = frame.body?.y || 0;
    ctx.save();
    ctx.translate(0, -33 + bY);
    ctx.rotate(bRot);
    ctx.fillStyle = "rgba(80,30,30,0.5)";
    // Rib lines
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(-12 + i * 8, -10, 5, 1.5);
    }
    ctx.restore();
  }

  // Back spines
  drawPart(DEMON_DOG_PARTS.spines, frame.spines, 2, -49, colors.spines);

  // Spine detail ridges
  if (!isFlash) {
    const sRot = (frame.spines?.rot || 0) * Math.PI / 180;
    const sY = frame.spines?.y || 0;
    ctx.save();
    ctx.translate(2, -49 + sY);
    ctx.rotate(sRot);
    ctx.fillStyle = variant === "hellhound" ? "#4a2a5a" :
                    variant === "infernal" ? "#5a2a00" : "#2a0e0e";
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(-10 + i * 5, -5, 3, -4 - (i === 2 ? 3 : 0));
    }
    ctx.restore();
  }

  // Front legs
  drawPart(DEMON_DOG_PARTS.fLegL, frame.fLegL, -16, -10, colors.leg);
  drawPart(DEMON_DOG_PARTS.fLegR, frame.fLegR, -10, -10, colors.leg);

  // Paw claws (front)
  if (!isFlash) {
    const fLRot = (frame.fLegL?.rot || 0) * Math.PI / 180;
    const fLY = frame.fLegL?.y || 0;
    ctx.save();
    ctx.translate(-16, -10 + fLY);
    ctx.rotate(fLRot);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(-6, 10, 2, 3);
    ctx.fillRect(-3, 10, 2, 3);
    ctx.fillRect(0, 10, 2, 3);
    ctx.restore();

    const fRRot = (frame.fLegR?.rot || 0) * Math.PI / 180;
    const fRY = frame.fLegR?.y || 0;
    ctx.save();
    ctx.translate(-10, -10 + fRY);
    ctx.rotate(fRRot);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(-6, 10, 2, 3);
    ctx.fillRect(-3, 10, 2, 3);
    ctx.fillRect(0, 10, 2, 3);
    ctx.restore();
  }

  // Head
  drawPart(DEMON_DOG_PARTS.head, frame.head, -19, -51, colors.head);

  // Snout
  drawPart(DEMON_DOG_PARTS.snout, frame.snout, -35, -51, colors.snout);

  // Jaw (animated separately for death snarl)
  drawPart(DEMON_DOG_PARTS.jaw, frame.jaw, -34, -45, colors.jaw);

  // Teeth (on snout/jaw)
  if (!isFlash) {
    const sRot2 = (frame.snout?.rot || 0) * Math.PI / 180;
    const sY2 = frame.snout?.y || 0;
    ctx.save();
    ctx.translate(-35, -51 + sY2);
    ctx.rotate(sRot2);
    ctx.fillStyle = "#e8e8d0";
    // Upper fangs
    ctx.fillRect(-8, 7, 2, 4);
    ctx.fillRect(-4, 7, 2, 3);
    ctx.fillRect(0, 7, 2, 4);
    ctx.restore();

    // Lower fangs
    const jRot = (frame.jaw?.rot || 0) * Math.PI / 180;
    const jY = frame.jaw?.y || 0;
    ctx.save();
    ctx.translate(-34, -45 + jY);
    ctx.rotate(jRot);
    ctx.fillStyle = "#d8d8c0";
    ctx.fillRect(-7, -4, 2, 3);
    ctx.fillRect(-3, -4, 2, 2);
    ctx.fillRect(1, -4, 2, 3);
    ctx.restore();
  }

  // Ears
  drawPart(DEMON_DOG_PARTS.earL, frame.earL, -26, -63, colors.ear);
  drawPart(DEMON_DOG_PARTS.earR, frame.earR, -16, -63, colors.ear);

  // Horns
  drawPart(DEMON_DOG_PARTS.hornL, frame.hornL, -28, -68, colors.horn);
  drawPart(DEMON_DOG_PARTS.hornR, frame.hornR, -14, -68, colors.horn);

  // Horn tips glow
  if (!isFlash) {
    const hlRot = (frame.hornL?.rot || 0) * Math.PI / 180;
    const hlY = frame.hornL?.y || 0;
    ctx.save();
    ctx.translate(-28, -68 + hlY);
    ctx.rotate(hlRot);
    ctx.fillStyle = colors.eyeGlow;
    ctx.globalAlpha = (opacity) * (0.5 + Math.sin(Date.now() / 200) * 0.3);
    ctx.fillRect(-3, -8, 3, 3);
    ctx.globalAlpha = opacity;
    ctx.restore();

    const hrRot = (frame.hornR?.rot || 0) * Math.PI / 180;
    const hrY = frame.hornR?.y || 0;
    ctx.save();
    ctx.translate(-14, -68 + hrY);
    ctx.rotate(hrRot);
    ctx.fillStyle = colors.eyeGlow;
    ctx.globalAlpha = (opacity) * (0.5 + Math.sin(Date.now() / 200) * 0.3);
    ctx.fillRect(-3, -8, 3, 3);
    ctx.globalAlpha = opacity;
    ctx.restore();
  }

  // Eyes (demonic glow)
  if (!isFlash) {
    const hRot = (frame.head?.rot || 0) * Math.PI / 180;
    const hY = frame.head?.y || 0;
    ctx.save();
    ctx.translate(-19, -51 + hY);
    ctx.rotate(hRot);

    // Eye glow halo
    ctx.fillStyle = colors.eyeGlow;
    ctx.globalAlpha = (opacity) * (0.3 + Math.sin(Date.now() / 150) * 0.15);
    ctx.fillRect(-12, -7, 6, 5);
    ctx.fillRect(-4, -7, 6, 5);

    // Eye core
    ctx.globalAlpha = opacity;
    ctx.fillStyle = colors.eye;
    ctx.fillRect(-11, -6, 4, 3);
    ctx.fillRect(-3, -6, 4, 3);

    // Pupil slit
    ctx.fillStyle = "#000";
    ctx.fillRect(-9.5, -6, 1.5, 3);
    ctx.fillRect(-1.5, -6, 1.5, 3);

    ctx.restore();
  }

  // Nose
  if (!isFlash) {
    const snRot = (frame.snout?.rot || 0) * Math.PI / 180;
    const snY = frame.snout?.y || 0;
    ctx.save();
    ctx.translate(-35, -51 + snY);
    ctx.rotate(snRot);
    ctx.fillStyle = "#0a0505";
    ctx.fillRect(-8, -3, 4, 3);
    ctx.restore();
  }

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTICLE SYSTEM — Hellfire dissolution effects
// ═══════════════════════════════════════════════════════════════════════════

class HellParticle {
  constructor(x, y, variant) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = -Math.random() * 4 - 2; // Rise upward (hellfire)
    this.life = 1;
    this.decay = 0.012 + Math.random() * 0.018;
    this.size = 2 + Math.random() * 4;

    const palettes = {
      basic:     ["#ff3300", "#ff6600", "#ff9900", "#ffcc00", "#ff0000"],
      hellhound: ["#aa00ff", "#cc44ff", "#8800cc", "#dd88ff", "#6600aa"],
      infernal:  ["#ffcc00", "#ff8800", "#ffee44", "#ff4400", "#ffaa00"],
    };
    const palette = palettes[variant] || palettes.basic;
    this.color = palette[Math.floor(Math.random() * palette.length)];
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy -= 0.03; // Accelerate upward
    this.vx *= 0.98;
    this.life -= this.decay;
    this.size *= 0.99;
  }
  draw(ctx) {
    if (this.life <= 0) return;
    ctx.globalAlpha = this.life * 0.8;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DemonDogAnimationPreview() {
  const walkCanvasRef = useRef(null);
  const deathCanvasRef = useRef(null);
  const [walkSpeed, setWalkSpeed] = useState(10);
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

      // Ground shadow (larger, elongated for quadruped)
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2 - 10, canvas.height - 38, 45, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Moving ground dust for speed sense
      if (walkPlaying) {
        ctx.fillStyle = "rgba(255,100,50,0.08)";
        for (let i = 0; i < 12; i++) {
          const bx = ((i * 60 - (walkAnimRef.current.time * 50) % 720) + 720) % 720;
          ctx.beginPath();
          ctx.arc(bx, canvas.height - 38 + Math.random() * 4, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      drawDemonDog(ctx, canvas.width / 2 + 10, canvas.height - 40, interpolated, 2.2, variant);

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

      // Spawn hellfire particles on impact frames and during dissolve
      if (deathPlaying) {
        // Big burst on initial hit and ground impact
        if ((frameIdx === 0 || frameIdx === 3 || frameIdx === 6) && t < 0.15) {
          for (let i = 0; i < 10; i++) {
            deathAnimRef.current.particles.push(
              new HellParticle(
                canvas.width / 2 + (Math.random() - 0.5) * 60,
                canvas.height - 70 + (Math.random() - 0.5) * 30,
                variant
              )
            );
          }
        }
        // Sustained dissolution particles (frames 8-11)
        if (frameIdx >= 8 && frameIdx < 11 && Math.random() < 0.4) {
          deathAnimRef.current.particles.push(
            new HellParticle(
              canvas.width / 2 + (Math.random() - 0.5) * 80,
              canvas.height - 50 + (Math.random() - 0.5) * 20,
              variant
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
      ctx.ellipse(canvas.width / 2 - 10, canvas.height - 38, 45, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      drawDemonDog(ctx, canvas.width / 2 + 10, canvas.height - 40, interpolated, 2.2, variant);

      // Draw particles on top
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
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#ff4422", letterSpacing: "0.05em" }}>
            🐺 DEMON DOG ANIMATION SYSTEM
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#5a6a7a", letterSpacing: "0.08em" }}>
            TDG — FAST ENEMY TYPE · GALLOP CYCLE &amp; DEATH SEQUENCE
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { key: "basic", label: "DEMON DOG" },
            { key: "hellhound", label: "HELLHOUND" },
            { key: "infernal", label: "INFERNAL" },
          ].map(v => (
            <button key={v.key} onClick={() => setVariant(v.key)}
              style={{
                padding: "6px 16px", border: "1px solid",
                borderColor: variant === v.key ? "#ff4422" : "rgba(255,255,255,0.1)",
                background: variant === v.key ? "rgba(255,68,34,0.12)" : "transparent",
                color: variant === v.key ? "#ff4422" : "#5a6a7a",
                borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: "inherit",
                textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600,
              }}>
              {v.label}
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
            <h2 style={{ margin: 0, fontSize: 13, color: "#ff6644", letterSpacing: "0.1em", fontWeight: 600 }}>
              🏃 GALLOP CYCLE
            </h2>
            <span style={{ fontSize: 11, color: "#3a4a5a" }}>
              FRAME {currentWalkFrame}/{WALK_FRAMES.length - 1}
            </span>
          </div>
          <canvas ref={walkCanvasRef} width={360} height={280}
            style={{ width: "100%", maxWidth: 720, height: "auto", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}
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
            <input type="range" min={3} max={20} step={0.5} value={walkSpeed}
              onChange={e => setWalkSpeed(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#ff4422" }}
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
          <canvas ref={deathCanvasRef} width={360} height={280}
            style={{ width: "100%", maxWidth: 720, height: "auto", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}
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

        {/* Integration Notes */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: 16 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 12, color: "#ff4422", letterSpacing: "0.1em" }}>
            📋 INTEGRATION NOTES
          </h3>
          <div style={{ fontSize: 11, lineHeight: 1.7, color: "#5a7a8a" }}>
            <p style={{ margin: "0 0 8px" }}>
              <strong style={{ color: "#7a9aaa" }}>Gallop Cycle:</strong> 8 keyframes, looping. Rotary gallop with gathered/extended phases. Body bob, head pump, tail counterbalance. Higher default speed (10x vs 8x samurai) reflects fast enemy type.
            </p>
            <p style={{ margin: "0 0 8px" }}>
              <strong style={{ color: "#7a9aaa" }}>Death Sequence:</strong> 12 keyframes, plays once. Hit yelp → front collapse → chin impact → roll → sprawl → hellfire dissolution. Includes white flash on impact frames and rising hellfire particles.
            </p>
            <p style={{ margin: "0 0 8px" }}>
              <strong style={{ color: "#7a9aaa" }}>Body Parts (17):</strong> body, chest, belly, head, snout, jaw, earL/R, hornL/R, fLegL/R, hLegL/R, tail, tailTip, spines — each with independent rotation + Y offset pivots.
            </p>
            <p style={{ margin: "0 0 8px" }}>
              <strong style={{ color: "#7a9aaa" }}>Details:</strong> Glowing demonic eyes with slit pupils, flickering tail flame, horn tip glow, spine ridges, visible fangs (upper/lower), paw claws, rib cage texture.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#7a9aaa" }}>Variants:</strong> Demon Dog (dark red, red eyes), Hellhound (purple, violet eyes), Infernal (burnt orange, yellow eyes). All share same skeleton/animation data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
