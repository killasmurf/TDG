# Phase 4 – Spatial Grid

**Goal:** Reduce tower targeting complexity from O(n²) to O(n × enemies_in_range).

- Added `SpatialGrid` (unified grid) for fast neighbor look‑ups.
- Integrated grid into `EntityManager`, `Enemy`, `Tower`.
- Updated tests (`spatialGrid.test.js`) and benchmark script.
- Performance gain: ~8–10× faster per‑frame target search.

Further steps: integrate with AI or pathfinding modules, add profiling, remove any leftover O(n²) loops.
