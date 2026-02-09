import { useState, useEffect, useRef, useCallback } from "react";

// ─── Tower Part Definitions (simplified from OBJ models) ───
// T1: Simple Shinto Shrine with single archer
const T1_PARTS = {
  base: { x: -30, y: -10, w: 60, h: 10, color: "#8B4513" },
  platform: { x: -35, y: -20, w: 70, h: 10, color: "#654321" },
  pillarL: { x: -32, y: -70, w: 8, h: 50, color: "#8B0000" },
  pillarR: { x: 24, y: -70, w: 8, h: 50, color: "#8B0000" },
  roof: { x: -40, y: -100, w: 80, h: 30, color: "#4a4a4a" },
  roofTrim: { x: -42, y: -72, w: 84, h: 4, color: "#D4AF37" },
  archer: { x: -8, y: -60, w: 16, h: 30, color: "#2a2a2a" },
  bow: { x: 10, y: -55, w: 3, h: 20, color: "#654321" },
  arrow: { x: 12, y: -48, w: 15, h: 2, color: "#8B7355" },
};

// T2: Pagoda Tower with dual archers
const T2_PARTS = {
  base: { x: -35, y: -10, w: 70, h: 10, color: "#8B4513" },
  tier1Platform: { x: -40, y: -25, w: 80, h: 15, color: "#654321" },
  tier1Wall: { x: -35, y: -50, w: 70, h: 25, color: "#8B0000" },
  tier1Roof: { x: -42, y: -70, w: 84, h: 20, color: "#4a4a4a" },
  tier2Platform: { x: -30, y: -75, w: 60, h: 8, color: "#654321" },
  tier2Wall: { x: -25, y: -95, w: 50, h: 20, color: "#8B0000" },
  tier2Roof: { x: -35, y: -115, w: 70, h: 20, color: "#3a3a3a" },
  archerL: { x: -20, y: -65, w: 12, h: 25, color: "#2a2a2a" },
  archerR: { x: 8, y: -65, w: 12, h: 25, color: "#2a2a2a" },
  bowL: { x: -22, y: -58, w: 3, h: 15, color: "#654321" },
  bowR: { x: 19, y: -58, w: 3, h: 15, color: "#654321" },
  arrowL: { x: -24, y: -53, w: 12, h: 2, color: "#8B7355" },
  arrowR: { x: 22, y: -53, w: 12, h: 2, color: "#8B7355" },
};

// T3: Grand Temple with triple archers
const T3_PARTS = {
  base: { x: -40, y: -10, w: 80, h: 10, color: "#8B4513" },
  tier1Platform: { x: -45, y: -28, w: 90, h: 18, color: "#654321" },
  tier1Wall: { x: -40, y: -58, w: 80, h: 30, color: "#8B0000" },
  tier1Roof: { x: -48, y: -82, w: 96, h: 24, color: "#4a4a4a" },
  tier2Platform: { x: -35, y: -88, w: 70, h: 10, color: "#654321" },
  tier2Wall: { x: -30, y: -110, w: 60, h: 22, color: "#8B0000" },
  tier2Roof: { x: -38, y: -132, w: 76, h: 22, color: "#3a3a3a" },
  tier3Platform: { x: -25, y: -138, w: 50, h: 8, color: "#654321" },
  tier3Wall: { x: -20, y: -155, w: 40, h: 17, color: "#8B0000" },
  tier3Roof: { x: -28, y: -172, w: 56, h: 17, color: "#2a2a2a" },
  spire: { x: -3, y: -185, w: 6, h: 13, color: "#D4AF37" },
  archerL: { x: -28, y: -75, w: 10, h: 22, color: "#2a2a2a" },
  archerC: { x: -5, y: -75, w: 10, h: 22, color: "#2a2a2a" },
  archerR: { x: 18, y: -75, w: 10, h: 22, color: "#2a2a2a" },
  bowL: { x: -30, y: -69, w: 2, h: 12, color: "#654321" },
  bowC: { x: -7, y: -69, w: 2, h: 12, color: "#654321" },
  bowR: { x: 16, y: -69, w: 2, h: 12, color: "#654321" },
  arrowL: { x: -32, y: -65, w: 10, h: 2, color: "#8B7355" },
  arrowC: { x: -9, y: -65, w: 10, h: 2, color: "#8B7355" },
  arrowR: { x: 14, y: -65, w: 10, h: 2, color: "#8B7355" },
};

