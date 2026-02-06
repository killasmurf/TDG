i# Tower Defense Game (TDG) — Full Code Review & Remediation Plan

**Repository:** `killasmurf/TDG`  
**Review Date:** February 6, 2026  
**Codebase:** ~4,625 lines across 25 files (vanilla JS + HTML5 Canvas + Electron)

---

## Executive Summary

The TDG codebase is a functional tower defense prototype with a solid foundational architecture (entity system, event emitter, object pooling, wave manager). However, the game has **7 critical bugs** that will cause runtime crashes or broken gameplay, **10 significant architectural issues** that hinder maintainability, and several **incomplete features** from the Phase 6/7 roadmap. Below is a prioritized breakdown with specific remediation steps.

---

## 🔴 CRITICAL BUGS (Will crash or break gameplay)

### 1. `data/waves.json` — Invalid JSON
**File:** `data/waves.json`  
**Issue:** File starts with `// Sample waves.json` — JSON does not support comments. Any `fetch()` + `.json()` call will throw a `SyntaxError`.  
**Impact:** If the game ever loads this file, it will crash.  
**Fix:** Remove the comment line. The file is not currently loaded at runtime (hardcoded waves in `config.js` are used instead), but this is a ticking time bomb.

### 2. `Config.projectile.hitThreshold` — Undefined
**File:** `src/entities/projectile.js:80`  
**Issue:** `if (distance < Config.projectile.hitThreshold)` — but `Config.projectile` has no `hitThreshold` property. This evaluates to `undefined`, making the comparison always `false`.  
**Impact:** **Projectiles can never hit enemies.** The core combat loop is broken.  
**Fix:** Add `hitThreshold: 15` (or similar) to `Config.projectile` in `config.js`.

### 3. `src/main.js` — Undefined `colno` variable
**File:** `src/main.js:6`  
**Issue:** `console.error('[GLOBAL ERROR]', message, 'at', source, lineno, colno)` — `colno` is not a parameter of `window.onerror`. The function signature is `(message, source, lineno, error)`.  
**Impact:** Global error handler throws its own `ReferenceError`, masking real errors.  
**Fix:** Change to `window.onerror = function(message, source, lineno, colno, error)` (colno is the 4th arg, error is the 5th).

### 4. Wave 2 references non-existent `'sniper'` enemy type
**File:** `src/config.js` — `Config.waves[1]`  
**Issue:** Wave 2 spawns `{ type: 'sniper', count: 4, interval: 2.5 }` but `Config.enemy` only defines `basic`, `fast`, and `tank`. The enemy constructor falls back to `Config.enemy.basic`, producing confusingly mistyped enemies.  
**Fix:** Change `'sniper'` to `'fast'` or add a `sniper` entry to `Config.enemy`.

### 5. WaveManager event name mismatch
**File:** `src/core/waveManager.js:47,53`  
**Issue:** WaveManager subscribes to `'ENEMY_KILLED'` and `'ENEMY_REACHED_END'` (raw strings), but the actual events emitted by `Enemy` use `GameEvents.ENEMY_KILLED = 'enemy:killed'` and `GameEvents.ENEMY_REACHED_END = 'enemy:reached_end'`.  
**Impact:** **Wave completion is never detected.** `enemiesRemaining` never decrements, so waves never end.  
**Fix:** Change subscriptions to use `GameEvents.ENEMY_KILLED` and `GameEvents.ENEMY_REACHED_END` constants, or use their string values (`'enemy:killed'`, `'enemy:reached_end'`).

### 6. No victory condition
**File:** `src/core/game.js`  
**Issue:** `victory()` method exists but is never called anywhere. After all waves complete, `waveInProgress` is set to false but nothing checks if all waves are done.  
**Impact:** Players can never win the game. After the last wave, the game just sits idle.  
**Fix:** After `wave:completed` fires, check `waveManager.isAllWavesComplete()` and call `this.victory()`.

### 7. `restartGame()` doesn't restore map path
**File:** `src/core/game.js:500`  
**Issue:** `restartGame()` resets lives/money/score but never re-sets `entityManager.path` or reloads the map waypoints. After restart, enemies have no path.  
**Impact:** Enemies spawned after restart won't move.  
**Fix:** Store the current map path and re-apply it during restart, or call `setupDefaultPath()` / reload the current map file.

