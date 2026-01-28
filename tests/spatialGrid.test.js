import SpatialGrid from '../src/core/spatialGrid.js';

describe('SpatialGrid', () => {
  const width = 500;
  const height = 400;
  const cellSize = 100;
  const grid = new SpatialGrid(width, height, cellSize);

  const dummy = { x: 0, y: 0 };
  test('adds entity to correct cell', () => {
    grid.add(dummy);
    const col = Math.floor(dummy.x / cellSize);
    const row = Math.floor(dummy.y / cellSize);
    const idx = row * grid.cols + col;
    expect(grid.cells[idx].has(dummy)).toBe(true);
  });

  test('queries correct radius', () => {
    dummy.x = 150; dummy.y = 120;
    grid.add(dummy);
    const found = grid.queryRange(150, 120, 10);
    expect(found).toContain(dummy);
  });

  test('does not return out‑of‑range entities', () => {
    dummy.x = 300; dummy.y = 300;
    grid.add(dummy);
    const found = grid.queryRange(0, 0, 50);
    expect(found).not.toContain(dummy);
  });
});