// ─── Animation Keyframe Definitions ───

// T1 IDLE: Gentle sway
const T1_IDLE_FRAMES = [
  { archer: { rot: 0, x: 0 }, bow: { rot: 0, x: 0 }, arrow: { visible: false } },
  { archer: { rot: 2, x: 1 }, bow: { rot: 2, x: 1 }, arrow: { visible: false } },
  { archer: { rot: 0, x: 0 }, bow: { rot: 0, x: 0 }, arrow: { visible: false } },
  { archer: { rot: -2, x: -1 }, bow: { rot: -2, x: -1 }, arrow: { visible: false } },
];

// T1 FIRE: Draw -> Aim -> Release
const T1_FIRE_FRAMES = [
  // Draw back
  { archer: { rot: 0, x: 0 }, bow: { rot: -5, x: 0 }, arrow: { visible: true, x: 0, charge: 0 } },
  { archer: { rot: -3, x: -2 }, bow: { rot: -8, x: -2 }, arrow: { visible: true, x: -3, charge: 0.3 } },
  { archer: { rot: -5, x: -4 }, bow: { rot: -12, x: -4 }, arrow: { visible: true, x: -6, charge: 0.6 } },
  { archer: { rot: -6, x: -5 }, bow: { rot: -15, x: -5 }, arrow: { visible: true, x: -8, charge: 1 } },
  // Hold
  { archer: { rot: -6, x: -5 }, bow: { rot: -15, x: -5 }, arrow: { visible: true, x: -8, charge: 1 } },
  // Release
  { archer: { rot: 2, x: 2 }, bow: { rot: 5, x: 2 }, arrow: { visible: false, x: 0, charge: 0 } },
  { archer: { rot: 1, x: 1 }, bow: { rot: 2, x: 1 }, arrow: { visible: false, x: 0, charge: 0 } },
  { archer: { rot: 0, x: 0 }, bow: { rot: 0, x: 0 }, arrow: { visible: false, x: 0, charge: 0 } },
];

// T2 IDLE: Dual archer coordination
const T2_IDLE_FRAMES = [
  { archerL: { rot: 0 }, archerR: { rot: 0 }, bowL: { rot: 0 }, bowR: { rot: 0 }, arrowL: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: 2 }, archerR: { rot: -2 }, bowL: { rot: 2 }, bowR: { rot: -2 }, arrowL: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: 0 }, archerR: { rot: 0 }, bowL: { rot: 0 }, bowR: { rot: 0 }, arrowL: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: -2 }, archerR: { rot: 2 }, bowL: { rot: -2 }, bowR: { rot: 2 }, arrowL: { visible: false }, arrowR: { visible: false } },
];

// T2 FIRE: Alternating fire pattern
const T2_FIRE_FRAMES = [
  // Left draws
  { archerL: { rot: -4, x: -3 }, archerR: { rot: 0, x: 0 }, bowL: { rot: -10, x: -3 }, bowR: { rot: 0, x: 0 }, arrowL: { visible: true, x: -5, charge: 0.5 }, arrowR: { visible: false } },
  { archerL: { rot: -6, x: -4 }, archerR: { rot: 0, x: 0 }, bowL: { rot: -15, x: -4 }, bowR: { rot: 0, x: 0 }, arrowL: { visible: true, x: -7, charge: 1 }, arrowR: { visible: false } },
  // Left fires
  { archerL: { rot: 2, x: 2 }, archerR: { rot: 0, x: 0 }, bowL: { rot: 5, x: 2 }, bowR: { rot: 0, x: 0 }, arrowL: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: 0, x: 0 }, archerR: { rot: 0, x: 0 }, bowL: { rot: 0, x: 0 }, bowR: { rot: 0, x: 0 }, arrowL: { visible: false }, arrowR: { visible: false } },
  // Right draws
  { archerL: { rot: 0, x: 0 }, archerR: { rot: -4, x: -3 }, bowL: { rot: 0, x: 0 }, bowR: { rot: -10, x: -3 }, arrowL: { visible: false }, arrowR: { visible: true, x: -5, charge: 0.5 } },
  { archerL: { rot: 0, x: 0 }, archerR: { rot: -6, x: -4 }, bowL: { rot: 0, x: 0 }, bowR: { rot: -15, x: -4 }, arrowL: { visible: false }, arrowR: { visible: true, x: -7, charge: 1 } },
  // Right fires
  { archerL: { rot: 0, x: 0 }, archerR: { rot: 2, x: 2 }, bowL: { rot: 0, x: 0 }, bowR: { rot: 5, x: 2 }, arrowL: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: 0, x: 0 }, archerR: { rot: 0, x: 0 }, bowL: { rot: 0, x: 0 }, bowR: { rot: 0, x: 0 }, arrowL: { visible: false }, arrowR: { visible: false } },
];

