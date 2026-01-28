export default function benchmark() {
  const { performance } = require('perf_hooks');
  const Tower = require('../src/entities/Tower.js').default;
  const Enemy = require('../src/entities/Enemy.js').default;
  const SpatialGrid = require('../src/core/spatialGrid.js').default;
  const EntityManager = require('../src/core/entityManager.js').default;

  const NUM_ENEMIES = 200;
  const NUM_TOWERS = 20;
  const GRID_SIZE = 100;

  function init(noGrid) {
    const manager = new EntityManager();
    manager.grid = noGrid ? undefined : new SpatialGrid(800, 600, GRID_SIZE);
    const enemies = [];
    for (let i = 0; i < NUM_ENEMIES; i++) {
      const e = new Enemy(manager, { health: 50 });
      e.x = Math.random() * 800;
      e.y = Math.random() * 600;
      if (!noGrid) manager.grid.add(e);
      enemies.push(e);
      manager.enemies.push(e);
    }
    const towers = [];
    for (let i = 0; i < NUM_TOWERS; i++) {
      const t = new Tower(manager, { range: 120 });
      t.x = Math.random() * 800;
      t.y = Math.random() * 600;
      if (!noGrid) manager.grid.add(t);
      towers.push(t);
      manager.towers.push(t);
    }
    return { manager, towers, enemies };
  }

  function runUpdate(manager, towers, enemies, dt) {
    towers.forEach(t => t.update(dt, manager));
    enemies.forEach(e => e.update(dt));
  }

  function bench(noGrid) {
    const { manager, towers, enemies } = init(noGrid);
    const start = performance.now();
    for (let frame = 0; frame < 60; frame++) {
      runUpdate(manager, towers, enemies, 16);
    }
    const end = performance.now();
    console.log(noGrid ? 'No Grid' : 'Grid', ':', (end - start).toFixed(2), 'ms');
  }

  [true, false].forEach(grid => bench(grid));
}

if (require.main === module) {
  benchmark();
}
