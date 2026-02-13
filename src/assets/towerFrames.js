// src/assets/towerFrames.js
// DEPRECATED: Replaced by skeletal animation system
// This file exists only for backwards compatibility to prevent import errors

console.warn('[DEPRECATED] towerFrames.js is obsolete - skeletal animation system is now active');

export const towerFrames = {
  basic: {
    idle: { start: 0, count: 4 },
    fire: { start: 4, count: 8 },
    upgrade: { start: 12, count: 4 }
  },
  sniper: {
    idle: { start: 16, count: 4 },
    fire: { start: 20, count: 8 },
    upgrade: { start: 28, count: 4 }
  },
  rapid: {
    idle: { start: 32, count: 4 },
    fire: { start: 36, count: 8 },
    upgrade: { start: 44, count: 4 }
  }
};