// T3 IDLE: Triple archer wave pattern
const T3_IDLE_FRAMES = [
  { archerL: { rot: 0 }, archerC: { rot: 0 }, archerR: { rot: 0 }, arrowL: { visible: false }, arrowC: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: 2 }, archerC: { rot: 0 }, archerR: { rot: -2 }, arrowL: { visible: false }, arrowC: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: 0 }, archerC: { rot: 2 }, archerR: { rot: 0 }, arrowL: { visible: false }, arrowC: { visible: false }, arrowR: { visible: false } },
  { archerL: { rot: -2 }, archerC: { rot: 0 }, archerR: { rot: 2 }, arrowL: { visible: false }, arrowC: { visible: false }, arrowR: { visible: false } },
];

// T3 FIRE: Rapid succession volley
const T3_FIRE_FRAMES = [
  // All draw
  { archerL: { rot: -3, x: -2 }, archerC: { rot: -3, x: -2 }, archerR: { rot: -3, x: -2 }, arrowL: { visible: true, x: -4, charge: 0.5 }, arrowC: { visible: true, x: -4, charge: 0.5 }, arrowR: { visible: true, x: -4, charge: 0.5 } },
  { archerL: { rot: -5, x: -4 }, archerC: { rot: -5, x: -4 }, archerR: { rot: -5, x: -4 }, arrowL: { visible: true, x: -6, charge: 1 }, arrowC: { visible: true, x: -6, charge: 1 }, arrowR: { visible: true, x: -6, charge: 1 } },
  // Left fires
  { archerL: { rot: 2, x: 2 }, archerC: { rot: -5, x: -4 }, archerR: { rot: -5, x: -4 }, arrowL: { visible: false }, arrowC: { visible: true, x: -6, charge: 1 }, arrowR: { visible: true, x: -6, charge: 1 } },
  // Center fires
  { archerL: { rot: 0, x: 0 }, archerC: { rot: 2, x: 2 }, archerR: { rot: -5, x: -4 }, arrowL: { visible: false }, arrowC: { visible: false }, arrowR: { visible: true, x: -6, charge: 1 } },
  // Right fires
  { archerL: { rot: 0, x: 0 }, archerC: { rot: 0, x: 0 }, archerR: { rot: 2, x: 2 }, arrowL: { visible: false }, arrowC: { visible: false }, arrowR: { visible: false } },
  // Reset
  { archerL: { rot: 0, x: 0 }, archerC: { rot: 0, x: 0 }, archerR: { rot: 0, x: 0 }, arrowL: { visible: false }, arrowC: { visible: false }, arrowR: { visible: false } },
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
        if (prop === "visible") {
          result[key][prop] = t < 0.5 ? frameA[key][prop] : frameB[key]?.[prop];
        } else {
          result[key][prop] = lerp(frameA[key][prop] || 0, frameB[key]?.[prop] || 0, t);
        }
      }
    } else {
      result[key] = frameA[key];
    }
  }
  return result;
}