---

## 🟡 SIGNIFICANT ISSUES (Functional but problematic)

### 8. Enemy/Tower position rendering inconsistency
**Issue:** Enemies render at `(this.x, this.y)` as top-left corner, but tower placement in `game.js` uses `(x, y)` as center. Health bars, targeting lines, and collision all use mixed coordinate systems.  
**Impact:** Visual misalignment between placed towers and their actual hit zones.

### 9. `getEntitiesByType()` creates new arrays every frame
**File:** `src/core/entityManager.js`  
**Issue:** `.filter()` in `getEntitiesByType()` allocates a new array each call. Called multiple times per frame from `updateTowerTargeting()`.  
**Impact:** Unnecessary GC pressure in the hot loop. Not a crash, but degrades performance with many entities.

### 10. Massive God Object — `game.js` is 1,026 lines
**Issue:** `Game` class handles: game state, menus, rendering, input, tower placement, wave management, path validation, settings, and all UI. This is the #1 maintainability issue.  
**Impact:** Any change risks breaking unrelated functionality.

### 11. Duplicate `pointToLineDistance()` implementation
**Files:** `src/core/game.js:654` and `src/entities/pathManager.js:131`  
**Issue:** Identical math function duplicated in two files.  
**Fix:** Use `pathManager.getDistanceToPath()` from Game, or extract to a shared utility.

### 12. Dead code files
- `src/index.js` — React entry point (`import React`, `ReactDOM`) that has nothing to do with this Canvas game. Likely a leftover from a different project/scaffold.
- `src/editor/MapEditor.js` — Never imported anywhere.
- `src/core/spatialGrid.js` — Never imported or used.
- `src/game/level.js` — `LevelManager` class is never instantiated.

### 13. Console.log spam in production code
- `game.js`: **34 console.log calls**
- `enemy.js`: **3 console.log calls** with emoji in the update loop (runs every frame)
- This floods the dev console and impacts performance.

### 14. Memory leak in `main.js`
**Issue:** The click event listener at line 30 uses `{ once: false }` and is never cleaned up. Also, `setInterval(updateHUD, 100)` runs forever and is never cleared.

### 15. `data/waves.json` references `'slow'` enemy type (doesn't exist)
Even if the JSON were valid, the wave data references a `"slow"` enemy type not defined anywhere.

### 16. Object pool `release()` doesn't properly re-initialize
When enemies are released and re-acquired from the pool, `reset()` sets `active = true` but `initialize()` may not be called before the entity is re-used, leading to stale state.

### 17. `loadMapAndStart()` uses fragile `setTimeout` for state transition
**File:** `game.js:444`  
Uses `setTimeout(() => { if (this.state === 'menu') { this.startGame(); } }, 100)` to auto-start after map load. This is a race condition — if map loading takes longer than 100ms or state changes, it may not start.

---

## 🔵 INCOMPLETE FEATURES (from TODO_CHECKLIST.md)

Per the Phase 6/7 roadmap, these items remain:

| Feature | Status | Priority |
|---------|--------|----------|
| Tower Upgrade System (Phase 7) | Not started | Medium |
| `upgradeManager.js` | Not created | Medium |
| Tower selection via click | Not implemented | Medium |
| Upgrade UI panel | Not implemented | Medium |
| Visual upgrade indicators | Not implemented | Low |
| Upgrade tests | Not created | Medium |
| Difficulty settings (functional) | UI exists, no effect | Low |
| Sound assets loading | No actual audio files | Low |
| Sprite-based rendering | Config has sprite paths, renderer uses shapes | Low |

---

## 📋 REMEDIATION PLAN (Prioritized)

### Phase A: Critical Bug Fixes (Do First — ~2 hours)

1. **Add `hitThreshold` to Config** — Without this, combat is completely broken.
   ```js
   // In config.js, add to projectile:
   projectile: {
     width: 5, height: 5, speed: 300, damage: 10, color: 'yellow',
     hitThreshold: 15  // ADD THIS
   }
   ```

2. **Fix WaveManager event names** — Without this, waves never complete.
   ```js
   // In waveManager.js, change:
   this.entityManager.on('ENEMY_KILLED', ...)
   // To:
   this.entityManager.on(GameEvents.ENEMY_KILLED, ...)
   // Same for ENEMY_REACHED_END
   ```

