// src/assets/towerFrames.js
// Mapping of tower types + tiers + states to sprite sheet frame indexes
export const towerFrames = {
  basic: {
    idle: [0,1,2,3],
    fire: [4,5,6,7],
    tier: {1:[0,1,2,3], 2:[8,9,10,11], 3:[12,13,14,15]}
  },
  sniper: {
    idle: [16,17,18,19],
    fire: [20,21,22,23],
    tier:{1:[16,17,18,19], 2:[24,25,26,27], 3:[28,29,30,31]}
  },
  church:{
    idle:[32,33,34,35],
    fire:[36,37,38,39],
    tier:{1:[32,33,34,35], 2:[40,41,42,43], 3:[44,45,46,47]}
  }
};
