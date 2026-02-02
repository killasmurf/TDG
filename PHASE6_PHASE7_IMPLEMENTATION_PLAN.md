# Phase 6 & Phase 7 Implementation Plan

**Project:** Tower Defense Game (TDG)
**Created:** 2026-02-02
**Target Audience:** Junior Developer / AI Coding Assistant

---

## Prerequisites

Before starting, ensure:
1. Docker is installed and running
2. Node.js 20+ is available locally
3. You can run `docker build -t tdg-test .` successfully from the project root
4. All 5 Jest tests pass (spatialGrid.test.js: 3, waveManager.test.js: 2)

---

## Phase 6: Technical Debt & Wave UI

### Overview
Phase 6 focuses on fixing known bugs, improving test coverage, and adding wave progress UI elements.

---

### TASK 6.1: Fix onDeactivate Lifecycle Bug

**Priority:** CRITICAL
**Estimated Complexity:** Low
**Files to Modify:** `src/entities/baseEntity.js`

#### Problem
The `reset()` method should call `onDeactivate()` lifecycle hook, but it currently doesn't. This was discovered in Phase 2 tests.

#### Steps

1. **Read the current baseEntity.js file:**
   ```
   File: src/entities/baseEntity.js
   ```

2. **Find the `reset()` method** (approximately lines 50-70)

3. **Add `onDeactivate()` call at the START of reset():**
   ```javascript
   reset() {
       // ADD THIS LINE at the very beginning:
       this.onDeactivate();

       // ... existing reset code follows ...
   }
   ```

4. **Verify the fix:**
   - Run the phase2-architecture-test.js manually:
     ```bash
     node tests/phase2-architecture-test.js
     ```
   - Look for: "Enemy reset() calls onDeactivate() hook" - should now PASS
   - Expected result: 15/15 tests passing (was 14/15)

#### Acceptance Criteria
- [ ] `reset()` method calls `onDeactivate()` before resetting properties
- [ ] Phase 2 tests show 15/15 passing
- [ ] Docker build still succeeds

---

### TASK 6.2: Convert Legacy Tests to Jest Format

**Priority:** Medium
**Estimated Complexity:** Medium
**Files to Modify:**
- `tests/phase1-bugfixes-test.js`
- `tests/phase2-architecture-test.js`
- `tests/phase3-event-system-test.js`

#### Problem
These test files use `console.log()` assertions and `process.exit()` instead of Jest's `describe/test/expect` pattern. This breaks Jest's worker processes.

#### Steps for EACH test file:

1. **Rename the file** to use `.test.js` suffix:
   - `phase1-bugfixes-test.js` → `phase1-bugfixes.test.js`
   - `phase2-architecture-test.js` → `phase2-architecture.test.js`
   - `phase3-event-system-test.js` → `phase3-event-system.test.js`

2. **Convert the test structure:**

   **BEFORE (old pattern):**
   ```javascript
   console.log('Test 1: Projectile Damage Default');
   const projectile1 = new Projectile(0, 0, null);
   if (projectile1.damage === expectedDamage) {
       console.log('PASS');
   } else {
       console.log('FAIL');
   }
   ```

   **AFTER (Jest pattern):**
   ```javascript
   describe('Phase 1 Bug Fixes', () => {
       test('Projectile damage uses Config.projectile.damage', () => {
           const projectile = new Projectile(0, 0, null);
           expect(projectile.damage).toBe(Config.projectile.damage);
       });
   });
   ```

3. **Remove all `process.exit()` calls** - Jest handles test success/failure automatically

4. **Remove manual test counters** - Jest counts tests automatically

5. **Keep all imports at the top** - they already use ES modules which is correct

#### Template for Conversion

