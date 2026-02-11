# TO_DO — Tower Animation Integration Plan

## Overview

Integrate three animated tower types into the TDG game engine:
1. **Basic Tower** — Shinto Shrine (existing `basic` type, already has sniper animation JSX)
2. **Sniper Tower** — Buddhist Pagoda (existing `sniper` type, has T1/T2/T3 animation JSX)
3. **Church Tower** — Gothic Cathedral (new `church` type, support/healer role)

### Current State
- Enemy animations are **fully integrated** — `enemyAnimator.js` drives samurai walk/death in `enemy.js`
- Tower rendering uses **plain colored rectangles** — `tower.js` → `renderer.drawRect()`
- 3D OBJ models exist in `assets/towers/models/` for basic and sniper towers
- Animation keyframes exist in JSX preview files but **not yet ported** to game engine format
- Church tower has a full config JSON at `assets/towers/church_tower_config.json`
- `Config.js` defines three tower types: `basic`, `sniper`, `rapid` — church tower not yet added

---

## Phase 1: Create TowerAnimator Class

**Goal:** Build `src/entities/towerAnimator.js` mirroring the pattern of `enemyAnimator.js`.

### Step 1.1 — Create `src/entities/towerAnimator.js`

Create a new file `src/entities/towerAnimator.js` that exports a `TowerAnimator` class with:

- **Constructor** accepts `(towerType, tier)` where `towerType` is `'basic'|'sniper'|'church'` and `tier` is `1|2|3`
- **Animation states:** `IDLE`, `FIRE`, `UPGRADE` (enum exported as `TowerAnimState`)
- **Properties:**
  - `this.type` — tower type string
  - `this.tier` — current upgrade tier (1-3)
  - `this.state` — current animation state
  - `this.time` — animation clock (seconds)
  - `this.idleSpeed` — idle frames per second
  - `this.fireSpeed` — fire frames per second
  - `this.fireDone` — boolean, true when fire anim completes
  - `this.particles` — array of active particles

- **Methods:**
  - `setState(state)` — switch animation state, reset time for FIRE
  - `update(deltaTime)` — advance animation clock, update particles
  - `getCurrentFrame()` — return interpolated keyframe data
  - `render(ctx, cx, cy, scale)` — draw the tower to a 2D canvas context
  - `triggerFire()` — convenience method: set state to FIRE, reset clock
  - `setTier(tier)` — change tier, update internal part definitions
  - `reset(type, tier)` — full reset for object pooling
  - `isFireComplete()` — returns true when fire animation finishes

### Step 1.2 — Port keyframe data from JSX previews

Extract the keyframe arrays from the three JSX source files into the TowerAnimator:

**From `sniper_tower_animations.jsx`:**
- `T1_IDLE_FRAMES` (4 frames) → `SNIPER_IDLE[1]`
- `T1_FIRE_FRAMES` (8 frames) → `SNIPER_FIRE[1]`
- `T2_IDLE_FRAMES` (4 frames) → `SNIPER_IDLE[2]`
- `T2_FIRE_FRAMES` (8 frames) → `SNIPER_FIRE[2]`
- `T3_IDLE_FRAMES` (4 frames) → `SNIPER_IDLE[3]`
- `T3_FIRE_FRAMES` (6 frames) → `SNIPER_FIRE[3]`

**From `samurai_animations.jsx` (basic tower uses similar structure):**
- Create 4-frame idle sway and 8-frame fire sequence for basic tower T1/T2/T3

**From `church_tower_config.json`:**
- `tiers.T1.animations.idle.keyframes` → `CHURCH_IDLE[1]`
- `tiers.T1.animations.blessing.keyframes` → `CHURCH_FIRE[1]`
- `tiers.T2.animations.*` → `CHURCH_IDLE[2]`, `CHURCH_FIRE[2]`
- `tiers.T3.animations.*` → `CHURCH_IDLE[3]`, `CHURCH_FIRE[3]`

### Step 1.3 — Port tower part definitions

Extract the visual structure from the JSX files. Each tier has different parts:

**Sniper tower parts** (from `sniper_tower_animations.jsx`):
- `T1_PARTS` — base, platform, pillars, roof, roofTrim, archer, bow, arrow
- `T2_PARTS` — adds tier2 structure, dual archers (archerL, archerR)
- `T3_PARTS` — adds tier3, spire, triple archers (archerL, archerC, archerR)

**Basic tower parts** — Create similar structure with Shinto shrine elements:
- T1: simple shrine base, torii gate pillars, single roof
- T2: larger base, double roof tier, two pillars
- T3: grand shrine, triple tier, ornamental details

**Church tower parts** — Create from the Blender script (`church_tower_generator.py`):
- T1: stone base, walls, arched doorway, stained glass ×2, pyramid roof, bell, cross
- T2: larger nave, rose window, twin bell towers with spires, twin crosses
- T3: cathedral body, grand rose window, central tower + twin towers, triple crosses

