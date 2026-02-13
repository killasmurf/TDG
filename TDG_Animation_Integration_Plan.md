# TDG Animation & Model Integration Plan

## Angels vs Demons — Bringing Models & Animations Into the Game Engine

---

## Current State Assessment

### What Exists (Ready to Integrate)

**Enemy Animations (React/JSX Previews — need extraction to game-engine format):**

| Asset | File | Status |
|-------|------|--------|
| Samurai (Standard Enemy) | `assets/enemies/animation/samurai_animations.jsx` | Walk cycle (8 frames), Death sequence (12 frames), 3 variants (basic/fast/tank), Particle system |
| Demon Dog (Fast Enemy) | `assets/enemies/animation/demon_dog_animations.jsx` | Gallop cycle (8 frames), Death sequence (12 frames), 3 variants (Demon Dog/Hellhound/Infernal), 17 body parts |

**Tower Animations (React/JSX Previews — need extraction to game-engine format):**

| Asset | File | Status |
|-------|------|--------|
| Sniper Tower (T1/T2/T3) | `assets/towers/animation/sniper_tower_animations.jsx` | Idle sway + Fire sequences per tier, T1 single archer, T2 dual archer, T3 triple archer |
| Church Tower (Support) | `assets/towers/animation/church_tower_animations.jsx` | T1 Chapel, T2 Parish Church, T3 Grand Cathedral, healing aura/divine effects |

**3D Models (Blender/OBJ — for reference and potential sprite generation):**

| Model | Files | Notes |
|-------|-------|-------|
| Samurai Enemy | `assets/enemies/samurai_enemy.obj/.mtl` | Single OBJ, variants differentiated by colour palette |
| Church Towers | `assets/towers/models/basic_t1-t3.obj/.mtl` | Three tiers |
| Sniper Towers | `assets/towers/models/sniper_t1-t3.obj/.mtl` | Three tiers |
| Blender Scripts | `assets/towers/models/gen_*.py`, `assets/enemies/blender/create_samurai_enemy.py` | Procedural generation |

### What's Already Wired In

- **`EnemyAnimator` class** (`src/entities/enemyAnimator.js`) — Fully implemented for the **samurai only**. Contains the skeletal animation system with PARTS, PIVOTS, PALETTES, WALK_FRAMES, DEATH_FRAMES, interpolation, and canvas rendering. Already integrated into `Enemy` class via `enemy.animator`.
- **Enemy class** (`src/entities/enemy.js`) — Imports `EnemyAnimator`, creates animator in constructor, calls `animator.update(deltaTime)` in update loop, calls `animator.render(ctx, cx, cy, scale)` in render method. Has `dying` flag and death animation completion logic.
- **`TowerAnimator` class** (`src/entities/towerAnimator.js`) — **Stub only** (4 lines, imports a non-functional `towerFrames.js`). Needs to be completely rebuilt.
- **Tower class** (`src/entities/tower.js`) — Has `animator` reference and calls `animator.render()` and `animator.update()`, but uses `TowerAnimator` which is broken.

### Critical Blockers (Must Fix First)

These three bugs from the code review **prevent any animations from being visible** and must be resolved before integration work begins:

1. **Tower Import/Export Mismatch** — `tower.js` uses `export class Tower` but `entityManager.js` imports as `import Tower from...` (default import). Towers never spawn.
2. **WaveManager Event Listener Leak** — Unsubscribe uses wrong string literals (`'ENEMY_KILLED'` vs `GameEvents.ENEMY_KILLED` → `'enemy:killed'`). Listeners accumulate, wave tracking breaks.
3. **TowerAnimator Syntax Error** — Line 73 has `this[state ===` instead of `this.state ===` plus bracket mismatch. Tower animation crashes.

---

## Integration Plan

### Phase 0: Fix Critical Blockers (Prerequisite)
**Estimated effort: 1–2 hours**

These are the bugs identified in the code review. Nothing else works until these are resolved.

**Task 0.1 — Fix Tower Export**
- File: `src/entities/tower.js`
- Change `export class Tower` → `export default class Tower`
- Verify: `entityManager.js` can import and instantiate towers

**Task 0.2 — Fix WaveManager Event Cleanup**
- File: `src/core/waveManager.js`
- Lines 87/91: Replace raw string `'ENEMY_KILLED'` / `'ENEMY_REACHED_END'` with `GameEvents.ENEMY_KILLED` / `GameEvents.ENEMY_REACHED_END`
- Verify: Play through 2+ waves without listener accumulation

**Task 0.3 — Fix TowerAnimator Syntax**
- File: `src/entities/towerAnimator.js`
- Replace the broken line 73 with properly structured code (or replace entire file in Phase 2)
- Verify: No console errors on tower placement

