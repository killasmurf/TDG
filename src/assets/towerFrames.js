// src/assets/towerFrames.js
// Placeholder data for animation keyframes
// For each tower type and state you should provide the starting frame index and number of frames
// (e.g., idle: 0–3, fire: 4–9, upgrade: 10–13). The actual numbers match the sprite sheet.

export const towerFrames = {
  basic: {
    idle: { start: 0, count: 4 },
    fire: { start: 4, count: 8 },
    upgrade: { start: 12, count: 4 }
  },
  sniper: {
    idle: { start: 0, count: 4 },
    fire: { start: 4, count: 8 },
    upgrade: { start: 12, count: 4 }
  },
  church: {
    idle: { start: 0, count: 4 },
    fire: { start: 4, count: 8 }
  }
};