// ─── Tower Renderers ───
function drawT1Tower(ctx, cx, cy, frame, scale = 2) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Base
  ctx.fillStyle = T1_PARTS.base.color;
  ctx.fillRect(T1_PARTS.base.x, T1_PARTS.base.y, T1_PARTS.base.w, T1_PARTS.base.h);
  
  // Platform
  ctx.fillStyle = T1_PARTS.platform.color;
  ctx.fillRect(T1_PARTS.platform.x, T1_PARTS.platform.y, T1_PARTS.platform.w, T1_PARTS.platform.h);
  
  // Pillars
  ctx.fillStyle = T1_PARTS.pillarL.color;
  ctx.fillRect(T1_PARTS.pillarL.x, T1_PARTS.pillarL.y, T1_PARTS.pillarL.w, T1_PARTS.pillarL.h);
  ctx.fillRect(T1_PARTS.pillarR.x, T1_PARTS.pillarR.y, T1_PARTS.pillarR.w, T1_PARTS.pillarR.h);
  
  // Roof
  ctx.fillStyle = T1_PARTS.roof.color;
  ctx.fillRect(T1_PARTS.roof.x, T1_PARTS.roof.y, T1_PARTS.roof.w, T1_PARTS.roof.h);
  ctx.fillStyle = T1_PARTS.roofTrim.color;
  ctx.fillRect(T1_PARTS.roofTrim.x, T1_PARTS.roofTrim.y, T1_PARTS.roofTrim.w, T1_PARTS.roofTrim.h);
  
  // Archer (with animation)
  const archerRot = (frame.archer?.rot || 0) * Math.PI / 180;
  const archerX = frame.archer?.x || 0;
  ctx.save();
  ctx.translate(archerX, -45);
  ctx.rotate(archerRot);
  ctx.fillStyle = T1_PARTS.archer.color;
  ctx.fillRect(T1_PARTS.archer.x, T1_PARTS.archer.y + 45, T1_PARTS.archer.w, T1_PARTS.archer.h);
  ctx.restore();
  
  // Bow
  const bowRot = (frame.bow?.rot || 0) * Math.PI / 180;
  const bowX = frame.bow?.x || 0;
  ctx.save();
  ctx.translate(bowX + 11, -45);
  ctx.rotate(bowRot);
  ctx.fillStyle = T1_PARTS.bow.color;
  ctx.fillRect(T1_PARTS.bow.x - 11, T1_PARTS.bow.y + 45, T1_PARTS.bow.w, T1_PARTS.bow.h);
  ctx.restore();
  
  // Arrow (if visible)
  if (frame.arrow?.visible) {
    const arrowX = frame.arrow?.x || 0;
    const charge = frame.arrow?.charge || 0;
    ctx.fillStyle = T1_PARTS.arrow.color;
    ctx.globalAlpha = charge;
    ctx.fillRect(T1_PARTS.arrow.x + arrowX, T1_PARTS.arrow.y, T1_PARTS.arrow.w, T1_PARTS.arrow.h);
    ctx.globalAlpha = 1;
    // Arrow tip
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(T1_PARTS.arrow.x + arrowX + T1_PARTS.arrow.w, T1_PARTS.arrow.y, 3, 2);
  }

  ctx.restore();
}

