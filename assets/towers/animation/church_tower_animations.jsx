import { useState, useEffect, useRef, useCallback } from "react";

// ─── Tower Part Definitions (Gothic Church Architecture) ───
// T1: Simple Chapel with Bell
const T1_PARTS = {
  base: { x: -32, y: -10, w: 64, h: 10, color: "#8a7d6f" }, // Stone
  foundation: { x: -35, y: -18, w: 70, h: 8, color: "#6a5d4f" },
  wall: { x: -30, y: -55, w: 60, h: 37, color: "#9a8d7f" },
  doorway: { x: -8, y: -28, w: 16, h: 18, color: "#2a2a2a" },
  doorArch: { x: -10, y: -30, w: 20, h: 4, color: "#4a4a4a" },
  windowL: { x: -22, y: -48, w: 8, h: 14, color: "#4a6a9a" }, // Stained glass blue
  windowR: { x: 14, y: -48, w: 8, h: 14, color: "#9a4a6a" }, // Stained glass red
  roofBase: { x: -33, y: -60, w: 66, h: 5, color: "#5a4a3a" },
  roof: { x: -28, y: -85, w: 56, h: 25, color: "#3a2a2a" }, // Dark slate
  cross: { 
    vertical: { x: -2, y: -98, w: 4, h: 18, color: "#D4AF37" }, // Gold
    horizontal: { x: -6, y: -92, w: 12, h: 4, color: "#D4AF37" }
  },
  bell: { x: -5, y: -68, w: 10, h: 8, color: "#8B7355" },
};

// T2: Parish Church with Twin Towers
const T2_PARTS = {
  base: { x: -40, y: -12, w: 80, h: 12, color: "#8a7d6f" },
  foundation: { x: -43, y: -22, w: 86, h: 10, color: "#6a5d4f" },
  nave: { x: -35, y: -65, w: 70, h: 43, color: "#9a8d7f" },
  doorway: { x: -10, y: -32, w: 20, h: 22, color: "#2a2a2a" },
  doorArch: { x: -12, y: -35, w: 24, h: 5, color: "#4a4a4a" },
  // Rose window (main)
  roseWindow: { x: -12, y: -58, w: 24, h: 24, color: "#4a6a9a" },
  roseCenter: { x: -6, y: -52, w: 12, h: 12, color: "#9a4a6a" },
  // Side windows
  windowL1: { x: -32, y: -48, w: 7, h: 16, color: "#6a4a9a" },
  windowL2: { x: -32, y: -28, w: 7, h: 16, color: "#4a9a6a" },
  windowR1: { x: 25, y: -48, w: 7, h: 16, color: "#9a6a4a" },
  windowR2: { x: 25, y: -28, w: 7, h: 16, color: "#4a6a9a" },
  // Towers
  towerL: { x: -38, y: -95, w: 18, h: 30, color: "#8a7d6f" },
  towerR: { x: 20, y: -95, w: 18, h: 30, color: "#8a7d6f" },
  // Bell openings
  bellOpenL: { x: -34, y: -88, w: 10, h: 12, color: "#2a2a2a" },
  bellOpenR: { x: 24, y: -88, w: 10, h: 12, color: "#2a2a2a" },
  // Spires
  spireL: { x: -34, y: -115, w: 10, h: 20, color: "#3a2a2a" },
  spireR: { x: 24, y: -115, w: 10, h: 20, color: "#3a2a2a" },
  // Crosses
  crossL: { v: { x: -31, y: -122, w: 4, h: 12 }, h: { x: -33, y: -118, w: 8, h: 3 } },
  crossR: { v: { x: 27, y: -122, w: 4, h: 12 }, h: { x: 25, y: -118, w: 8, h: 3 } },
  // Main roof
  roofBase: { x: -38, y: -70, w: 76, h: 5, color: "#5a4a3a" },
  roof: { x: -33, y: -95, w: 66, h: 25, color: "#3a2a2a" },
  // Bells
  bellL: { x: -32, y: -83, w: 6, h: 6, color: "#8B7355" },
  bellR: { x: 26, y: -83, w: 6, h: 6, color: "#8B7355" },
};

// T3: Grand Cathedral with Central Spire
const T3_PARTS = {
  base: { x: -48, y: -15, w: 96, h: 15, color: "#8a7d6f" },
  foundation: { x: -52, y: -28, w: 104, h: 13, color: "#6a5d4f" },
  // Main cathedral body
  cathedral: { x: -44, y: -85, w: 88, h: 57, color: "#9a8d7f" },
  // Grand entrance
  doorway: { x: -14, y: -42, w: 28, h: 28, color: "#2a2a2a" },
  doorArchOuter: { x: -18, y: -46, w: 36, h: 6, color: "#4a4a4a" },
  doorArchInner: { x: -16, y: -44, w: 32, h: 4, color: "#6a6a6a" },
  // Large rose window
  roseWindowOuter: { x: -18, y: -75, w: 36, h: 36, color: "#4a6a9a" },
  roseWindowMiddle: { x: -14, y: -71, w: 28, h: 28, color: "#9a4a6a" },
  roseWindowCenter: { x: -8, y: -65, w: 16, h: 16, color: "#6a9a4a" },
  // Side lancet windows
  windowL1: { x: -40, y: -70, w: 8, h: 20, color: "#6a4a9a" },
  windowL2: { x: -40, y: -46, w: 8, h: 20, color: "#4a9a6a" },
  windowL3: { x: -28, y: -46, w: 8, h: 20, color: "#9a6a4a" },
  windowR1: { x: 32, y: -70, w: 8, h: 20, color: "#9a4a6a" },
  windowR2: { x: 32, y: -46, w: 8, h: 20, color: "#4a6a9a" },
  windowR3: { x: 20, y: -46, w: 8, h: 20, color: "#6a9a4a" },
  // Side towers
  towerL: { x: -46, y: -120, w: 22, h: 35, color: "#8a7d6f" },
  towerR: { x: 24, y: -120, w: 22, h: 35, color: "#8a7d6f" },
  bellOpenL: { x: -42, y: -110, w: 14, h: 16, color: "#2a2a2a" },
  bellOpenR: { x: 28, y: -110, w: 14, h: 16, color: "#2a2a2a" },
  // Tower spires
  spireL: { x: -40, y: -145, w: 14, h: 25, color: "#3a2a2a" },
  spireR: { x: 26, y: -145, w: 14, h: 25, color: "#3a2a2a" },
  // Central tower (tallest)
  centralTowerBase: { x: -16, y: -100, w: 32, h: 15, color: "#7a6d5f" },
  centralTower: { x: -14, y: -145, w: 28, h: 45, color: "#8a7d6f" },
  centralBellOpen: { x: -10, y: -132, w: 20, h: 18, color: "#2a2a2a" },
  centralSpire: { x: -10, y: -175, w: 20, h: 30, color: "#3a2a2a" },
  // Crosses
  crossL: { v: { x: -35, y: -153, w: 4, h: 14 }, h: { x: -38, y: -148, w: 10, h: 4 } },
  crossR: { v: { x: 31, y: -153, w: 4, h: 14 }, h: { x: 28, y: -148, w: 10, h: 4 } },
  crossCenter: { v: { x: -2, y: -188, w: 4, h: 18 }, h: { x: -6, y: -182, w: 12, h: 5 } },
  // Main roof
  roofBase: { x: -46, y: -90, w: 92, h: 5, color: "#5a4a3a" },
  roof: { x: -40, y: -120, w: 80, h: 30, color: "#3a2a2a" },
  // Bells
  bellL: { x: -40, y: -105, w: 8, h: 8, color: "#8B7355" },
  bellR: { x: 32, y: -105, w: 8, h: 8, color: "#8B7355" },
  bellCenter: { x: -6, y: -127, w: 12, h: 10, color: "#8B7355" },
};