**Task 0.4 — Clean Up Duplicate Files**
- Delete: `src/core/MapEditor.js`, `src/editor/MapEditor.js`, root-level duplicate animations/generators
- Delete: `src/core/src/` (empty dir), redundant `files.zip` copies
- Verify: No import references break

**Validation Gate:** Game launches, towers can be placed, enemies spawn and walk, waves progress.

---

### Phase 1: Extract Animation Data from JSX Previews
**Estimated effort: 3–4 hours**

The JSX preview files contain all the animation data (parts definitions, keyframes, interpolation logic, rendering functions) but in React component form. This phase extracts them into pure ES6 modules the game engine can consume.

**Task 1.1 — Create `src/animation/` Module Directory**

```
src/animation/
├── enemyAnimators/
│   ├── SamuraiAnimator.js      ← Already exists as enemyAnimator.js (rename/move)
│   └── DemonDogAnimator.js     ← NEW: Extract from demon_dog_animations.jsx
├── towerAnimators/
│   ├── SniperTowerAnimator.js  ← NEW: Extract from sniper_tower_animations.jsx
│   └── ChurchTowerAnimator.js  ← NEW: Extract from church_tower_animations.jsx
├── Particle.js                 ← Shared particle system
├── interpolation.js            ← Shared lerp/lerpFrame utilities
└── AnimState.js                ← Shared animation state enum
```

**Task 1.2 — Extract Demon Dog Animator**

From `demon_dog_animations.jsx`, extract into `DemonDogAnimator.js`:
- `DEMON_DOG_PARTS` (17 body parts with positions, sizes, colours)
- `WALK_FRAMES` (8 gallop cycle keyframes)
- `DEATH_FRAMES` (12 death sequence keyframes)
- `drawDemonDog()` rendering function → convert to class method
- Variant colour palettes (basic/hellhound/infernal)
- Tail flame effect, spine ridges, glowing eye detail rendering

The class should follow the same interface as `EnemyAnimator`:
```javascript
class DemonDogAnimator {
  constructor(variant = 'basic') { ... }
  update(deltaTime) { ... }
  render(ctx, cx, cy, scale) { ... }
  setState(state) { ... }
  flash() { ... }
  reset(variant) { ... }
  isDeathComplete() { ... }
}
```

**Task 1.3 — Extract Sniper Tower Animator**

From `sniper_tower_animations.jsx`, extract into `SniperTowerAnimator.js`:
- `T1_PARTS`, `T2_PARTS`, `T3_PARTS` (tower structure per tier)
- `T1_IDLE_FRAMES` / `T1_FIRE_FRAMES` (4 idle + 8 fire for T1)
- `T2_IDLE_FRAMES` / `T2_FIRE_FRAMES` (4 idle + 8 fire for T2, dual archer)
- `T3_IDLE_FRAMES` / `T3_FIRE_FRAMES` (4 idle + 8 fire for T3, triple archer)
- `drawT1Tower()`, `drawT2Tower()`, `drawT3Tower()` → tier-based render methods

Target interface:
```javascript
class SniperTowerAnimator {
  constructor(tier = 1) { ... }
  update(deltaTime) { ... }
  render(ctx, cx, cy, scale) { ... }
  triggerFire() { ... }     // Switch to fire animation, auto-return to idle
  setTier(tier) { ... }     // Upgrade: swap parts/frames
  getState() { ... }        // IDLE or FIRE
}
```

**Task 1.4 — Extract Church Tower Animator**

From `church_tower_animations.jsx`, extract into `ChurchTowerAnimator.js`:
- Three-tier structure (Chapel / Parish Church / Grand Cathedral)
- Healing aura pulse animation
- Divine glow / stained glass shimmer effects
- Bell swing animation
- Support radius visual indicator

Target interface matches SniperTowerAnimator but adds:
```javascript
class ChurchTowerAnimator extends BaseTowerAnimator {
  renderHealingAura(ctx, cx, cy, radius, intensity) { ... }
  renderSupportRadius(ctx, cx, cy, range) { ... }
}
```

**Task 1.5 — Extract Shared Utilities**

- `interpolation.js`: `lerp()`, `lerpFrame()` — both enemy and tower animations use identical interpolation
- `Particle.js`: Shared particle class (used by samurai death smoke, demon dog hellfire, tower divine effects)
- `AnimState.js`: Unified enum for `IDLE`, `WALK`, `FIRE`, `DEATH`, `SPECIAL`