3. **Fix `main.js` error handler** — Add `colno` parameter.

4. **Fix Wave 2 enemy type** — Change `'sniper'` to `'fast'` in `Config.waves[1]`.

5. **Add victory condition** — In the `wave:completed` handler:
   ```js
   GameEvents.on('wave:completed', () => {
     this.waveInProgress = false;
     if (this.waveManager.isAllWavesComplete()) {
       this.victory();
     }
   });
   ```

6. **Fix `restartGame()` path** — Re-apply the current map's waypoints.

7. **Fix `data/waves.json`** — Remove the comment and fix the `'slow'` type.

### Phase B: Code Quality & Architecture (Next — ~4 hours)

1. **Extract UI/Menu rendering** from `game.js` into `src/ui/MenuRenderer.js` and `src/ui/HUDRenderer.js`. Target: get `game.js` under 400 lines.

2. **Remove dead code**: Delete `src/index.js`, mark `MapEditor.js` and `spatialGrid.js` as unused (or integrate them).

3. **Consolidate `pointToLineDistance`** into `pathManager.js` only.

4. **Replace console.log spam** with a `DEBUG` flag or logger utility:
   ```js
   const DEBUG = false;
   function log(...args) { if (DEBUG) console.log(...args); }
   ```

5. **Fix coordinate system** — Standardize on center-based positioning for all entities.

6. **Cache `getEntitiesByType` results** or iterate arrays directly instead of filtering.

### Phase C: New Features — Phase 7 Tower Upgrades (~6 hours)

Follow the TODO_CHECKLIST.md roadmap:
1. Add upgrade config to `config.js`
2. Add upgrade methods to `tower.js`
3. Create `upgradeManager.js`
4. Add tower click-to-select in `game.js`
5. Add upgrade UI panel rendering
6. Add upgrade visual indicators
7. Write tests

### Phase D: Polish (~4 hours)

1. Implement actual difficulty scaling (enemy HP/speed multipliers)
2. Add game-over restart-from-menu flow
3. Add a "Return to Menu" button on victory/game-over screens
4. Load wave data from `data/waves.json` instead of hardcoding in config
5. Add basic sound effect stubs (even simple oscillator tones)
6. Add a proper score breakdown on game end

---

## Test Coverage Assessment

| Test File | Tests | Coverage Area |
|-----------|-------|---------------|
| `phase1-bugfixes.test.js` | 10 | Basic entity behavior |
| `phase2-architecture.test.js` | 15 | Entity lifecycle, pools |
| `phase3-event-system.test.js` | 5 | EventEmitter basics |
| `spatialGrid.test.js` | 3 | Grid operations |
| `waveManager.test.js` | 5 | Wave spawning |

**Missing test coverage:**
- Tower placement validation
- Projectile-enemy collision (currently broken)
- Victory/Game Over conditions
- Map loading
- Menu state transitions
- Restart/exit flows
- Tower upgrade system (Phase 7)

---

## Architecture Diagram (Current)

```
main.js
  └── Game (extends GameLoop)  ← GOD OBJECT (1026 lines)
        ├── Renderer (canvas drawing)
        ├── InputHandler (keyboard/mouse)
        ├── AudioManager (stub - no assets)
        ├── PathManager (waypoints)
        ├── EntityManager
        │     ├── ObjectPool<Enemy>
        │     ├── ObjectPool<Projectile>
        │     ├── Tower[] (not pooled)
        │     └── Enemy/Projectile/Tower extend BaseEntity
        ├── WaveManager
        └── EventEmitter (singleton gameEvents)
```

**Recommended refactored structure:**
```
main.js
  └── Game (slim coordinator, ~300 lines)
        ├── StateManager (menu/playing/paused/gameover)
        ├── UIManager (HUD, menus, settings, upgrade panel)
        ├── GameplayManager (tower placement, targeting, combat)
        ├── Renderer
        ├── InputHandler
        ├── AudioManager
        ├── PathManager
        ├── EntityManager
        ├── WaveManager
        ├── UpgradeManager (new - Phase 7)
        └── EventEmitter
```