function drawT2Tower(ctx, cx, cy, frame, scale = 1.6) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Base
  ctx.fillStyle = T2_PARTS.base.color;
  ctx.fillRect(T2_PARTS.base.x, T2_PARTS.base.y, T2_PARTS.base.w, T2_PARTS.base.h);
  
  // Tier 1
  ctx.fillStyle = T2_PARTS.tier1Platform.color;
  ctx.fillRect(T2_PARTS.tier1Platform.x, T2_PARTS.tier1Platform.y, T2_PARTS.tier1Platform.w, T2_PARTS.tier1Platform.h);
  ctx.fillStyle = T2_PARTS.tier1Wall.color;
  ctx.fillRect(T2_PARTS.tier1Wall.x, T2_PARTS.tier1Wall.y, T2_PARTS.tier1Wall.w, T2_PARTS.tier1Wall.h);
  ctx.fillStyle = T2_PARTS.tier1Roof.color;
  ctx.fillRect(T2_PARTS.tier1Roof.x, T2_PARTS.tier1Roof.y, T2_PARTS.tier1Roof.w, T2_PARTS.tier1Roof.h);
  
  // Tier 2
  ctx.fillStyle = T2_PARTS.tier2Platform.color;
  ctx.fillRect(T2_PARTS.tier2Platform.x, T2_PARTS.tier2Platform.y, T2_PARTS.tier2Platform.w, T2_PARTS.tier2Platform.h);
  ctx.fillStyle = T2_PARTS.tier2Wall.color;
  ctx.fillRect(T2_PARTS.tier2Wall.x, T2_PARTS.tier2Wall.y, T2_PARTS.tier2Wall.w, T2_PARTS.tier2Wall.h);
  ctx.fillStyle = T2_PARTS.tier2Roof.color;
  ctx.fillRect(T2_PARTS.tier2Roof.x, T2_PARTS.tier2Roof.y, T2_PARTS.tier2Roof.w, T2_PARTS.tier2Roof.h);
  
  // Archers
  const drawArcher = (parts, frameData, pivotY) => {
    const rot = (frameData?.rot || 0) * Math.PI / 180;
    const x = frameData?.x || 0;
    ctx.save();
    ctx.translate(x, pivotY);
    ctx.rotate(rot);
    ctx.fillStyle = parts.color;
    ctx.fillRect(parts.x - x, parts.y - pivotY, parts.w, parts.h);
    ctx.restore();
  };
  
  drawArcher(T2_PARTS.archerL, frame.archerL, -52);
  drawArcher(T2_PARTS.archerR, frame.archerR, -52);
  
  // Bows
  const drawBow = (parts, frameData, pivotX, pivotY) => {
    const rot = (frameData?.rot || 0) * Math.PI / 180;
    const x = frameData?.x || 0;
    ctx.save();
    ctx.translate(pivotX + x, pivotY);
    ctx.rotate(rot);
    ctx.fillStyle = parts.color;
    ctx.fillRect(parts.x - pivotX, parts.y - pivotY, parts.w, parts.h);
    ctx.restore();
  };
  
  drawBow(T2_PARTS.bowL, frame.bowL, -21, -50);
  drawBow(T2_PARTS.bowR, frame.bowR, 20, -50);
  
  // Arrows
  if (frame.arrowL?.visible) {
    const x = frame.arrowL?.x || 0;
    const charge = frame.arrowL?.charge || 0;
    ctx.globalAlpha = charge;
    ctx.fillStyle = T2_PARTS.arrowL.color;
    ctx.fillRect(T2_PARTS.arrowL.x + x, T2_PARTS.arrowL.y, T2_PARTS.arrowL.w, T2_PARTS.arrowL.h);
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(T2_PARTS.arrowL.x + x + T2_PARTS.arrowL.w, T2_PARTS.arrowL.y, 2, 2);
    ctx.globalAlpha = 1;
  }
  
  if (frame.arrowR?.visible) {
    const x = frame.arrowR?.x || 0;
    const charge = frame.arrowR?.charge || 0;
    ctx.globalAlpha = charge;
    ctx.fillStyle = T2_PARTS.arrowR.color;
    ctx.fillRect(T2_PARTS.arrowR.x + x, T2_PARTS.arrowR.y, T2_PARTS.arrowR.w, T2_PARTS.arrowR.h);
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(T2_PARTS.arrowR.x + x + T2_PARTS.arrowR.w, T2_PARTS.arrowR.y, 2, 2);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawT3Tower(ctx, cx, cy, frame, scale = 1.3) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Base
  ctx.fillStyle = T3_PARTS.base.color;
  ctx.fillRect(T3_PARTS.base.x, T3_PARTS.base.y, T3_PARTS.base.w, T3_PARTS.base.h);
  
  // Tier 1
  ctx.fillStyle = T3_PARTS.tier1Platform.color;
  ctx.fillRect(T3_PARTS.tier1Platform.x, T3_PARTS.tier1Platform.y, T3_PARTS.tier1Platform.w, T3_PARTS.tier1Platform.h);
  ctx.fillStyle = T3_PARTS.tier1Wall.color;
  ctx.fillRect(T3_PARTS.tier1Wall.x, T3_PARTS.tier1Wall.y, T3_PARTS.tier1Wall.w, T3_PARTS.tier1Wall.h);
  ctx.fillStyle = T3_PARTS.tier1Roof.color;
  ctx.fillRect(T3_PARTS.tier1Roof.x, T3_PARTS.tier1Roof.y, T3_PARTS.tier1Roof.w, T3_PARTS.tier1Roof.h);
  
  // Tier 2
  ctx.fillStyle = T3_PARTS.tier2Platform.color;
  ctx.fillRect(T3_PARTS.tier2Platform.x, T3_PARTS.tier2Platform.y, T3_PARTS.tier2Platform.w, T3_PARTS.tier2Platform.h);
  ctx.fillStyle = T3_PARTS.tier2Wall.color;
  ctx.fillRect(T3_PARTS.tier2Wall.x, T3_PARTS.tier2Wall.y, T3_PARTS.tier2Wall.w, T3_PARTS.tier2Wall.h);
  ctx.fillStyle = T3_PARTS.tier2Roof.color;
  ctx.fillRect(T3_PARTS.tier2Roof.x, T3_PARTS.tier2Roof.y, T3_PARTS.tier2Roof.w, T3_PARTS.tier2Roof.h);
  
  // Tier 3
  ctx.fillStyle = T3_PARTS.tier3Platform.color;
  ctx.fillRect(T3_PARTS.tier3Platform.x, T3_PARTS.tier3Platform.y, T3_PARTS.tier3Platform.w, T3_PARTS.tier3Platform.h);
  ctx.fillStyle = T3_PARTS.tier3Wall.color;
  ctx.fillRect(T3_PARTS.tier3Wall.x, T3_PARTS.tier3Wall.y, T3_PARTS.tier3Wall.w, T3_PARTS.tier3Wall.h);
  ctx.fillStyle = T3_PARTS.tier3Roof.color;
  ctx.fillRect(T3_PARTS.tier3Roof.x, T3_PARTS.tier3Roof.y, T3_PARTS.tier3Roof.w, T3_PARTS.tier3Roof.h);
  ctx.fillStyle = T3_PARTS.spire.color;
  ctx.fillRect(T3_PARTS.spire.x, T3_PARTS.spire.y, T3_PARTS.spire.w, T3_PARTS.spire.h);
  
  // Archers
  const drawArcher = (parts, frameData, pivotY) => {
    const rot = (frameData?.rot || 0) * Math.PI / 180;
    const x = frameData?.x || 0;
    ctx.save();
    ctx.translate(x, pivotY);
    ctx.rotate(rot);
    ctx.fillStyle = parts.color;
    ctx.fillRect(parts.x - x, parts.y - pivotY, parts.w, parts.h);
    ctx.restore();
  };
  
  drawArcher(T3_PARTS.archerL, frame.archerL, -64);
  drawArcher(T3_PARTS.archerC, frame.archerC, -64);
  drawArcher(T3_PARTS.archerR, frame.archerR, -64);
  
  // Arrows
  const drawArrow = (parts, frameData) => {
    if (!frameData?.visible) return;
    const x = frameData?.x || 0;
    const charge = frameData?.charge || 0;
    ctx.globalAlpha = charge;
    ctx.fillStyle = parts.color;
    ctx.fillRect(parts.x + x, parts.y, parts.w, parts.h);
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(parts.x + x + parts.w, parts.y, 2, 2);
    ctx.globalAlpha = 1;
  };
  
  drawArrow(T3_PARTS.arrowL, frame.arrowL);
  drawArrow(T3_PARTS.arrowC, frame.arrowC);
  drawArrow(T3_PARTS.arrowR, frame.arrowR);

  ctx.restore();
}