**Validation Gate:** Each animator can be instantiated standalone and renders to an offscreen canvas without errors. Write a simple test HTML page that creates each animator and runs a single frame.

---

### Phase 2: Rebuild TowerAnimator as a Router
**Estimated effort: 2–3 hours**

The current `towerAnimator.js` is a broken stub. Replace it with a factory/router that delegates to the correct tier-specific animator based on tower type.

**Task 2.1 — Rewrite `src/entities/towerAnimator.js`**

```javascript
import { SniperTowerAnimator } from '../animation/towerAnimators/SniperTowerAnimator.js';
import { ChurchTowerAnimator } from '../animation/towerAnimators/ChurchTowerAnimator.js';

const ANIMATOR_MAP = {
  sniper: SniperTowerAnimator,
  basic:  ChurchTowerAnimator,   // "basic" tower type = church support tower
  rapid:  SniperTowerAnimator,   // rapid could reuse sniper with different speed params
};

export class TowerAnimator {
  constructor(type, tier = 1) {
    const AnimClass = ANIMATOR_MAP[type] || ChurchTowerAnimator;
    this._impl = new AnimClass(tier);
  }
  
  update(dt)                    { this._impl.update(dt); }
  render(ctx, cx, cy, scale)    { this._impl.render(ctx, cx, cy, scale); }
  triggerFire()                 { this._impl.triggerFire(); }
  setTier(tier)                 { this._impl.setTier(tier); }
}

export const TowerAnimState = { IDLE: 'idle', FIRE: 'fire' };
```

**Task 2.2 — Verify Tower ↔ Animator Contract**

Ensure `tower.js` calls match the animator interface:
- `constructor(type, tier)` ✓ (already passes these)
- `update(deltaTime)` ✓
- `render(ctx, cx, cy, scale)` ✓
- `triggerFire()` ✓ (called in `fire()` method)
- `setTier(tier)` ✓ (called in `upgrade()` method)

**Task 2.3 — Remove Old Asset References**

- Delete or gut `src/assets/towerFrames.js` and `src/assets/towerKeyframes.js` (sprite-sheet based approach replaced by skeletal animation)
- Update any remaining imports

**Validation Gate:** Place each tower type at each tier. Towers display correct idle animation. Firing at an enemy triggers fire animation sequence. Upgrading a tower visually changes the model.

---

### Phase 3: Integrate Demon Dog as Second Enemy Type
**Estimated effort: 3–4 hours**

Currently only samurai enemies exist. The Demon Dog needs to be wired in as the "fast" enemy type.

**Task 3.1 — Create Enemy Animator Factory**

Refactor `enemy.js` to select the correct animator based on enemy type:

```javascript
import { SamuraiAnimator } from '../animation/enemyAnimators/SamuraiAnimator.js';
import { DemonDogAnimator } from '../animation/enemyAnimators/DemonDogAnimator.js';

// In Enemy constructor / initialize:
const ENEMY_ANIMATOR_MAP = {
  basic: { class: SamuraiAnimator, variant: 'basic' },
  fast:  { class: DemonDogAnimator, variant: 'basic' },
  tank:  { class: SamuraiAnimator, variant: 'tank' },
};

// Create animator based on type
const animConfig = ENEMY_ANIMATOR_MAP[type] || ENEMY_ANIMATOR_MAP.basic;
this.animator = new animConfig.class(animConfig.variant);
```

**Task 3.2 — Adjust Demon Dog Scale and Positioning**

The Demon Dog is a quadruped with a wider, lower profile than the samurai:
- Samurai model height: ~110 local units, upright biped
- Demon Dog model: ~74 local units tall, ~66 units wide, horizontal quadruped
- Scale calculation needs to account for the different aspect ratio
- Anchor point: center-bottom (same as samurai) but bounding box is wider

Update in `enemy.js render()`:
```javascript
render(renderer) {
  const ctx = renderer.ctx;
  // Scale based on enemy type's model dimensions
  const modelHeight = this.animator.getModelHeight(); // 110 for samurai, 74 for demon dog
  const scale = this.height / modelHeight;
  
  this.animator.render(
    ctx,
    this.x + this.width / 2,
    this.y + this.height,
    scale
  );
  // ... health bar rendering
}
```

**Task 3.3 — Update Config for Demon Dog**

The "fast" enemy config currently uses samurai-appropriate dimensions. Adjust for the demon dog:

```javascript
// In config.js
enemy: {
  basic: { width: 30, height: 30, health: 100, speed: 80,  ... }, // Samurai
  fast:  { width: 35, height: 25, health: 50,  speed: 120, ... }, // Demon Dog (wider, shorter)
  tank:  { width: 40, height: 40, health: 300, speed: 60,  ... }, // Samurai tank variant
}
```