// ─── Divine Light Beam Effect ───
class LightBeam {
  constructor(x, y, intensity = 1) {
    this.x = x;
    this.y = y;
    this.intensity = intensity;
    this.life = 1;
    this.width = 15 + Math.random() * 10;
    this.fadeSpeed = 0.008 + Math.random() * 0.005;
  }
  update() {
    this.life -= this.fadeSpeed;
  }
  draw(ctx) {
    if (this.life <= 0) return;
    const gradient = ctx.createLinearGradient(this.x, this.y - 100, this.x, this.y);
    gradient.addColorStop(0, `rgba(255, 255, 220, 0)`);
    gradient.addColorStop(0.3, `rgba(255, 255, 200, ${0.15 * this.life * this.intensity})`);
    gradient.addColorStop(1, `rgba(255, 240, 180, ${0.3 * this.life * this.intensity})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x - this.width/2, this.y - 100, this.width, 100);
  }
}

// ─── Angelic Particle ───
class AngelicParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = -Math.random() * 1.5 - 0.5;
    this.life = 1;
    this.decay = 0.008 + Math.random() * 0.008;
    this.size = 1.5 + Math.random() * 2;
    this.color = "#ffffdd";
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
  }
  draw(ctx) {
    if (this.life <= 0) return;
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

// ─── Animation Keyframe Definitions ───

// T1 IDLE: Gentle bell sway
const T1_IDLE_FRAMES = [
  { bell: { rot: 0, y: 0 }, light: 0 },
  { bell: { rot: 3, y: 1 }, light: 0.2 },
  { bell: { rot: 0, y: 0 }, light: 0 },
  { bell: { rot: -3, y: 1 }, light: 0.2 },
];

// T1 BLESSING: Bell ring with divine light
const T1_BLESS_FRAMES = [
  { bell: { rot: 0, y: 0 }, light: 0, glow: 0 },
  { bell: { rot: 15, y: 2 }, light: 0.3, glow: 0.4 },
  { bell: { rot: 25, y: 3 }, light: 0.6, glow: 0.7 },
  { bell: { rot: 20, y: 2 }, light: 0.8, glow: 1 },
  { bell: { rot: -20, y: 2 }, light: 1, glow: 0.9 },
  { bell: { rot: -25, y: 3 }, light: 0.8, glow: 0.7 },
  { bell: { rot: -15, y: 2 }, light: 0.5, glow: 0.4 },
  { bell: { rot: 0, y: 0 }, light: 0.2, glow: 0.1 },
  { bell: { rot: 0, y: 0 }, light: 0, glow: 0 },
];

// T2 IDLE: Twin bells alternating
const T2_IDLE_FRAMES = [
  { bellL: { rot: 0, y: 0 }, bellR: { rot: 0, y: 0 }, light: 0 },
  { bellL: { rot: 5, y: 1 }, bellR: { rot: -5, y: 1 }, light: 0.1 },
  { bellL: { rot: 0, y: 0 }, bellR: { rot: 0, y: 0 }, light: 0 },
  { bellL: { rot: -5, y: 1 }, bellR: { rot: 5, y: 1 }, light: 0.1 },
];

// T2 BLESSING: Twin bell symphony
const T2_BLESS_FRAMES = [
  { bellL: { rot: 0, y: 0 }, bellR: { rot: 0, y: 0 }, light: 0, glow: 0 },
  { bellL: { rot: 20, y: 2 }, bellR: { rot: 10, y: 1 }, light: 0.4, glow: 0.5 },
  { bellL: { rot: 30, y: 3 }, bellR: { rot: 20, y: 2 }, light: 0.7, glow: 0.8 },
  { bellL: { rot: 25, y: 3 }, bellR: { rot: 30, y: 3 }, light: 1, glow: 1 },
  { bellL: { rot: -25, y: 3 }, bellR: { rot: -25, y: 3 }, light: 1, glow: 1 },
  { bellL: { rot: -30, y: 3 }, bellR: { rot: -20, y: 2 }, light: 0.8, glow: 0.8 },
  { bellL: { rot: -20, y: 2 }, bellR: { rot: -10, y: 1 }, light: 0.5, glow: 0.5 },
  { bellL: { rot: -10, y: 1 }, bellR: { rot: 0, y: 0 }, light: 0.2, glow: 0.2 },
  { bellL: { rot: 0, y: 0 }, bellR: { rot: 0, y: 0 }, light: 0, glow: 0 },
];

// T3 IDLE: Triple bell wave with ambient glow
const T3_IDLE_FRAMES = [
  { bellL: { rot: 0, y: 0 }, bellR: { rot: 0, y: 0 }, bellC: { rot: 0, y: 0 }, light: 0.1, glow: 0.1 },
  { bellL: { rot: 4, y: 1 }, bellR: { rot: -4, y: 1 }, bellC: { rot: 2, y: 0 }, light: 0.15, glow: 0.15 },
  { bellL: { rot: 0, y: 0 }, bellR: { rot: 0, y: 0 }, bellC: { rot: 0, y: 0 }, light: 0.1, glow: 0.1 },
  { bellL: { rot: -4, y: 1 }, bellR: { rot: 4, y: 1 }, bellC: { rot: -2, y: 0 }, light: 0.15, glow: 0.15 },
];

// T3 BLESSING: Grand cathedral choir of bells
const T3_BLESS_FRAMES = [
  { bellL: { rot: 0, y: 0 }, bellR: { rot: 0, y: 0 }, bellC: { rot: 0, y: 0 }, light: 0, glow: 0 },
  { bellL: { rot: 15, y: 2 }, bellR: { rot: 15, y: 2 }, bellC: { rot: 10, y: 1 }, light: 0.3, glow: 0.4 },
  { bellL: { rot: 25, y: 3 }, bellR: { rot: 25, y: 3 }, bellC: { rot: 20, y: 2 }, light: 0.6, glow: 0.7 },
  { bellL: { rot: 35, y: 4 }, bellR: { rot: 30, y: 3 }, bellC: { rot: 35, y: 4 }, light: 0.9, glow: 1 },
  { bellL: { rot: 30, y: 3 }, bellR: { rot: 35, y: 4 }, bellC: { rot: 30, y: 3 }, light: 1, glow: 1 },
  { bellL: { rot: -30, y: 3 }, bellR: { rot: -30, y: 3 }, bellC: { rot: -35, y: 4 }, light: 1, glow: 1 },
  { bellL: { rot: -35, y: 4 }, bellR: { rot: -25, y: 3 }, bellC: { rot: -30, y: 3 }, light: 0.9, glow: 0.9 },
  { bellL: { rot: -25, y: 3 }, bellR: { rot: -20, y: 2 }, bellC: { rot: -20, y: 2 }, light: 0.6, glow: 0.6 },
  { bellL: { rot: -15, y: 2 }, bellR: { rot: -10, y: 1 }, bellC: { rot: -10, y: 1 }, light: 0.3, glow: 0.3 },
  { bellL: { rot: -5, y: 1 }, bellR: { rot: 0, y: 0 }, bellC: { rot: 0, y: 0 }, light: 0.1, glow: 0.1 },
  { bellL: { rot: 0, y: 0 }, bellR: { rot: 0, y: 0 }, bellC: { rot: 0, y: 0 }, light: 0, glow: 0 },
];

// ─── Utility Functions ───
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
    } else {
      result[key] = lerp(frameA[key] || 0, frameB[key] || 0, t);
    }
  }
  return result;
}

// ─── Tower Renderers ───
function drawT1Tower(ctx, cx, cy, frame, scale = 2.2) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Divine light glow
  if (frame.glow > 0) {
    ctx.globalAlpha = frame.glow * 0.3;
    const gradient = ctx.createRadialGradient(0, -60, 0, 0, -60, 80);
    gradient.addColorStop(0, "rgba(255, 255, 200, 0.4)");
    gradient.addColorStop(1, "rgba(255, 255, 200, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(-80, -140, 160, 80);
    ctx.globalAlpha = 1;
  }

  // Base & Foundation
  ctx.fillStyle = T1_PARTS.base.color;
  ctx.fillRect(T1_PARTS.base.x, T1_PARTS.base.y, T1_PARTS.base.w, T1_PARTS.base.h);
  ctx.fillStyle = T1_PARTS.foundation.color;
  ctx.fillRect(T1_PARTS.foundation.x, T1_PARTS.foundation.y, T1_PARTS.foundation.w, T1_PARTS.foundation.h);
  
  // Wall
  ctx.fillStyle = T1_PARTS.wall.color;
  ctx.fillRect(T1_PARTS.wall.x, T1_PARTS.wall.y, T1_PARTS.wall.w, T1_PARTS.wall.h);
  
  // Windows (stained glass)
  ctx.fillStyle = T1_PARTS.windowL.color;
  ctx.fillRect(T1_PARTS.windowL.x, T1_PARTS.windowL.y, T1_PARTS.windowL.w, T1_PARTS.windowL.h);
  ctx.fillStyle = T1_PARTS.windowR.color;
  ctx.fillRect(T1_PARTS.windowR.x, T1_PARTS.windowR.y, T1_PARTS.windowR.w, T1_PARTS.windowR.h);
  
  // Doorway
  ctx.fillStyle = T1_PARTS.doorway.color;
  ctx.fillRect(T1_PARTS.doorway.x, T1_PARTS.doorway.y, T1_PARTS.doorway.w, T1_PARTS.doorway.h);
  ctx.fillStyle = T1_PARTS.doorArch.color;
  ctx.fillRect(T1_PARTS.doorArch.x, T1_PARTS.doorArch.y, T1_PARTS.doorArch.w, T1_PARTS.doorArch.h);
  
  // Roof
  ctx.fillStyle = T1_PARTS.roofBase.color;
  ctx.fillRect(T1_PARTS.roofBase.x, T1_PARTS.roofBase.y, T1_PARTS.roofBase.w, T1_PARTS.roofBase.h);
  ctx.fillStyle = T1_PARTS.roof.color;
  ctx.fillRect(T1_PARTS.roof.x, T1_PARTS.roof.y, T1_PARTS.roof.w, T1_PARTS.roof.h);
  
  // Bell (animated)
  const bellRot = (frame.bell?.rot || 0) * Math.PI / 180;
  const bellY = frame.bell?.y || 0;
  ctx.save();
  ctx.translate(0, -64 + bellY);
  ctx.rotate(bellRot);
  ctx.fillStyle = T1_PARTS.bell.color;
  ctx.fillRect(T1_PARTS.bell.x, T1_PARTS.bell.y + 64, T1_PARTS.bell.w, T1_PARTS.bell.h);
  ctx.restore();
  
  // Cross
  ctx.fillStyle = T1_PARTS.cross.vertical.color;
  ctx.fillRect(T1_PARTS.cross.vertical.x, T1_PARTS.cross.vertical.y, T1_PARTS.cross.vertical.w, T1_PARTS.cross.vertical.h);
  ctx.fillRect(T1_PARTS.cross.horizontal.x, T1_PARTS.cross.horizontal.y, T1_PARTS.cross.horizontal.w, T1_PARTS.cross.horizontal.h);

  ctx.restore();
}

function drawT2Tower(ctx, cx, cy, frame, scale = 1.7) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Divine light glow
  if (frame.glow > 0) {
    ctx.globalAlpha = frame.glow * 0.35;
    const gradient = ctx.createRadialGradient(0, -80, 0, 0, -80, 100);
    gradient.addColorStop(0, "rgba(255, 255, 200, 0.5)");
    gradient.addColorStop(1, "rgba(255, 255, 200, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(-100, -180, 200, 100);
    ctx.globalAlpha = 1;
  }

  // Base
  ctx.fillStyle = T2_PARTS.base.color;
  ctx.fillRect(T2_PARTS.base.x, T2_PARTS.base.y, T2_PARTS.base.w, T2_PARTS.base.h);
  ctx.fillStyle = T2_PARTS.foundation.color;
  ctx.fillRect(T2_PARTS.foundation.x, T2_PARTS.foundation.y, T2_PARTS.foundation.w, T2_PARTS.foundation.h);
  
  // Nave
  ctx.fillStyle = T2_PARTS.nave.color;
  ctx.fillRect(T2_PARTS.nave.x, T2_PARTS.nave.y, T2_PARTS.nave.w, T2_PARTS.nave.h);
  
  // Side windows
  ctx.fillStyle = T2_PARTS.windowL1.color;
  ctx.fillRect(T2_PARTS.windowL1.x, T2_PARTS.windowL1.y, T2_PARTS.windowL1.w, T2_PARTS.windowL1.h);
  ctx.fillStyle = T2_PARTS.windowL2.color;
  ctx.fillRect(T2_PARTS.windowL2.x, T2_PARTS.windowL2.y, T2_PARTS.windowL2.w, T2_PARTS.windowL2.h);
  ctx.fillStyle = T2_PARTS.windowR1.color;
  ctx.fillRect(T2_PARTS.windowR1.x, T2_PARTS.windowR1.y, T2_PARTS.windowR1.w, T2_PARTS.windowR1.h);
  ctx.fillStyle = T2_PARTS.windowR2.color;
  ctx.fillRect(T2_PARTS.windowR2.x, T2_PARTS.windowR2.y, T2_PARTS.windowR2.w, T2_PARTS.windowR2.h);
  
  // Rose window
  ctx.fillStyle = T2_PARTS.roseWindow.color;
  ctx.fillRect(T2_PARTS.roseWindow.x, T2_PARTS.roseWindow.y, T2_PARTS.roseWindow.w, T2_PARTS.roseWindow.h);
  ctx.fillStyle = T2_PARTS.roseCenter.color;
  ctx.fillRect(T2_PARTS.roseCenter.x, T2_PARTS.roseCenter.y, T2_PARTS.roseCenter.w, T2_PARTS.roseCenter.h);
  
  // Doorway
  ctx.fillStyle = T2_PARTS.doorway.color;
  ctx.fillRect(T2_PARTS.doorway.x, T2_PARTS.doorway.y, T2_PARTS.doorway.w, T2_PARTS.doorway.h);
  ctx.fillStyle = T2_PARTS.doorArch.color;
  ctx.fillRect(T2_PARTS.doorArch.x, T2_PARTS.doorArch.y, T2_PARTS.doorArch.w, T2_PARTS.doorArch.h);
  
  // Roof
  ctx.fillStyle = T2_PARTS.roofBase.color;
  ctx.fillRect(T2_PARTS.roofBase.x, T2_PARTS.roofBase.y, T2_PARTS.roofBase.w, T2_PARTS.roofBase.h);
  ctx.fillStyle = T2_PARTS.roof.color;
  ctx.fillRect(T2_PARTS.roof.x, T2_PARTS.roof.y, T2_PARTS.roof.w, T2_PARTS.roof.h);
  
  // Towers
  ctx.fillStyle = T2_PARTS.towerL.color;
  ctx.fillRect(T2_PARTS.towerL.x, T2_PARTS.towerL.y, T2_PARTS.towerL.w, T2_PARTS.towerL.h);
  ctx.fillRect(T2_PARTS.towerR.x, T2_PARTS.towerR.y, T2_PARTS.towerR.w, T2_PARTS.towerR.h);
  
  // Bell openings
  ctx.fillStyle = T2_PARTS.bellOpenL.color;
  ctx.fillRect(T2_PARTS.bellOpenL.x, T2_PARTS.bellOpenL.y, T2_PARTS.bellOpenL.w, T2_PARTS.bellOpenL.h);
  ctx.fillRect(T2_PARTS.bellOpenR.x, T2_PARTS.bellOpenR.y, T2_PARTS.bellOpenR.w, T2_PARTS.bellOpenR.h);
  
  // Bells (animated)
  const bellLRot = (frame.bellL?.rot || 0) * Math.PI / 180;
  const bellLY = frame.bellL?.y || 0;
  ctx.save();
  ctx.translate(-29, -77 + bellLY);
  ctx.rotate(bellLRot);
  ctx.fillStyle = T2_PARTS.bellL.color;
  ctx.fillRect(T2_PARTS.bellL.x + 29, T2_PARTS.bellL.y + 77, T2_PARTS.bellL.w, T2_PARTS.bellL.h);
  ctx.restore();
  
  const bellRRot = (frame.bellR?.rot || 0) * Math.PI / 180;
  const bellRY = frame.bellR?.y || 0;
  ctx.save();
  ctx.translate(29, -77 + bellRY);
  ctx.rotate(bellRRot);
  ctx.fillStyle = T2_PARTS.bellR.color;
  ctx.fillRect(T2_PARTS.bellR.x - 29, T2_PARTS.bellR.y + 77, T2_PARTS.bellR.w, T2_PARTS.bellR.h);
  ctx.restore();
  
  // Spires
  ctx.fillStyle = T2_PARTS.spireL.color;
  ctx.fillRect(T2_PARTS.spireL.x, T2_PARTS.spireL.y, T2_PARTS.spireL.w, T2_PARTS.spireL.h);
  ctx.fillRect(T2_PARTS.spireR.x, T2_PARTS.spireR.y, T2_PARTS.spireR.w, T2_PARTS.spireR.h);
  
  // Crosses
  ctx.fillStyle = "#D4AF37";
  ctx.fillRect(T2_PARTS.crossL.v.x, T2_PARTS.crossL.v.y, T2_PARTS.crossL.v.w, T2_PARTS.crossL.v.h);
  ctx.fillRect(T2_PARTS.crossL.h.x, T2_PARTS.crossL.h.y, T2_PARTS.crossL.h.w, T2_PARTS.crossL.h.h);
  ctx.fillRect(T2_PARTS.crossR.v.x, T2_PARTS.crossR.v.y, T2_PARTS.crossR.v.w, T2_PARTS.crossR.v.h);
  ctx.fillRect(T2_PARTS.crossR.h.x, T2_PARTS.crossR.h.y, T2_PARTS.crossR.h.w, T2_PARTS.crossR.h.h);

  ctx.restore();
}

function drawT3Tower(ctx, cx, cy, frame, scale = 1.35) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Divine light glow
  if (frame.glow > 0) {
    ctx.globalAlpha = frame.glow * 0.4;
    const gradient = ctx.createRadialGradient(0, -100, 0, 0, -100, 140);
    gradient.addColorStop(0, "rgba(255, 255, 200, 0.6)");
    gradient.addColorStop(1, "rgba(255, 255, 200, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(-140, -240, 280, 140);
    ctx.globalAlpha = 1;
  }

  // Base
  ctx.fillStyle = T3_PARTS.base.color;
  ctx.fillRect(T3_PARTS.base.x, T3_PARTS.base.y, T3_PARTS.base.w, T3_PARTS.base.h);
  ctx.fillStyle = T3_PARTS.foundation.color;
  ctx.fillRect(T3_PARTS.foundation.x, T3_PARTS.foundation.y, T3_PARTS.foundation.w, T3_PARTS.foundation.h);
  
  // Cathedral body
  ctx.fillStyle = T3_PARTS.cathedral.color;
  ctx.fillRect(T3_PARTS.cathedral.x, T3_PARTS.cathedral.y, T3_PARTS.cathedral.w, T3_PARTS.cathedral.h);
  
  // Side windows
  ctx.fillStyle = T3_PARTS.windowL1.color;
  ctx.fillRect(T3_PARTS.windowL1.x, T3_PARTS.windowL1.y, T3_PARTS.windowL1.w, T3_PARTS.windowL1.h);
  ctx.fillStyle = T3_PARTS.windowL2.color;
  ctx.fillRect(T3_PARTS.windowL2.x, T3_PARTS.windowL2.y, T3_PARTS.windowL2.w, T3_PARTS.windowL2.h);
  ctx.fillStyle = T3_PARTS.windowL3.color;
  ctx.fillRect(T3_PARTS.windowL3.x, T3_PARTS.windowL3.y, T3_PARTS.windowL3.w, T3_PARTS.windowL3.h);
  ctx.fillStyle = T3_PARTS.windowR1.color;
  ctx.fillRect(T3_PARTS.windowR1.x, T3_PARTS.windowR1.y, T3_PARTS.windowR1.w, T3_PARTS.windowR1.h);
  ctx.fillStyle = T3_PARTS.windowR2.color;
  ctx.fillRect(T3_PARTS.windowR2.x, T3_PARTS.windowR2.y, T3_PARTS.windowR2.w, T3_PARTS.windowR2.h);
  ctx.fillStyle = T3_PARTS.windowR3.color;
  ctx.fillRect(T3_PARTS.windowR3.x, T3_PARTS.windowR3.y, T3_PARTS.windowR3.w, T3_PARTS.windowR3.h);
  
  // Grand rose window
  ctx.fillStyle = T3_PARTS.roseWindowOuter.color;
  ctx.fillRect(T3_PARTS.roseWindowOuter.x, T3_PARTS.roseWindowOuter.y, T3_PARTS.roseWindowOuter.w, T3_PARTS.roseWindowOuter.h);
  ctx.fillStyle = T3_PARTS.roseWindowMiddle.color;
  ctx.fillRect(T3_PARTS.roseWindowMiddle.x, T3_PARTS.roseWindowMiddle.y, T3_PARTS.roseWindowMiddle.w, T3_PARTS.roseWindowMiddle.h);
  ctx.fillStyle = T3_PARTS.roseWindowCenter.color;
  ctx.fillRect(T3_PARTS.roseWindowCenter.x, T3_PARTS.roseWindowCenter.y, T3_PARTS.roseWindowCenter.w, T3_PARTS.roseWindowCenter.h);
  
  // Grand entrance
  ctx.fillStyle = T3_PARTS.doorway.color;
  ctx.fillRect(T3_PARTS.doorway.x, T3_PARTS.doorway.y, T3_PARTS.doorway.w, T3_PARTS.doorway.h);
  ctx.fillStyle = T3_PARTS.doorArchOuter.color;
  ctx.fillRect(T3_PARTS.doorArchOuter.x, T3_PARTS.doorArchOuter.y, T3_PARTS.doorArchOuter.w, T3_PARTS.doorArchOuter.h);
  ctx.fillStyle = T3_PARTS.doorArchInner.color;
  ctx.fillRect(T3_PARTS.doorArchInner.x, T3_PARTS.doorArchInner.y, T3_PARTS.doorArchInner.w, T3_PARTS.doorArchInner.h);
  
  // Roof
  ctx.fillStyle = T3_PARTS.roofBase.color;
  ctx.fillRect(T3_PARTS.roofBase.x, T3_PARTS.roofBase.y, T3_PARTS.roofBase.w, T3_PARTS.roofBase.h);
  ctx.fillStyle = T3_PARTS.roof.color;
  ctx.fillRect(T3_PARTS.roof.x, T3_PARTS.roof.y, T3_PARTS.roof.w, T3_PARTS.roof.h);
  
  // Side towers
  ctx.fillStyle = T3_PARTS.towerL.color;
  ctx.fillRect(T3_PARTS.towerL.x, T3_PARTS.towerL.y, T3_PARTS.towerL.w, T3_PARTS.towerL.h);
  ctx.fillRect(T3_PARTS.towerR.x, T3_PARTS.towerR.y, T3_PARTS.towerR.w, T3_PARTS.towerR.h);
  
  // Bell openings
  ctx.fillStyle = T3_PARTS.bellOpenL.color;
  ctx.fillRect(T3_PARTS.bellOpenL.x, T3_PARTS.bellOpenL.y, T3_PARTS.bellOpenL.w, T3_PARTS.bellOpenL.h);
  ctx.fillRect(T3_PARTS.bellOpenR.x, T3_PARTS.bellOpenR.y, T3_PARTS.bellOpenR.w, T3_PARTS.bellOpenR.h);
  
  // Side bells
  const bellLRot = (frame.bellL?.rot || 0) * Math.PI / 180;
  const bellLY = frame.bellL?.y || 0;
  ctx.save();
  ctx.translate(-36, -97 + bellLY);
  ctx.rotate(bellLRot);
  ctx.fillStyle = T3_PARTS.bellL.color;
  ctx.fillRect(T3_PARTS.bellL.x + 36, T3_PARTS.bellL.y + 97, T3_PARTS.bellL.w, T3_PARTS.bellL.h);
  ctx.restore();
  
  const bellRRot = (frame.bellR?.rot || 0) * Math.PI / 180;
  const bellRY = frame.bellR?.y || 0;
  ctx.save();
  ctx.translate(36, -97 + bellRY);
  ctx.rotate(bellRRot);
  ctx.fillStyle = T3_PARTS.bellR.color;
  ctx.fillRect(T3_PARTS.bellR.x - 36, T3_PARTS.bellR.y + 97, T3_PARTS.bellR.w, T3_PARTS.bellR.h);
  ctx.restore();
  
  // Side spires
  ctx.fillStyle = T3_PARTS.spireL.color;
  ctx.fillRect(T3_PARTS.spireL.x, T3_PARTS.spireL.y, T3_PARTS.spireL.w, T3_PARTS.spireL.h);
  ctx.fillRect(T3_PARTS.spireR.x, T3_PARTS.spireR.y, T3_PARTS.spireR.w, T3_PARTS.spireR.h);
  
  // Central tower
  ctx.fillStyle = T3_PARTS.centralTowerBase.color;
  ctx.fillRect(T3_PARTS.centralTowerBase.x, T3_PARTS.centralTowerBase.y, T3_PARTS.centralTowerBase.w, T3_PARTS.centralTowerBase.h);
  ctx.fillStyle = T3_PARTS.centralTower.color;
  ctx.fillRect(T3_PARTS.centralTower.x, T3_PARTS.centralTower.y, T3_PARTS.centralTower.w, T3_PARTS.centralTower.h);
  ctx.fillStyle = T3_PARTS.centralBellOpen.color;
  ctx.fillRect(T3_PARTS.centralBellOpen.x, T3_PARTS.centralBellOpen.y, T3_PARTS.centralBellOpen.w, T3_PARTS.centralBellOpen.h);
  
  // Central bell
  const bellCRot = (frame.bellC?.rot || 0) * Math.PI / 180;
  const bellCY = frame.bellC?.y || 0;
  ctx.save();
  ctx.translate(0, -122 + bellCY);
  ctx.rotate(bellCRot);
  ctx.fillStyle = T3_PARTS.bellCenter.color;
  ctx.fillRect(T3_PARTS.bellCenter.x, T3_PARTS.bellCenter.y + 122, T3_PARTS.bellCenter.w, T3_PARTS.bellCenter.h);
  ctx.restore();
  
  // Central spire
  ctx.fillStyle = T3_PARTS.centralSpire.color;
  ctx.fillRect(T3_PARTS.centralSpire.x, T3_PARTS.centralSpire.y, T3_PARTS.centralSpire.w, T3_PARTS.centralSpire.h);
  
  // Crosses
  ctx.fillStyle = "#D4AF37";
  ctx.fillRect(T3_PARTS.crossL.v.x, T3_PARTS.crossL.v.y, T3_PARTS.crossL.v.w, T3_PARTS.crossL.v.h);
  ctx.fillRect(T3_PARTS.crossL.h.x, T3_PARTS.crossL.h.y, T3_PARTS.crossL.h.w, T3_PARTS.crossL.h.h);
  ctx.fillRect(T3_PARTS.crossR.v.x, T3_PARTS.crossR.v.y, T3_PARTS.crossR.v.w, T3_PARTS.crossR.v.h);
  ctx.fillRect(T3_PARTS.crossR.h.x, T3_PARTS.crossR.h.y, T3_PARTS.crossR.h.w, T3_PARTS.crossR.h.h);
  ctx.fillRect(T3_PARTS.crossCenter.v.x, T3_PARTS.crossCenter.v.y, T3_PARTS.crossCenter.v.w, T3_PARTS.crossCenter.v.h);
  ctx.fillRect(T3_PARTS.crossCenter.h.x, T3_PARTS.crossCenter.h.y, T3_PARTS.crossCenter.h.w, T3_PARTS.crossCenter.h.h);

  ctx.restore();
}

// ─── Main Component ───
export default function ChurchTowerAnimations() {
  const t1IdleRef = useRef(null);
  const t1BlessRef = useRef(null);
  const t2IdleRef = useRef(null);
  const t2BlessRef = useRef(null);
  const t3IdleRef = useRef(null);
  const t3BlessRef = useRef(null);
  
  const [showGrid, setShowGrid] = useState(false);
  const [t1IdleSpeed, setT1IdleSpeed] = useState(2);
  const [t1BlessSpeed, setT1BlessSpeed] = useState(6);
  const [t2IdleSpeed, setT2IdleSpeed] = useState(2);
  const [t2BlessSpeed, setT2BlessSpeed] = useState(5);
  const [t3IdleSpeed, setT3IdleSpeed] = useState(2);
  const [t3BlessSpeed, setT3BlessSpeed] = useState(4);
  
  const [t1IdlePlaying, setT1IdlePlaying] = useState(true);
  const [t2IdlePlaying, setT2IdlePlaying] = useState(true);
  const [t3IdlePlaying, setT3IdlePlaying] = useState(true);
  
  const t1IdleAnimRef = useRef({ time: 0 });
  const t1BlessAnimRef = useRef({ time: 0, playing: false, lightBeams: [], particles: [] });
  const t2IdleAnimRef = useRef({ time: 0 });
  const t2BlessAnimRef = useRef({ time: 0, playing: false, lightBeams: [], particles: [] });
  const t3IdleAnimRef = useRef({ time: 0 });
  const t3BlessAnimRef = useRef({ time: 0, playing: false, lightBeams: [], particles: [] });

  // Generic animation loop with divine effects
  const useAnimLoop = (canvasRef, idleFrames, blessFrames, idleAnimRef, blessAnimRef, idleSpeed, blessSpeed, idlePlaying, drawFunc, scale, lightY) => {
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      let raf;
      let lastTime = performance.now();

      const loop = (now) => {
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        let frame;
        
        if (blessAnimRef.current.playing) {
          blessAnimRef.current.time += dt * blessSpeed;
          const totalFrames = blessFrames.length;
          const rawFrame = Math.min(blessAnimRef.current.time, totalFrames - 1.001);
          const frameIdx = Math.floor(rawFrame);
          const t = rawFrame - frameIdx;
          const nextIdx = Math.min(frameIdx + 1, totalFrames - 1);
          frame = lerpFrame(blessFrames[frameIdx], blessFrames[nextIdx], t);
          
          // Spawn light beams on high glow
          if (frame.glow > 0.7 && Math.random() < 0.15) {
            blessAnimRef.current.lightBeams.push(new LightBeam(canvas.width / 2 + (Math.random() - 0.5) * 60, lightY, frame.glow));
          }
          
          // Spawn particles
          if (frame.glow > 0.5 && Math.random() < 0.3) {
            blessAnimRef.current.particles.push(new AngelicParticle(
              canvas.width / 2 + (Math.random() - 0.5) * 40,
              lightY + (Math.random() - 0.5) * 30
            ));
          }
          
          if (frameIdx >= totalFrames - 1) {
            blessAnimRef.current.playing = false;
            blessAnimRef.current.time = 0;
          }
        } else {
          if (idlePlaying) {
            idleAnimRef.current.time += dt * idleSpeed;
          }
          const totalFrames = idleFrames.length;
          const rawFrame = idleAnimRef.current.time % totalFrames;
          const frameIdx = Math.floor(rawFrame);
          const t = rawFrame - frameIdx;
          const nextIdx = (frameIdx + 1) % totalFrames;
          frame = lerpFrame(idleFrames[frameIdx], idleFrames[nextIdx], t);
        }

        // Update effects
        blessAnimRef.current.lightBeams = blessAnimRef.current.lightBeams.filter(l => {
          l.update();
          return l.life > 0;
        });
        
        blessAnimRef.current.particles = blessAnimRef.current.particles.filter(p => {
          p.update();
          return p.life > 0;
        });

        ctx.clearRect(0, 0, canvas.width, canvas.height);
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

        // Draw light beams behind tower
        for (const l of blessAnimRef.current.lightBeams) {
          l.draw(ctx);
        }

        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 20);
        ctx.lineTo(canvas.width, canvas.height - 20);
        ctx.stroke();

        drawFunc(ctx, canvas.width / 2, canvas.height - 20, frame, scale);
        
        // Draw particles
        for (const p of blessAnimRef.current.particles) {
          p.draw(ctx);
        }

        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
    }, [idlePlaying, idleSpeed, blessSpeed, showGrid]);
  };

  useAnimLoop(t1IdleRef, T1_IDLE_FRAMES, T1_BLESS_FRAMES, t1IdleAnimRef, t1BlessAnimRef, t1IdleSpeed, t1BlessSpeed, t1IdlePlaying, drawT1Tower, 2.2, 80);
  useAnimLoop(t1BlessRef, T1_IDLE_FRAMES, T1_BLESS_FRAMES, { current: { time: 0 } }, t1BlessAnimRef, t1IdleSpeed, t1BlessSpeed, false, drawT1Tower, 2.2, 80);
  useAnimLoop(t2IdleRef, T2_IDLE_FRAMES, T2_BLESS_FRAMES, t2IdleAnimRef, t2BlessAnimRef, t2IdleSpeed, t2BlessSpeed, t2IdlePlaying, drawT2Tower, 1.7, 60);
  useAnimLoop(t2BlessRef, T2_IDLE_FRAMES, T2_BLESS_FRAMES, { current: { time: 0 } }, t2BlessAnimRef, t2IdleSpeed, t2BlessSpeed, false, drawT2Tower, 1.7, 60);
  useAnimLoop(t3IdleRef, T3_IDLE_FRAMES, T3_BLESS_FRAMES, t3IdleAnimRef, t3BlessAnimRef, t3IdleSpeed, t3BlessSpeed, t3IdlePlaying, drawT3Tower, 1.35, 40);
  useAnimLoop(t3BlessRef, T3_IDLE_FRAMES, T3_BLESS_FRAMES, { current: { time: 0 } }, t3BlessAnimRef, t3IdleSpeed, t3BlessSpeed, false, drawT3Tower, 1.35, 40);

  return (
    <div style={{ background: "#0a0e14", minHeight: "100vh", color: "#c8d0d8", fontFamily: "'JetBrains Mono', monospace", padding: "24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#e8b059", letterSpacing: "0.05em" }}>
            ⛪ CHURCH TOWER ANIMATION SYSTEM
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#5a6a7a", letterSpacing: "0.08em" }}>
            TDG — T1/T2/T3 GOTHIC ARCHITECTURE IDLE &amp; BLESSING SEQUENCES
          </p>
        </div>

        {/* Global Controls */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
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

        {/* T1 Tower */}
        <div style={{ marginBottom: 32, padding: 20, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 15, color: "#4a9eff", letterSpacing: "0.1em" }}>
            T1 CHAPEL — Simple Bell Tower
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#5a6a7a" }}>IDLE</p>
              <canvas ref={t1IdleRef} width={280} height={260}
                style={{ width: "100%", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <button onClick={() => setT1IdlePlaying(p => !p)}
                  style={{
                    padding: "4px 12px", background: t1IdlePlaying ? "#2a1a1a" : "#1a2a1a",
                    border: `1px solid ${t1IdlePlaying ? "#aa4444" : "#44aa44"}`,
                    color: t1IdlePlaying ? "#ff6666" : "#66ff66",
                    borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "inherit",
                  }}>
                  {t1IdlePlaying ? "⏸" : "▶"}
                </button>
                <input type="range" min={1} max={8} step={0.5} value={t1IdleSpeed}
                  onChange={e => setT1IdleSpeed(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#4a9eff" }}
                />
                <span style={{ fontSize: 10, color: "#5a6a7a", minWidth: 30 }}>{t1IdleSpeed}x</span>
              </div>
            </div>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#5a6a7a" }}>BLESSING (Bell Ring + Divine Light)</p>
              <canvas ref={t1BlessRef} width={280} height={260}
                style={{ width: "100%", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <button onClick={() => { 
                  t1BlessAnimRef.current.time = 0; 
                  t1BlessAnimRef.current.playing = true;
                  t1BlessAnimRef.current.lightBeams = [];
                  t1BlessAnimRef.current.particles = [];
                }}
                  style={{
                    padding: "4px 12px", background: "#1a1a2a",
                    border: "1px solid #6644aa", color: "#aa88ff",
                    borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "inherit",
                  }}>
                  ✝ BLESS
                </button>
                <input type="range" min={2} max={12} step={0.5} value={t1BlessSpeed}
                  onChange={e => setT1BlessSpeed(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#ffdd88" }}
                />
                <span style={{ fontSize: 10, color: "#5a6a7a", minWidth: 30 }}>{t1BlessSpeed}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* T2 Tower */}
        <div style={{ marginBottom: 32, padding: 20, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 15, color: "#4a9eff", letterSpacing: "0.1em" }}>
            T2 PARISH CHURCH — Twin Bell Towers
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#5a6a7a" }}>IDLE</p>
              <canvas ref={t2IdleRef} width={280} height={260}
                style={{ width: "100%", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <button onClick={() => setT2IdlePlaying(p => !p)}
                  style={{
                    padding: "4px 12px", background: t2IdlePlaying ? "#2a1a1a" : "#1a2a1a",
                    border: `1px solid ${t2IdlePlaying ? "#aa4444" : "#44aa44"}`,
                    color: t2IdlePlaying ? "#ff6666" : "#66ff66",
                    borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "inherit",
                  }}>
                  {t2IdlePlaying ? "⏸" : "▶"}
                </button>
                <input type="range" min={1} max={8} step={0.5} value={t2IdleSpeed}
                  onChange={e => setT2IdleSpeed(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#4a9eff" }}
                />
                <span style={{ fontSize: 10, color: "#5a6a7a", minWidth: 30 }}>{t2IdleSpeed}x</span>
              </div>
            </div>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#5a6a7a" }}>BLESSING (Twin Bell Symphony)</p>
              <canvas ref={t2BlessRef} width={280} height={260}
                style={{ width: "100%", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <button onClick={() => { 
                  t2BlessAnimRef.current.time = 0; 
                  t2BlessAnimRef.current.playing = true;
                  t2BlessAnimRef.current.lightBeams = [];
                  t2BlessAnimRef.current.particles = [];
                }}
                  style={{
                    padding: "4px 12px", background: "#1a1a2a",
                    border: "1px solid #6644aa", color: "#aa88ff",
                    borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "inherit",
                  }}>
                  ✝ BLESS
                </button>
                <input type="range" min={2} max={12} step={0.5} value={t2BlessSpeed}
                  onChange={e => setT2BlessSpeed(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#ffdd88" }}
                />
                <span style={{ fontSize: 10, color: "#5a6a7a", minWidth: 30 }}>{t2BlessSpeed}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* T3 Tower */}
        <div style={{ marginBottom: 32, padding: 20, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 15, color: "#4a9eff", letterSpacing: "0.1em" }}>
            T3 GRAND CATHEDRAL — Central Spire & Twin Towers
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#5a6a7a" }}>IDLE</p>
              <canvas ref={t3IdleRef} width={280} height={260}
                style={{ width: "100%", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <button onClick={() => setT3IdlePlaying(p => !p)}
                  style={{
                    padding: "4px 12px", background: t3IdlePlaying ? "#2a1a1a" : "#1a2a1a",
                    border: `1px solid ${t3IdlePlaying ? "#aa4444" : "#44aa44"}`,
                    color: t3IdlePlaying ? "#ff6666" : "#66ff66",
                    borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "inherit",
                  }}>
                  {t3IdlePlaying ? "⏸" : "▶"}
                </button>
                <input type="range" min={1} max={8} step={0.5} value={t3IdleSpeed}
                  onChange={e => setT3IdleSpeed(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#4a9eff" }}
                />
                <span style={{ fontSize: 10, color: "#5a6a7a", minWidth: 30 }}>{t3IdleSpeed}x</span>
              </div>
            </div>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#5a6a7a" }}>BLESSING (Cathedral Choir)</p>
              <canvas ref={t3BlessRef} width={280} height={260}
                style={{ width: "100%", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <button onClick={() => { 
                  t3BlessAnimRef.current.time = 0; 
                  t3BlessAnimRef.current.playing = true;
                  t3BlessAnimRef.current.lightBeams = [];
                  t3BlessAnimRef.current.particles = [];
                }}
                  style={{
                    padding: "4px 12px", background: "#1a1a2a",
                    border: "1px solid #6644aa", color: "#aa88ff",
                    borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "inherit",
                  }}>
                  ✝ BLESS
                </button>
                <input type="range" min={2} max={12} step={0.5} value={t3BlessSpeed}
                  onChange={e => setT3BlessSpeed(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#ffdd88" }}
                />
                <span style={{ fontSize: 10, color: "#5a6a7a", minWidth: 30 }}>{t3BlessSpeed}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Notes */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: 16 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 12, color: "#e8b059", letterSpacing: "0.1em" }}>
            📋 INTEGRATION NOTES
          </h3>
          <div style={{ fontSize: 11, lineHeight: 1.7, color: "#5a7a8a" }}>
            <p style={{ margin: "0 0 8px" }}>
              <strong style={{ color: "#7a9aaa" }}>T1 Chapel:</strong> 4 idle frames, 9 blessing frames. Single bell with ±25° swing. Stained glass windows (blue/red). Golden cross.
            </p>
            <p style={{ margin: "0 0 8px" }}>
              <strong style={{ color: "#7a9aaa" }}>T2 Parish:</strong> 4 idle frames, 9 blessing frames. Twin towers with alternating bells (±30° swing). Rose window with center detail. Dual crosses.
            </p>
            <p style={{ margin: "0 0 8px" }}>
              <strong style={{ color: "#7a9aaa" }}>T3 Cathedral:</strong> 4 idle frames, 11 blessing frames. Triple bells (L/R towers + central spire, ±35° swing). Large rose window (3 layers). Lancet windows (6 total).
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#7a9aaa" }}>Divine Effects:</strong> Light beams spawn during blessing (radial gradient from top). Angelic particles rise upward. Glow aura intensifies with bell swing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