```javascript
// TEMPLATE: Converting a legacy test file to Jest format

// Keep existing imports
import Enemy from '../src/entities/enemy.js';
import Config from '../src/config.js';
// ... other imports

describe('Phase X: [Description]', () => {

    // Group related tests
    describe('Enemy Tests', () => {

        test('enemy health resets to type-specific value', () => {
            const enemy = new Enemy(0, 0, 'basic');
            enemy.health = 50; // damage it
            enemy.reset('basic');
            expect(enemy.health).toBe(Config.enemy.basic.health);
        });

        test('enemy type changes on reset', () => {
            const enemy = new Enemy(0, 0, 'basic');
            enemy.reset('tank');
            expect(enemy.type).toBe('tank');
            expect(enemy.health).toBe(Config.enemy.tank.health);
        });
    });

    describe('Tower Tests', () => {
        test('tower has fireTimer initialized to 0', () => {
            const tower = new Tower(0, 0, 'basic');
            expect(tower.fireTimer).toBe(0);
        });
    });
});
```

#### Acceptance Criteria
- [ ] All three test files renamed to `.test.js` suffix
- [ ] All tests converted to Jest `describe/test/expect` pattern
- [ ] No `process.exit()` calls remain
- [ ] No `console.log()` used for assertions (console.log for debugging is OK)
- [ ] `npm test` runs all tests successfully
- [ ] Docker build passes

---

### TASK 6.3: Add Wave Progress UI

**Priority:** High
**Estimated Complexity:** Medium
**Files to Modify:**
- `src/core/waveManager.js`
- `src/core/game.js`
- `src/core/renderer.js`
- `index.html`

#### Objective
Display wave progress information to the player:
- Current wave number / total waves
- Enemies remaining in current wave
- Visual indicator when wave is active

#### Step 6.3.1: Add Wave Stats Methods to WaveManager

**File:** `src/core/waveManager.js`

Add these getter methods to the WaveManager class:

```javascript
// Add after constructor or at end of class

/**
 * Get current wave number (1-indexed for display)
 * @returns {number}
 */
getCurrentWaveNumber() {
    return this.currentWaveIndex + 1;
}

/**
 * Get total number of waves
 * @returns {number}
 */
getTotalWaves() {
    return this.waves.length;
}

/**
 * Get number of enemies remaining in current wave
 * @returns {number}
 */
getEnemiesRemaining() {
    return this.enemiesRemaining || 0;
}

/**
 * Get total enemies in current wave
 * @returns {number}
 */
getTotalEnemiesInWave() {
    if (this.currentWaveIndex < 0 || this.currentWaveIndex >= this.waves.length) {
        return 0;
    }
    const wave = this.waves[this.currentWaveIndex];
    return wave.enemies.reduce((sum, e) => sum + e.count, 0);
}

/**
 * Check if all waves are completed
 * @returns {boolean}
 */
isAllWavesComplete() {
    return this.currentWaveIndex >= this.waves.length && !this.isWaveActive;
}
```

#### Step 6.3.2: Update Renderer to Display Wave Info

**File:** `src/core/renderer.js`

Find the `renderHUD()` method and add wave information display:

```javascript
// Inside renderHUD() method, add after existing HUD elements:

renderWaveInfo(waveManager) {
    const ctx = this.ctx;
    const x = this.canvas.width - 150;
    const y = 20;

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';

    // Wave counter
    ctx.fillText(
        `Wave: ${waveManager.getCurrentWaveNumber()}/${waveManager.getTotalWaves()}`,
        x, y
    );

    // Enemies remaining (only show during active wave)
    if (waveManager.isWaveActive) {
        ctx.fillText(
            `Enemies: ${waveManager.getEnemiesRemaining()}/${waveManager.getTotalEnemiesInWave()}`,
            x, y + 20
        );

        // Wave active indicator
        ctx.fillStyle = '#00ff00';
        ctx.fillText('WAVE IN PROGRESS', x, y + 40);
    } else if (waveManager.isAllWavesComplete()) {
        ctx.fillStyle = '#ffff00';
        ctx.fillText('ALL WAVES COMPLETE!', x, y + 20);
    } else {
        ctx.fillStyle = '#888888';
        ctx.fillText('Press Start Wave', x, y + 20);
    }
}
```

#### Step 6.3.3: Call renderWaveInfo from Game Loop

**File:** `src/core/game.js`

In the `render()` method, add call to wave info renderer:

```javascript
// Inside render() method, after other HUD rendering:
this.renderer.renderWaveInfo(this.waveManager);
```