### Step 1.4 — Port rendering functions

Each tower type needs a `draw` function. Port from the JSX `drawT1Tower`, `drawT2Tower`, `drawT3Tower` functions. The render method signature should be:

```js
render(ctx, cx, cy, scale)
```

Where `cx, cy` is the center-bottom of the tower. The function reads `this.getCurrentFrame()` and draws all parts with rotation/translation from frame data.

Include:
- Arrow charge opacity effect (sniper)
- Bell sway animation (church)
- Light beam / glow effects (church blessing)
- Particle rendering after tower draw

### Step 1.5 — Implement lerp and lerpFrame

Copy the `lerp()` and `lerpFrame()` functions from `enemyAnimator.js`. Add handling for the `visible` boolean property used in arrow frames:

```js
if (prop === 'visible') {
  result[key][prop] = t < 0.5 ? frameA[key][prop] : frameB[key]?.[prop];
} else {
  result[key][prop] = lerp(frameA[key][prop] || 0, frameB[key]?.[prop] || 0, t);
}
```

---

## Phase 2: Integrate TowerAnimator into Tower Class

**Goal:** Replace colored rectangles in `tower.js` with animated renders.

### Step 2.1 — Add animator to Tower constructor

In `src/entities/tower.js`, import and instantiate:

```js
import { TowerAnimator, TowerAnimState } from './towerAnimator.js';
```

In the constructor, after setting type/config properties:
```js
this.animator = new TowerAnimator(this.type, 1); // start at tier 1
this.currentTier = 1;
```

### Step 2.2 — Update Tower.update()

Add animator update call at the top of the `update(deltaTime, entityManager)` method:
```js
this.animator.update(deltaTime);
```

When `this.fire()` is called, also trigger the fire animation:
```js
fire(entityManager) {
  if (!this.target || !entityManager) return;
  this.animator.triggerFire();  // ← ADD THIS
  entityManager.spawnProjectile(this, this.target);
  // ... existing event emit
}
```

### Step 2.3 — Replace Tower.render()

Replace the current `render(renderer)` method body. The new render should:

1. Get the canvas context from the renderer: `const ctx = renderer.ctx;`
2. Call `this.animator.render(ctx, centerX, bottomY, scale)`
3. Keep the range indicator drawing (circle outline when targeting)
4. Keep the targeting line drawing
5. Remove the old `drawRect` body and type indicator

Scale calculation: `const scale = this.width / 80;` (80 = approximate model width in local units)

Position: `cx = this.x + this.width / 2`, `cy = this.y + this.height` (same pattern as enemy)

### Step 2.4 — Wire up Tower.upgrade()

Update the existing `upgrade()` method to also advance the animator tier:

```js
upgrade(upgradeType) {
  // ... existing stat upgrades ...
  if (this.currentTier < 3) {
    this.currentTier++;
    this.animator.setTier(this.currentTier);
  }
}
```

### Step 2.5 — Update Tower.initialize() and reset()

In `initialize()` and `reset()`, add:
```js
this.animator.reset(this.type, 1);
this.currentTier = 1;
```

---

## Phase 3: Add Church Tower Type to Config

**Goal:** Register the church tower in the game's config system.

### Step 3.1 — Add church tower to `Config.tower`

In `src/config.js`, add a new entry in `Config.tower`:

```js
church: {
  width: 45, height: 45,
  damage: 8, range: 150, fireRate: 1500,
  cost: 150, color: '#8a7a6a',
  projectileSpeed: 200,
  baseStats: { width: 22, height: 22, range: 150, dmg: 8 },
  upgrades: [
    { dmg: 18, range: 195, cost: 300 },
    { dmg: 35, range: 240, cost: 600 },
  ]
}
```

### Step 3.2 — Add church to `Config.sprites.tower`

```js
church: {
  sheet: '/assets/images/tower_church.png',
  frames: 4, frameWidth: 45, frameHeight: 45,
  color: '#8a7a6a'
}
```

### Step 3.3 — Add church tower to UI tower placement

Locate the tower selection UI in `src/core/game.js` or the relevant UI component. Add a button/option for placing church towers alongside basic, sniper, and rapid.

### Step 3.4 — Update entity manager tower spawning

In `src/core/entityManager.js`, ensure `spawnTower()` passes the type through so that `new Tower(x, y, 'church')` works. The existing code likely already handles arbitrary types since it reads from `Config.tower[type]`.

---

## Phase 4: Church Tower Special Mechanics

**Goal:** Implement support/healer behavior unique to church towers.

### Step 4.1 — Add healing aura to Tower.update()

For church-type towers, in the `update()` method add a healing tick:

```js
if (this.type === 'church') {
  this.healTimer += deltaTime;
  if (this.healTimer >= 1.0) { // heal once per second
    this.healTimer = 0;
    this.healNearbyTowers(entityManager);
  }
}
```

