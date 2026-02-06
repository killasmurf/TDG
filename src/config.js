// Updated game configuration with tower upgrade data
// TODO: This file contains the main game configuration.
// It is loaded by the Game module to initialize towers, enemies, waves, paths, etc.
// The following changes were applied to enable a tier-based upgrade system for towers.

// We now store base stats and a list of upgrades (up to two additional tiers) for
// each tower type. The Tower class will consume this data to apply the correct
// damage/range values for the current tier.
//
// The `upgrades` array contains objects with the next-tier stats and the gold
// cost required to upgrade.  An empty or missing array indicates that the
// tower cannot be upgraded further.

// Example for the `basic` tower:
//   baseStats   -> tier 1 stats (damage = 5, range = 100)
//   upgrades[0] -> tier 2 stats (damage = 6, range = 110, cost = 50)
//   upgrades[1] -> tier 3 stats (damage = 8, range = 120, cost = 100)
//
// The tower rendering logic currently uses the `damage` and `range` values
// exposed from the Tower instance; these need to be updated when an upgrade
// occurs.  The upgrade cost is available on the upgrade definition.

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
    healthBar: { height: 5, yOffset: 10, backgroundColor: '#555', foregroundColor: '#6bf' },
    fontFamily: 'Arial',
    fontSize: 16,
    rangeIndicator: { color: 'rgba(255, 255, 255, 0.3)', lineWidth: 1 },
  },
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
  tower: {
    basic: {
      width: 40, height: 40, damage: 10, range: 100, fireRate: 1000, cost: 50, color: 'blue', projectileSpeed: 300,
      baseStats: { width: 20, height: 20, range: 100, dmg: 5 },
      upgrades: [
        { dmg: 6, range: 110, cost: 50 },
        { dmg: 8, range: 120, cost: 100 },
      ]
    },
    sniper: {
      width: 35, height: 35, damage: 25, range: 200, fireRate: 2000, cost: 100, color: 'darkblue', projectileSpeed: 500,
      baseStats: { width: 25, height: 25, range: 200, dmg: 12 },
      upgrades: [
        { dmg: 14, range: 210, cost: 75 },
        { dmg: 16, range: 220, cost: 150 },
      ]
    },
    rapid: {
      width: 30, height: 30, damage: 5, range: 80, fireRate: 200, cost: 75, color: 'cyan', projectileSpeed: 400,
      baseStats: { width: 15, height: 15, range: 80, dmg: 3 },
      upgrades: [
        { dmg: 4, range: 90, cost: 25 },
        { dmg: 5, range: 100, cost: 50 },
      ]
    },
  },
  enemy: {
    basic: { width: 30, height: 30, health: 100, speed: 80, damage: 10, reward: 10, color: 'red' },
    fast: { width: 20, height: 20, health: 50, speed: 120, damage: 5, reward: 15, color: 'orange' },
    tank: { width: 40, height: 40, health: 300, speed: 60, damage: 20, reward: 30, color: 'darkred' },
  },
  projectile: {
    width: 5,
    height: 5,
    speed: 300,
    damage: 10,
    color: 'yellow',
    hitThreshold: 15,
  },
  audio: {
    masterVolume: 1.0,
    sfxVolume: 0.8,
    musicVolume: 0.5,
  },
  path: {
    waypointThreshold: 5,
  },
};

// --- Wave configuration - appended to base object
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
      { type: 'fast', count: 4, interval: 2.5 },
    ],
  },
  {
    enemies: [
      { type: 'tank', count: 3, interval: 2.5 },
      { type: 'basic', count: 12, interval: 0.6 },
    ],
  },
];

export default Config;