#### Step 6.3.4: Add Wave Complete Event Handling

**File:** `src/core/waveManager.js`

Ensure wave completion emits an event:

```javascript
// In the update() method, when wave completes:
if (this.enemiesRemaining <= 0 && this.spawnQueue.length === 0) {
    this.isWaveActive = false;

    // ADD: Emit wave completed event
    if (this.entityManager && this.entityManager.events) {
        this.entityManager.events.emit('WAVE_COMPLETED', {
            waveNumber: this.currentWaveIndex + 1,
            totalWaves: this.waves.length
        });
    }
}
```

#### Acceptance Criteria
- [ ] Wave number displays as "Wave: X/Y" format
- [ ] Enemy count shows during active wave
- [ ] "WAVE IN PROGRESS" indicator visible during wave
- [ ] "ALL WAVES COMPLETE!" shows after final wave
- [ ] Wave info updates in real-time as enemies are killed
- [ ] Docker build passes

---

### TASK 6.4: Write Jest Tests for Wave UI

**Priority:** Medium
**Estimated Complexity:** Low
**Files to Create:** `tests/waveUI.test.js`

```javascript
import WaveManager from '../src/core/waveManager.js';

class MockEntityManager {
    constructor() {
        this.enemies = [];
        this.path = [{x:0, y:0}];
        this.listeners = {};
        this.events = {
            emit: jest.fn()
        };
    }
    spawnEnemy(type, path) {
        this.enemies.push({type, path, active: true});
    }
    on(event, callback) {
        this.listeners[event] = callback;
    }
    off(event) {
        delete this.listeners[event];
    }
}

describe('WaveManager UI Methods', () => {
    const waves = [
        { name: 'Wave 1', enemies: [{type: 'basic', count: 5, interval: 1}] },
        { name: 'Wave 2', enemies: [{type: 'basic', count: 3, interval: 1}] }
    ];

    let mockEm;
    let wm;

    beforeEach(() => {
        mockEm = new MockEntityManager();
        wm = new WaveManager(mockEm, waves);
    });

    test('getCurrentWaveNumber returns 1-indexed wave', () => {
        expect(wm.getCurrentWaveNumber()).toBe(1);
        wm.startNextWave();
        expect(wm.getCurrentWaveNumber()).toBe(1);
    });

    test('getTotalWaves returns correct count', () => {
        expect(wm.getTotalWaves()).toBe(2);
    });

    test('getTotalEnemiesInWave returns sum of enemy counts', () => {
        wm.startNextWave();
        expect(wm.getTotalEnemiesInWave()).toBe(5);
    });

    test('isAllWavesComplete returns false when waves remain', () => {
        expect(wm.isAllWavesComplete()).toBe(false);
    });
});
```

#### Acceptance Criteria
- [ ] Test file created at `tests/waveUI.test.js`
- [ ] All new tests pass
- [ ] Docker build passes

---

## Phase 7: Tower Upgrade System

### Overview
Phase 7 adds the ability to upgrade towers, increasing their effectiveness at a gold cost.

---

### TASK 7.1: Define Upgrade Configuration

**Priority:** High
**Estimated Complexity:** Low
**Files to Modify:** `src/config.js`

#### Steps

Add upgrade definitions to the Config object:

```javascript
// Add to src/config.js inside the Config object:

upgrades: {
    // Upgrade costs increase with each level
    costMultiplier: 1.5,  // Each upgrade costs 1.5x the previous

    // Maximum upgrade level for any stat
    maxLevel: 3,

    // Tower upgrade paths
    tower: {
        basic: {
            damage: {
                baseCost: 25,
                increase: 5,  // +5 damage per level
                description: 'Increases damage'
            },
            range: {
                baseCost: 30,
                increase: 20,  // +20 range per level
                description: 'Increases attack range'
            },
            fireRate: {
                baseCost: 35,
                decrease: 100,  // -100ms per level (faster)
                description: 'Increases fire rate'
            }
        },
        sniper: {
            damage: {
                baseCost: 50,
                increase: 25,
                description: 'Increases damage'
            },
            range: {
                baseCost: 40,
                increase: 30,
                description: 'Increases attack range'
            },
            fireRate: {
                baseCost: 60,
                decrease: 200,
                description: 'Increases fire rate'
            }
        },
        rapid: {
            damage: {
                baseCost: 20,
                increase: 2,
                description: 'Increases damage'
            },
            range: {
                baseCost: 25,
                increase: 15,
                description: 'Increases attack range'
            },
            fireRate: {
                baseCost: 40,
                decrease: 20,
                description: 'Increases fire rate'
            }
        }
    }
}
```