`healNearbyTowers()` should:
- Get all towers within `healRange` from entityManager
- This is a placeholder for future implementation — for now just emit an event

### Step 4.2 — Add blessing/fire animation as attack

Church towers attack by "blessing" — triggering divine damage. The fire animation should play the blessing sequence from `church_tower_config.json`. The projectile spawned can be a light beam instead of a physical projectile.

### Step 4.3 — T3 Holy Smite ability (future)

Add a cooldown-based ability for T3 church towers:
- 15-second cooldown
- AOE damage (150) + stun (1.5s) in radius 4.0
- Triggered automatically when 3+ enemies are in range

This is a stretch goal — implement the basic church tower first, add Holy Smite later.

---

## Phase 5: Particle System Extraction

**Goal:** Create a shared particle system usable by both towers and enemies.

### Step 5.1 — Create `src/entities/particleSystem.js`

Extract the particle logic from `enemyAnimator.js` into a shared module:

```js
export class Particle {
  constructor(x, y, config) { ... }
  update(deltaTime) { ... }
  draw(ctx) { ... }
  get alive() { return this.life > 0; }
}

export class ParticleEmitter {
  constructor() { this.particles = []; }
  emit(x, y, count, config) { ... }
  update(deltaTime) { ... }
  render(ctx, offsetX, offsetY) { ... }
  get activeCount() { ... }
}
```

### Step 5.2 — Update enemyAnimator.js to use shared particles

Replace the inline `_spawnParticles` and particle update logic in `enemyAnimator.js` with an imported `ParticleEmitter` instance.

### Step 5.3 — Use shared particles in towerAnimator.js

Church tower blessing effects, sniper arrow trails, basic tower fire flashes — all use the shared `ParticleEmitter`.

---

## Phase 6: Testing & Validation

### Step 6.1 — Visual regression test

Create a standalone HTML test page at `tests/tower_animation_test.html` that:
- Renders all 3 tower types at all 3 tiers side by side
- Has buttons to trigger idle → fire → idle transitions
- Displays frame counter and animation state

### Step 6.2 — Integration test

Write a Jest test at `tests/towerAnimator.test.js` that verifies:
- `TowerAnimator` initializes with correct defaults
- `setState(FIRE)` resets time and sets fireDone=false
- `update(dt)` advances time correctly
- `isFireComplete()` returns true after fire animation plays through
- `setTier(2)` changes internal part definitions
- `reset()` returns to clean state

### Step 6.3 — In-game smoke test

Run the game and verify:
- Towers render as animated sprites instead of colored rectangles
- Idle sway animation plays continuously
- Fire animation triggers when tower shoots
- Sniper T2 shows alternating archer fire pattern
- Sniper T3 shows volley fire pattern
- Church tower shows bell/blessing animation on fire
- Tower upgrade visually changes the tower model (T1 → T2 → T3)

---

## File Manifest

### Files to CREATE:
| File | Description |
|------|-------------|
| `src/entities/towerAnimator.js` | Tower animation engine (idle, fire, upgrade states) |
| `src/entities/particleSystem.js` | Shared particle system |
| `tests/towerAnimator.test.js` | Unit tests |
| `tests/tower_animation_test.html` | Visual test page |

### Files to MODIFY:
| File | Changes |
|------|---------|
| `src/entities/tower.js` | Import TowerAnimator, replace render(), wire fire/upgrade |
| `src/config.js` | Add `church` tower type |
| `src/entities/enemyAnimator.js` | Refactor to use shared particleSystem.js |
| `src/core/game.js` | Add church tower to UI placement options |

### Files to READ (reference only):
| File | Purpose |
|------|---------|
| `assets/towers/animation/sniper_tower_animations.jsx` | Sniper keyframes & part defs |
| `assets/towers/animation/church_tower_animations.jsx` | Church keyframes & part defs |
| `assets/towers/church_tower_config.json` | Church stats & animation config |
| `assets/towers/church_tower_generator.py` | Church 3D structure reference |
| `src/entities/enemyAnimator.js` | Pattern to follow |

---

## Execution Order

1. **Phase 1** (towerAnimator.js) — foundational, everything depends on this
2. **Phase 2** (tower.js integration) — makes animations visible in-game
3. **Phase 5** (particle system) — can be done in parallel with Phase 2
4. **Phase 3** (church config) — adds new tower type
5. **Phase 4** (church mechanics) — extends church with support abilities
6. **Phase 6** (testing) — validate everything works

## Notes
- The `basic` tower does NOT have a dedicated animation JSX file yet. Create simple idle sway + fire recoil keyframes based on the sniper T1 pattern (4 idle frames, 8 fire frames).
- The `rapid` tower type in Config is renamed/repurposed as needed — it currently has no animation assets.
- All canvas rendering uses the existing `renderer.ctx` 2D context — no Three.js or WebGL required.
- Keep draw calls minimal per tower — there will be many towers on screen simultaneously.

### Last Updated: 2026-02-10