**Task 3.4 — Add Demon Dog Variants to Wave System**

Currently `waveManager.js` spawns enemies by type string. Ensure that `fast` type enemies now correctly render as demon dogs rather than red-tinted samurai.

No wave config changes should be needed — the enemy type `'fast'` will now automatically route to `DemonDogAnimator` via the factory in Task 3.1.

**Validation Gate:** Spawn a mixed wave with basic + fast enemies. Samurai walk upright with sword sway, demon dogs gallop with all four legs and tail flame. Both play death animations on kill. Health bars positioned correctly above each.

---

### Phase 4: Map Tower Types to Themed Visuals
**Estimated effort: 2–3 hours**

Currently three tower types exist in config: `basic`, `sniper`, `rapid`. Map these to the Angels vs Demons theme.

**Task 4.1 — Define Tower Type → Visual Mapping**

| Config Type | Theme Name | Animator | Role |
|-------------|-----------|----------|------|
| `basic` | Church Tower (Support) | `ChurchTowerAnimator` | Healing aura, area buff |
| `sniper` | Sniper Tower (DPS) | `SniperTowerAnimator` | Long range, high single-target damage |
| `rapid` | Rapid Tower (Crowd Control) | `SniperTowerAnimator` (fast fire variant) | Short range, rapid fire |

**Task 4.2 — Implement Church Tower Special Abilities**

The church tower's identity is **support/healing**, which is unique to the Angels theme:
- Implement `healingAura` update logic: Periodically heal nearby towers within range
- Render the divine glow / healing pulse effect from `ChurchTowerAnimator`
- Display support radius circle on hover/selection
- Scale effects per tier: T1 small pulse, T2 steady aura, T3 grand cathedral with wide-area divine light

This requires adding a new method to `Tower`:
```javascript
updateSupportAbility(deltaTime, nearbyTowers) {
  if (this.type !== 'basic') return;
  // Healing tick logic based on tier
}
```

**Task 4.3 — Configure Rapid Tower Animation Speed**

If `rapid` shares the sniper animator, override the fire animation speed:
```javascript
// In TowerAnimator factory
if (type === 'rapid') {
  this._impl.setFireSpeed(3.0);  // Much faster fire animation
  this._impl.setIdleSpeed(1.5);  // Slightly faster idle
}
```

**Task 4.4 — Update Tower Placement UI**

Update the tower selection UI to show themed names and descriptions:
- "Church Tower" / "Sniper Tower" / "Rapid Tower" instead of "Basic" / "Sniper" / "Rapid"
- Show tier info and upgrade preview
- Consider showing a small animated preview in the selection panel

**Validation Gate:** All three tower types render with distinct visuals. Church tower shows healing aura. Sniper shows aimed fire. Rapid shows rapid-fire sequence. Upgrades visually change each tower.

---

### Phase 5: Config Consolidation & Polish
**Estimated effort: 2–3 hours**

**Task 5.1 — Resolve Config.js Contradictions**

The tower config has BOTH flat properties (`damage: 10, range: 150`) AND nested `baseStats` with different values (`dmg: 5`). Decide which is canonical, remove the other, and update all code that reads tower stats.

Recommended: Use `baseStats` + `upgrades` array as the single source of truth:
```javascript
tower: {
  basic: {
    cost: 50,
    baseStats: { width: 40, height: 40, range: 100, damage: 5, fireRate: 1000, projectileSpeed: 300 },
    upgrades: [
      { damage: 6, range: 110, fireRate: 900, cost: 50 },
      { damage: 8, range: 120, fireRate: 800, cost: 100 },
    ]
  },
  // ...
}
```

**Task 5.2 — Add Animation Speed Tuning Config**

Add per-tower-type animation speed settings to config:
```javascript
animation: {
  towers: {
    basic:  { idleSpeed: 2, fireSpeed: 4 },
    sniper: { idleSpeed: 2, fireSpeed: 6 },
    rapid:  { idleSpeed: 3, fireSpeed: 10 },
  },
  enemies: {
    basic: { walkSpeed: 8, deathSpeed: 6 },
    fast:  { walkSpeed: 10, deathSpeed: 8 },  // Demon dog gallops faster
    tank:  { walkSpeed: 5, deathSpeed: 5 },
  }
}
```

**Task 5.3 — Add Sprite Sheet Fallback Path**