#### Acceptance Criteria
- [ ] Upgrade config added to `src/config.js`
- [ ] All three tower types have upgrade paths defined
- [ ] Cost multiplier and max level configured
- [ ] Game still loads without errors

---

### TASK 7.2: Add Upgrade Tracking to Tower Class

**Priority:** High
**Estimated Complexity:** Medium
**Files to Modify:** `src/entities/tower.js`

#### Steps

1. **Add upgrade level tracking in constructor:**

```javascript
// In Tower constructor, add after existing property assignments:

// Upgrade levels (0 = base, 1-3 = upgraded)
this.upgradeLevels = {
    damage: 0,
    range: 0,
    fireRate: 0
};
```

2. **Add upgrade methods:**

```javascript
/**
 * Get the cost to upgrade a specific stat
 * @param {string} stat - 'damage', 'range', or 'fireRate'
 * @returns {number} - Cost in gold, or -1 if max level
 */
getUpgradeCost(stat) {
    const currentLevel = this.upgradeLevels[stat];
    if (currentLevel >= Config.upgrades.maxLevel) {
        return -1; // Already at max level
    }

    const upgradeConfig = Config.upgrades.tower[this.type][stat];
    const baseCost = upgradeConfig.baseCost;
    const multiplier = Math.pow(Config.upgrades.costMultiplier, currentLevel);

    return Math.floor(baseCost * multiplier);
}

/**
 * Check if tower can be upgraded
 * @param {string} stat - 'damage', 'range', or 'fireRate'
 * @param {number} availableGold - Player's current gold
 * @returns {boolean}
 */
canUpgrade(stat, availableGold) {
    const cost = this.getUpgradeCost(stat);
    return cost > 0 && availableGold >= cost;
}

/**
 * Apply an upgrade to the tower
 * @param {string} stat - 'damage', 'range', or 'fireRate'
 * @returns {boolean} - True if upgrade was applied
 */
applyUpgrade(stat) {
    if (this.upgradeLevels[stat] >= Config.upgrades.maxLevel) {
        return false;
    }

    const upgradeConfig = Config.upgrades.tower[this.type][stat];

    switch (stat) {
        case 'damage':
            this.damage += upgradeConfig.increase;
            break;
        case 'range':
            this.range += upgradeConfig.increase;
            break;
        case 'fireRate':
            this.fireRate = Math.max(100, this.fireRate - upgradeConfig.decrease);
            break;
        default:
            return false;
    }

    this.upgradeLevels[stat]++;

    // Emit upgrade event
    if (this.events) {
        this.events.emit('TOWER_UPGRADED', {
            tower: this,
            stat: stat,
            newLevel: this.upgradeLevels[stat],
            newValue: this[stat === 'fireRate' ? 'fireRate' : stat]
        });
    }

    return true;
}

/**
 * Get total upgrade level (sum of all stat levels)
 * @returns {number}
 */
getTotalUpgradeLevel() {
    return this.upgradeLevels.damage +
           this.upgradeLevels.range +
           this.upgradeLevels.fireRate;
}
```

3. **Update initialize() method to reset upgrades:**

```javascript
// In initialize() method, add:
this.upgradeLevels = {
    damage: 0,
    range: 0,
    fireRate: 0
};
```

#### Acceptance Criteria
- [ ] Tower tracks upgrade levels for damage, range, fireRate
- [ ] `getUpgradeCost()` returns correct cost based on level
- [ ] `canUpgrade()` checks both level limit and gold
- [ ] `applyUpgrade()` modifies tower stats correctly
- [ ] Upgrade event is emitted when upgrade applied
- [ ] `initialize()` resets upgrade levels