// ─── Main Component ───
export default function SniperTowerAnimations() {
  const t1IdleRef = useRef(null);
  const t1FireRef = useRef(null);
  const t2IdleRef = useRef(null);
  const t2FireRef = useRef(null);
  const t3IdleRef = useRef(null);
  const t3FireRef = useRef(null);
  
  const [showGrid, setShowGrid] = useState(false);
  const [t1IdleSpeed, setT1IdleSpeed] = useState(2);
  const [t1FireSpeed, setT1FireSpeed] = useState(6);
  const [t2IdleSpeed, setT2IdleSpeed] = useState(2);
  const [t2FireSpeed, setT2FireSpeed] = useState(5);
  const [t3IdleSpeed, setT3IdleSpeed] = useState(2);
  const [t3FireSpeed, setT3FireSpeed] = useState(7);
  
  const [t1IdlePlaying, setT1IdlePlaying] = useState(true);
  const [t2IdlePlaying, setT2IdlePlaying] = useState(true);
  const [t3IdlePlaying, setT3IdlePlaying] = useState(true);
  
  const t1IdleAnimRef = useRef({ time: 0 });
  const t1FireAnimRef = useRef({ time: 0, playing: false });
  const t2IdleAnimRef = useRef({ time: 0 });
  const t2FireAnimRef = useRef({ time: 0, playing: false });
  const t3IdleAnimRef = useRef({ time: 0 });
  const t3FireAnimRef = useRef({ time: 0, playing: false });

  // Generic animation loop
  const useAnimLoop = (canvasRef, idleFrames, fireFrames, idleAnimRef, fireAnimRef, idleSpeed, fireSpeed, idlePlaying, drawFunc, scale) => {
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
        
        if (fireAnimRef.current.playing) {
          fireAnimRef.current.time += dt * fireSpeed;
          const totalFrames = fireFrames.length;
          const rawFrame = Math.min(fireAnimRef.current.time, totalFrames - 1.001);
          const frameIdx = Math.floor(rawFrame);
          const t = rawFrame - frameIdx;
          const nextIdx = Math.min(frameIdx + 1, totalFrames - 1);
          frame = lerpFrame(fireFrames[frameIdx], fireFrames[nextIdx], t);
          
          if (frameIdx >= totalFrames - 1) {
            fireAnimRef.current.playing = false;
            fireAnimRef.current.time = 0;
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

        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 20);
        ctx.lineTo(canvas.width, canvas.height - 20);
        ctx.stroke();

        drawFunc(ctx, canvas.width / 2, canvas.height - 20, frame, scale);

        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
    }, [idlePlaying, idleSpeed, fireSpeed, showGrid]);
  };

  useAnimLoop(t1IdleRef, T1_IDLE_FRAMES, T1_FIRE_FRAMES, t1IdleAnimRef, t1FireAnimRef, t1IdleSpeed, t1FireSpeed, t1IdlePlaying, drawT1Tower, 2);
  useAnimLoop(t1FireRef, T1_IDLE_FRAMES, T1_FIRE_FRAMES, { current: { time: 0 } }, t1FireAnimRef, t1IdleSpeed, t1FireSpeed, false, drawT1Tower, 2);
  useAnimLoop(t2IdleRef, T2_IDLE_FRAMES, T2_FIRE_FRAMES, t2IdleAnimRef, t2FireAnimRef, t2IdleSpeed, t2FireSpeed, t2IdlePlaying, drawT2Tower, 1.6);
  useAnimLoop(t2FireRef, T2_IDLE_FRAMES, T2_FIRE_FRAMES, { current: { time: 0 } }, t2FireAnimRef, t2IdleSpeed, t2FireSpeed, false, drawT2Tower, 1.6);
  useAnimLoop(t3IdleRef, T3_IDLE_FRAMES, T3_FIRE_FRAMES, t3IdleAnimRef, t3FireAnimRef, t3IdleSpeed, t3FireSpeed, t3IdlePlaying, drawT3Tower, 1.3);
  useAnimLoop(t3FireRef, T3_IDLE_FRAMES, T3_FIRE_FRAMES, { current: { time: 0 } }, t3FireAnimRef, t3IdleSpeed, t3FireSpeed, false, drawT3Tower, 1.3);

  return (
    <div style={{ background: "#0a0e14", minHeight: "100vh", color: "#c8d0d8", fontFamily: "'JetBrains Mono', monospace", padding: "24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#e8b059", letterSpacing: "0.05em" }}>
            🏯 SNIPER TOWER ANIMATION SYSTEM
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#5a6a7a", letterSpacing: "0.08em" }}>
            TDG — T1/T2/T3 IDLE &amp; FIRING SEQUENCES
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
            T1 SHRINE TOWER — Single Archer
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#5a6a7a" }}>IDLE</p>
              <canvas ref={t1IdleRef} width={280} height={240}
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
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#5a6a7a" }}>FIRE</p>
              <canvas ref={t1FireRef} width={280} height={240}
                style={{ width: "100%", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <button onClick={() => { t1FireAnimRef.current.time = 0; t1FireAnimRef.current.playing = true; }}
                  style={{
                    padding: "4px 12px", background: "#1a1a2a",
                    border: "1px solid #6644aa", color: "#aa88ff",
                    borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "inherit",
                  }}>
                  ▶ FIRE
                </button>
                <input type="range" min={2} max={12} step={0.5} value={t1FireSpeed}
                  onChange={e => setT1FireSpeed(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#ff4a4a" }}
                />
                <span style={{ fontSize: 10, color: "#5a6a7a", minWidth: 30 }}>{t1FireSpeed}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* T2 Tower */}
        <div style={{ marginBottom: 32, padding: 20, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 15, color: "#4a9eff", letterSpacing: "0.1em" }}>
            T2 PAGODA TOWER — Dual Archers
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#5a6a7a" }}>IDLE</p>
              <canvas ref={t2IdleRef} width={280} height={240}
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
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#5a6a7a" }}>FIRE (Alternating)</p>
              <canvas ref={t2FireRef} width={280} height={240}
                style={{ width: "100%", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <button onClick={() => { t2FireAnimRef.current.time = 0; t2FireAnimRef.current.playing = true; }}
                  style={{
                    padding: "4px 12px", background: "#1a1a2a",
                    border: "1px solid #6644aa", color: "#aa88ff",
                    borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "inherit",
                  }}>
                  ▶ FIRE
                </button>
                <input type="range" min={2} max={12} step={0.5} value={t2FireSpeed}
                  onChange={e => setT2FireSpeed(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#ff4a4a" }}
                />
                <span style={{ fontSize: 10, color: "#5a6a7a", minWidth: 30 }}>{t2FireSpeed}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* T3 Tower */}
        <div style={{ marginBottom: 32, padding: 20, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 15, color: "#4a9eff", letterSpacing: "0.1em" }}>
            T3 GRAND TEMPLE — Triple Archers
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#5a6a7a" }}>IDLE</p>
              <canvas ref={t3IdleRef} width={280} height={240}
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
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "#5a6a7a" }}>FIRE (Volley)</p>
              <canvas ref={t3FireRef} width={280} height={240}
                style={{ width: "100%", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <button onClick={() => { t3FireAnimRef.current.time = 0; t3FireAnimRef.current.playing = true; }}
                  style={{
                    padding: "4px 12px", background: "#1a1a2a",
                    border: "1px solid #6644aa", color: "#aa88ff",
                    borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "inherit",
                  }}>
                  ▶ FIRE
                </button>
                <input type="range" min={2} max={12} step={0.5} value={t3FireSpeed}
                  onChange={e => setT3FireSpeed(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#ff4a4a" }}
                />
                <span style={{ fontSize: 10, color: "#5a6a7a", minWidth: 30 }}>{t3FireSpeed}x</span>
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
              <strong style={{ color: "#7a9aaa" }}>T1:</strong> 4 idle frames (gentle sway), 8 fire frames (draw → hold → release). Single archer.
            </p>
            <p style={{ margin: "0 0 8px" }}>
              <strong style={{ color: "#7a9aaa" }}>T2:</strong> 4 idle frames (coordinated sway), 8 fire frames (alternating left/right). Dual archers for faster attack rate.
            </p>
            <p style={{ margin: "0 0 8px" }}>
              <strong style={{ color: "#7a9aaa" }}>T3:</strong> 4 idle frames (wave pattern), 6 fire frames (rapid volley L→C→R). Triple archers for maximum DPS.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#7a9aaa" }}>Arrow Mechanics:</strong> Charge value (0-1) controls opacity fade-in. Arrows spawn during draw, disappear on release. Arrow tip rendered separately for detail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