For the tower animator, add an `onerror` fallback that draws simple coloured rectangles if sprite sheets are missing (they won't be needed with skeletal animation, but the old code path should fail gracefully).

**Task 5.4 — Performance: Offscreen Canvas Caching**

For towers (which are stationary), consider rendering idle frames to an offscreen canvas and blitting from cache instead of redrawing the full skeletal model every frame. This is especially important for the T3 Grand Cathedral which has many draw calls.

```javascript
// In tower animator
if (this.state === 'idle' && this.cachedFrame) {
  ctx.drawImage(this.cachedCanvas, cx - offsetX, cy - offsetY);
  return;
}
// Otherwise render full skeletal frame and cache it
```

**Validation Gate:** All stats are consistent. Animation speeds feel right. Performance stays at 60fps with 20+ entities on screen.

---

### Phase 6: Extended Animations & Future Enemy Types
**Estimated effort: Ongoing**

**Task 6.1 — Tower Attack Animations (Direction-Aware)**

Currently towers fire in a direction but the animation doesn't rotate to face the target. Add target-facing logic:
```javascript
// In tower render, rotate the archer/weapon portion to face target angle
this.animator.setTargetAngle(this.angle);
```

**Task 6.2 — Enemy Hit Reactions**

Add a brief "hit flash" frame interpolation when enemies take damage (already partially implemented via `animator.flash()` — needs visual tuning per enemy type).

**Task 6.3 — Future Enemy Types**

The animation architecture supports adding new enemy types by:
1. Create a new JSX preview file for design iteration
2. Extract into a new Animator class following the established interface
3. Add to `ENEMY_ANIMATOR_MAP` in the enemy factory
4. Add config entry with stats
5. Add to wave definitions

Planned types: Flying enemies, boss enemies, shielded enemies.

**Task 6.4 — Projectile Visuals**

Replace the current simple yellow dot projectile with themed visuals:
- Church tower: Golden light beam / divine bolt
- Sniper tower: Arrow with trail
- Rapid tower: Small energy bolts

---

## Dependency Graph

```
Phase 0 (Bug Fixes) ──────────────┐
                                   ▼
Phase 1 (Extract Animations) ─────┤
                                   ▼
Phase 2 (Rebuild TowerAnimator) ──┤── Can run in parallel with Phase 3
                                   │
Phase 3 (Demon Dog Integration) ──┤
                                   ▼
Phase 4 (Tower Theme Mapping) ────┤
                                   ▼
Phase 5 (Config & Polish) ────────┤
                                   ▼
Phase 6 (Extended / Ongoing) ─────┘
```

**Phases 2 & 3 can run in parallel** since they touch different entity types (towers vs enemies).

---

## Total Estimated Effort

| Phase | Effort | Priority |
|-------|--------|----------|
| Phase 0: Bug Fixes | 1–2 hours | **CRITICAL** |
| Phase 1: Extract Animations | 3–4 hours | High |
| Phase 2: Rebuild TowerAnimator | 2–3 hours | High |
| Phase 3: Demon Dog Integration | 3–4 hours | High |
| Phase 4: Tower Theme Mapping | 2–3 hours | Medium |
| Phase 5: Config & Polish | 2–3 hours | Medium |
| Phase 6: Extended Animations | Ongoing | Low |
| **Total (Phases 0–5)** | **~13–19 hours** | |

---

## Files Changed Summary

**New files to create:**
- `src/animation/enemyAnimators/SamuraiAnimator.js` (rename/move from `enemyAnimator.js`)
- `src/animation/enemyAnimators/DemonDogAnimator.js`
- `src/animation/towerAnimators/SniperTowerAnimator.js`
- `src/animation/towerAnimators/ChurchTowerAnimator.js`
- `src/animation/Particle.js`
- `src/animation/interpolation.js`
- `src/animation/AnimState.js`

**Files to rewrite:**
- `src/entities/towerAnimator.js` → Factory/router pattern
- `src/entities/tower.js` → Fix export, update animator integration

**Files to modify:**
- `src/entities/enemy.js` → Animator factory for multiple enemy types
- `src/core/waveManager.js` → Fix event string bug
- `src/config.js` → Consolidate stats, add animation config
- `src/core/entityManager.js` → Verify tower import works after fix

**Files to delete:**
- `src/core/MapEditor.js` (duplicate)
- `src/editor/MapEditor.js` (duplicate)
- `src/editor/` directory (if empty after)
- `src/assets/towerFrames.js` (replaced by skeletal animation)
- `src/assets/towerKeyframes.js` (replaced by skeletal animation)
- `assets/towers/church_tower_animations.jsx` (root-level duplicate)
- `assets/towers/church_tower_generator.py` (root-level duplicate)
- `src/components/files.zip`, `maps/files.zip` (duplicate archives)
- `src/core/src/` (empty directory)