---

### TASK 7.3: Add TOWER_UPGRADED Event Type

**Priority:** Medium
**Estimated Complexity:** Low
**Files to Modify:** `src/core/EventEmitter.js`

#### Steps

Add new event type to GameEvents:

```javascript
// In GameEvents object, add:
TOWER_UPGRADED: 'tower:upgraded',
```

#### Acceptance Criteria
- [ ] `TOWER_UPGRADED` event type defined
- [ ] Event can be emitted and listened to

---

### TASK 7.4: Create Upgrade Manager Class

**Priority:** High
**Estimated Complexity:** Medium
**Files to Create:** `src/core/upgradeManager.js`

```javascript
/**
 * UpgradeManager - Handles tower upgrade transactions
 */
import Config from '../config.js';
import { gameEvents, GameEvents } from './EventEmitter.js';

export default class UpgradeManager {
    /**
     * @param {Game} game - Reference to main game instance
     */
    constructor(game) {
        this.game = game;
        this.selectedTower = null;
    }

    /**
     * Select a tower for potential upgrade
     * @param {Tower} tower
     */
    selectTower(tower) {
        this.selectedTower = tower;
        gameEvents.emit('TOWER_SELECTED', { tower });
    }

    /**
     * Deselect the currently selected tower
     */
    deselectTower() {
        this.selectedTower = null;
        gameEvents.emit('TOWER_DESELECTED', {});
    }

    /**
     * Attempt to upgrade the selected tower
     * @param {string} stat - 'damage', 'range', or 'fireRate'
     * @returns {boolean} - True if upgrade succeeded
     */
    upgradeTower(stat) {
        if (!this.selectedTower) {
            console.warn('No tower selected for upgrade');
            return false;
        }

        const cost = this.selectedTower.getUpgradeCost(stat);

        if (cost < 0) {
            console.warn(`Tower ${stat} already at max level`);
            return false;
        }

        if (this.game.gold < cost) {
            console.warn(`Not enough gold. Need ${cost}, have ${this.game.gold}`);
            return false;
        }

        // Deduct cost
        this.game.gold -= cost;
        gameEvents.emit(GameEvents.GOLD_CHANGED, {
            gold: this.game.gold,
            change: -cost,
            reason: 'upgrade'
        });

        // Apply upgrade
        this.selectedTower.applyUpgrade(stat);

        return true;
    }

    /**
     * Get upgrade info for UI display
     * @returns {Object|null}
     */
    getSelectedTowerInfo() {
        if (!this.selectedTower) {
            return null;
        }

        const tower = this.selectedTower;
        return {
            type: tower.type,
            position: { x: tower.x, y: tower.y },
            stats: {
                damage: {
                    current: tower.damage,
                    level: tower.upgradeLevels.damage,
                    maxLevel: Config.upgrades.maxLevel,
                    upgradeCost: tower.getUpgradeCost('damage'),
                    canUpgrade: tower.canUpgrade('damage', this.game.gold)
                },
                range: {
                    current: tower.range,
                    level: tower.upgradeLevels.range,
                    maxLevel: Config.upgrades.maxLevel,
                    upgradeCost: tower.getUpgradeCost('range'),
                    canUpgrade: tower.canUpgrade('range', this.game.gold)
                },
                fireRate: {
                    current: tower.fireRate,
                    level: tower.upgradeLevels.fireRate,
                    maxLevel: Config.upgrades.maxLevel,
                    upgradeCost: tower.getUpgradeCost('fireRate'),
                    canUpgrade: tower.canUpgrade('fireRate', this.game.gold)
                }
            },
            totalUpgradeLevel: tower.getTotalUpgradeLevel()
        };
    }
}
```

#### Acceptance Criteria
- [ ] File created at `src/core/upgradeManager.js`
- [ ] Tower selection/deselection works
- [ ] Upgrade transaction deducts gold correctly
- [ ] Upgrade fails gracefully when insufficient gold
- [ ] `getSelectedTowerInfo()` returns formatted data for UI

---

### TASK 7.5: Integrate UpgradeManager into Game

