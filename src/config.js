// src/config.js – full game configuration with defaults

// Base config object – contains all constants used by engine and UI
const Config = {
  canvas: {
    id: 'gameCanvas',
    width: 800,
    height: 600,
  },

  game: {
    fps: 60,
    startingLives: 20,
    startingMoney: 100,
  },

  ui: {
    healthBar: { height: 5, yOffset: 10, backgroundColor: '#555', foregroundColor: '#6bf', },
    fontFamily: 'Arial',
    fontSize: 16,
  },

  // Asset map – each type knows its sprite sheet url & cell size.  The engine can use this for image‑based drawing.
  sprites: {
    enemy: {
      basic: { sheet: '/assets/images/enemy_basic.png', frames: 4, frameWidth: 32, frameHeight: 32, color: 'red' },
      fast:  { sheet: '/assets/images/enemy_fast.png',  frames: 4, frameWidth: 24, frameHeight: 24, color: 'orange' },
      tank:  { sheet: '/assets/images/enemy_tank.png',  frames: 4, frameWidth: 48, frameHeight: 48, color: 'darkred' },
    },
    tower: {
      basic: { sheet: '/assets/images/tower_basic.png',   frames: 4, frameWidth: 40, frameHeight: 40, color: 'blue' },
      sniper: { sheet: '/assets/images/tower_sniper.png', frames: 4, frameWidth: 35, frameHeight: 35, color: 'darkblue' },
      rapid: { sheet: '/assets/images/tower_rapid.png',  frames: 4, frameWidth: 30, frameHeight: 30, color: 'cyan' },
    },
  },

  // Tower defaults (same as before – keep engine compatible)
  tower: {
    basic: { width: 40, height: 40, damage: 10, range: 100, fireRate: 1000, cost: 50, color: 'blue' },
    sniper: { width: 35, height: 35, damage: 25, range: 200, fireRate: 2000, cost: 100, color: 'darkblue' },
    rapid: { width: 30, height: 30, damage: 5, range: 80, fireRate: 200, cost: 75, color: 'cyan' },
  },

  // Enemy defaults – keep same properties used in engine
  enemy: {
    basic: { width: 30, height: 30, health: 100, speed: 80, damage: 10, reward: 10, color: 'red' },
    fast: { width: 20, height: 20, health: 50, speed: 120, damage: 5, reward: 15, color: 'orange' },
    tank: { width: 40, height: 40, health: 300, speed: 60, damage: 20, reward: 30, color: 'darkred' },
  },

  // Projectile defaults
  projectile: {
    width: 5,
    height: 5,
    speed: 300,
    damage: 10,
    color: 'yellow',
  },

  // Audio volume – just placeholders
  audio: {
    masterVolume: 1.0,
    sfxVolume: 0.8,
    musicVolume: 0.5,
  },
};

// Wave configuration – appended to base object
Config.waves = [
  {
    enemies: [
      { type: 'basic', count: 5, interval: 1.0 },
      { type: 'fast', count: 2, interval: 3.0 },
    ],
  },
  {
    enemies: [
      { type: 'basic', count: 8, interval: 0.8 },
      { type: 'sniper', count: 4, interval: 2.5 },
    ],
  },
  {
    enemies: [
      { type: 'tank', count: 3, interval: 2.5 },
      { type: 'basic', count: 12, interval: 0.6 },
    ],
  },
];

// Export the complete config – this makes "import Config from '../src/config.js'" and “import Config from '../config.js'” work
export default Config;

// ---
// Helper to expose sprite sheet URL by type
export function getSpriteSheetUrl(type, category) {
  const prefix = '/assets/images/';
  if (category === 'enemy') {
    switch (type) {
      case 'basic': return `${prefix}enemy_basic.png`;
      case 'fast':  return `${prefix}enemy_fast.png`;
      case 'tank':  return `${prefix}enemy_tank.png`;
      default: return `${prefix}enemy_basic.png`;
    }
  }
  if (category === 'tower') {
    switch (type) {
      case 'basic': return `${prefix}tower_basic.png`;
      case 'sniper': return `${prefix}tower_sniper.png`;
      case 'rapid':  return `${prefix}tower_rapid.png`;
      default: return `${prefix}tower_basic.png`;
    }
  }
  return `${prefix}unknown.png`;
}