**Priority:** High
**Estimated Complexity:** Low
**Files to Modify:** `src/core/game.js`

#### Steps

1. **Import UpgradeManager:**
```javascript
import UpgradeManager from './upgradeManager.js';
```

2. **Create instance in constructor:**
```javascript
// In Game constructor:
this.upgradeManager = new UpgradeManager(this);
```

3. **Add tower click handling:**
```javascript
// In input handling section, add tower click detection:
handleTowerClick(x, y) {
    // Find tower at click position
    const clickedTower = this.entityManager.towers.find(tower => {
        if (!tower.active) return false;
        const dx = tower.x - x;
        const dy = tower.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= tower.width / 2;
    });

    if (clickedTower) {
        this.upgradeManager.selectTower(clickedTower);
    } else {
        this.upgradeManager.deselectTower();
    }
}
```

#### Acceptance Criteria
- [ ] UpgradeManager instantiated in Game
- [ ] Clicking on tower selects it
- [ ] Clicking elsewhere deselects tower

---

### TASK 7.6: Add Upgrade UI Panel

**Priority:** High
**Estimated Complexity:** Medium
**Files to Modify:**
- `src/core/renderer.js`
- `index.html`

#### Step 7.6.1: Add UI Panel to Renderer

```javascript
// Add to renderer.js:

/**
 * Render tower upgrade panel
 * @param {Object} towerInfo - From upgradeManager.getSelectedTowerInfo()
 */
renderUpgradePanel(towerInfo) {
    if (!towerInfo) return;

    const ctx = this.ctx;
    const panelX = 10;
    const panelY = this.canvas.height - 150;
    const panelWidth = 200;
    const panelHeight = 140;

    // Panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${towerInfo.type.toUpperCase()} TOWER`, panelX + 10, panelY + 20);

    // Stats
    ctx.font = '12px Arial';
    let yOffset = 40;

    for (const [stat, info] of Object.entries(towerInfo.stats)) {
        const displayName = stat === 'fireRate' ? 'Fire Rate' :
                           stat.charAt(0).toUpperCase() + stat.slice(1);

        // Stat name and value
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${displayName}: ${info.current}`, panelX + 10, panelY + yOffset);

        // Level indicator
        ctx.fillText(`Lv.${info.level}/${info.maxLevel}`, panelX + 100, panelY + yOffset);

        // Upgrade cost (if available)
        if (info.upgradeCost > 0) {
            ctx.fillStyle = info.canUpgrade ? '#00ff00' : '#ff0000';
            ctx.fillText(`[${info.upgradeCost}g]`, panelX + 150, panelY + yOffset);
        } else {
            ctx.fillStyle = '#888888';
            ctx.fillText('[MAX]', panelX + 150, panelY + yOffset);
        }

        yOffset += 25;
    }

    // Instructions
    ctx.fillStyle = '#888888';
    ctx.font = '10px Arial';
    ctx.fillText('Press 1/2/3 to upgrade Dmg/Rng/Rate', panelX + 10, panelY + 130);
}
```

#### Step 7.6.2: Add Keyboard Input for Upgrades

**File:** `src/core/input.js` or `src/core/game.js`

```javascript
// Add keyboard listener for upgrade keys:
handleUpgradeInput(key) {
    if (!this.upgradeManager.selectedTower) return;

    switch (key) {
        case '1':
            this.upgradeManager.upgradeTower('damage');
            break;
        case '2':
            this.upgradeManager.upgradeTower('range');
            break;
        case '3':
            this.upgradeManager.upgradeTower('fireRate');
            break;
        case 'Escape':
            this.upgradeManager.deselectTower();
            break;
    }
}

// In keyboard event listener:
document.addEventListener('keydown', (e) => {
    if (['1', '2', '3', 'Escape'].includes(e.key)) {
        this.handleUpgradeInput(e.key);
    }
});
```

#### Acceptance Criteria
- [ ] Upgrade panel appears when tower selected
- [ ] Panel shows current stats and levels
- [ ] Upgrade costs displayed with affordability color
- [ ] Keys 1/2/3 trigger upgrades
- [ ] Escape key deselects tower
- [ ] Panel disappears when tower deselected

---

### TASK 7.7: Visual Upgrade Indicators on Towers

**Priority:** Medium
**Estimated Complexity:** Low
**Files to Modify:** `src/entities/tower.js` or `src/core/renderer.js`

#### Steps

Modify tower rendering to show upgrade level:

```javascript
// In tower render() method or renderer.renderTower():

renderTowerUpgradeIndicator(tower) {
    const totalLevel = tower.getTotalUpgradeLevel();
    if (totalLevel === 0) return;

    const ctx = this.ctx;

    // Draw small stars/pips based on total upgrade level
    const colors = ['#ffff00', '#ff8800', '#ff0000']; // Yellow, Orange, Red
    const pipSize = 4;
    const spacing = 6;
    const startX = tower.x - (totalLevel * spacing) / 2;
    const startY = tower.y - tower.height / 2 - 8;

    for (let i = 0; i < totalLevel; i++) {
        ctx.fillStyle = colors[Math.min(i, colors.length - 1)];
        ctx.beginPath();
        ctx.arc(startX + i * spacing, startY, pipSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}
```

#### Acceptance Criteria
- [ ] Upgraded towers have visual indicator
- [ ] Number of indicators matches total upgrade level
- [ ] Indicators are visible but not obtrusive

---

### TASK 7.8: Write Jest Tests for Upgrade System

**Priority:** Medium
**Estimated Complexity:** Medium
**Files to Create:** `tests/upgradeSystem.test.js`

```javascript
import Tower from '../src/entities/tower.js';
import Config from '../src/config.js';

// Mock the events
const mockEvents = {
    emit: jest.fn()
};

describe('Tower Upgrade System', () => {
    let tower;

    beforeEach(() => {
        tower = new Tower(100, 100, 'basic');
        tower.events = mockEvents;
        mockEvents.emit.mockClear();
    });

    describe('Upgrade Levels', () => {
        test('tower starts with all upgrades at level 0', () => {
            expect(tower.upgradeLevels.damage).toBe(0);
            expect(tower.upgradeLevels.range).toBe(0);
            expect(tower.upgradeLevels.fireRate).toBe(0);
        });

        test('getTotalUpgradeLevel returns sum of all levels', () => {
            expect(tower.getTotalUpgradeLevel()).toBe(0);
            tower.upgradeLevels.damage = 2;
            tower.upgradeLevels.range = 1;
            expect(tower.getTotalUpgradeLevel()).toBe(3);
        });
    });

    describe('Upgrade Costs', () => {
        test('getUpgradeCost returns base cost at level 0', () => {
            const expectedCost = Config.upgrades.tower.basic.damage.baseCost;
            expect(tower.getUpgradeCost('damage')).toBe(expectedCost);
        });

        test('getUpgradeCost returns -1 at max level', () => {
            tower.upgradeLevels.damage = Config.upgrades.maxLevel;
            expect(tower.getUpgradeCost('damage')).toBe(-1);
        });

        test('getUpgradeCost increases with level', () => {
            const cost0 = tower.getUpgradeCost('damage');
            tower.upgradeLevels.damage = 1;
            const cost1 = tower.getUpgradeCost('damage');
            expect(cost1).toBeGreaterThan(cost0);
        });
    });

    describe('Applying Upgrades', () => {
        test('applyUpgrade increases damage', () => {
            const initialDamage = tower.damage;
            tower.applyUpgrade('damage');
            expect(tower.damage).toBeGreaterThan(initialDamage);
            expect(tower.upgradeLevels.damage).toBe(1);
        });

        test('applyUpgrade increases range', () => {
            const initialRange = tower.range;
            tower.applyUpgrade('range');
            expect(tower.range).toBeGreaterThan(initialRange);
            expect(tower.upgradeLevels.range).toBe(1);
        });

        test('applyUpgrade decreases fireRate (faster)', () => {
            const initialFireRate = tower.fireRate;
            tower.applyUpgrade('fireRate');
            expect(tower.fireRate).toBeLessThan(initialFireRate);
            expect(tower.upgradeLevels.fireRate).toBe(1);
        });

        test('applyUpgrade emits TOWER_UPGRADED event', () => {
            tower.applyUpgrade('damage');
            expect(mockEvents.emit).toHaveBeenCalledWith(
                'TOWER_UPGRADED',
                expect.objectContaining({
                    tower: tower,
                    stat: 'damage',
                    newLevel: 1
                })
            );
        });

        test('applyUpgrade returns false at max level', () => {
            tower.upgradeLevels.damage = Config.upgrades.maxLevel;
            const result = tower.applyUpgrade('damage');
            expect(result).toBe(false);
        });
    });

    describe('canUpgrade', () => {
        test('returns true when gold is sufficient', () => {
            const cost = tower.getUpgradeCost('damage');
            expect(tower.canUpgrade('damage', cost)).toBe(true);
            expect(tower.canUpgrade('damage', cost + 100)).toBe(true);
        });

        test('returns false when gold is insufficient', () => {
            const cost = tower.getUpgradeCost('damage');
            expect(tower.canUpgrade('damage', cost - 1)).toBe(false);
        });

        test('returns false at max level regardless of gold', () => {
            tower.upgradeLevels.damage = Config.upgrades.maxLevel;
            expect(tower.canUpgrade('damage', 9999)).toBe(false);
        });
    });
});
```

#### Acceptance Criteria
- [ ] Test file created at `tests/upgradeSystem.test.js`
- [ ] All tests pass
- [ ] Tests cover: level tracking, costs, applying upgrades, events
- [ ] Docker build passes

---

## Final Checklist

### Phase 6 Complete When:
- [ ] onDeactivate bug fixed
- [ ] Legacy tests converted to Jest format
- [ ] Wave progress UI displays correctly
- [ ] All Jest tests pass (original + new)
- [ ] Docker build succeeds

### Phase 7 Complete When:
- [ ] Upgrade config defined in Config.js
- [ ] Tower class has upgrade methods
- [ ] UpgradeManager class created
- [ ] Upgrade UI panel renders
- [ ] Keyboard shortcuts work (1/2/3/Escape)
- [ ] Visual upgrade indicators show on towers
- [ ] All Jest tests pass (original + new)
- [ ] Docker build succeeds

---

## Testing Commands

```bash
# Run all tests locally (requires Node.js)
npm test

# Build and test in Docker
docker build -t tdg-test .

# Run the game locally
npm start

# Run specific test file
npm test -- tests/upgradeSystem.test.js
```

---

## Troubleshooting

### "Cannot use import statement outside a module"
- Ensure `package.json` has `"type": "module"`
- Ensure test script uses `--experimental-vm-modules`

### "process.exit() called" errors in tests
- Remove any `process.exit()` calls from test files
- Let Jest handle test pass/fail

### Docker build fails on COPY package.json
- Check `.dockerignore` doesn't exclude `package.json`
- Ensure negation patterns (`!package.json`) are present

### Tower upgrade not working
- Check tower has `events` reference
- Check `Config.upgrades.tower[type]` exists for tower type
- Check upgrade level isn't already at max

---

## File Summary

### Files to Create (Phase 6 & 7):
- `tests/waveUI.test.js`
- `src/core/upgradeManager.js`
- `tests/upgradeSystem.test.js`

### Files to Modify (Phase 6):
- `src/entities/baseEntity.js` (fix onDeactivate)
- `tests/phase1-bugfixes-test.js` → `tests/phase1-bugfixes.test.js`
- `tests/phase2-architecture-test.js` → `tests/phase2-architecture.test.js`
- `tests/phase3-event-system-test.js` → `tests/phase3-event-system.test.js`
- `src/core/waveManager.js` (add UI methods)
- `src/core/renderer.js` (add wave info render)
- `src/core/game.js` (call wave info render)

### Files to Modify (Phase 7):
- `src/config.js` (add upgrade config)
- `src/entities/tower.js` (add upgrade methods)
- `src/core/EventEmitter.js` (add TOWER_UPGRADED)
- `src/core/game.js` (integrate UpgradeManager)
- `src/core/renderer.js` (add upgrade panel)
- `src/core/input.js` (add upgrade keys)

---

**End of Implementation Plan**
