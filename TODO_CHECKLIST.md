# TDG Phase 6 & 7 - Quick Reference Checklist

Use this checklist to track progress. Check off items as you complete them.

---

## Phase 6: Technical Debt & Wave UI

### 6.1 Fix onDeactivate Bug
- [ ] Open `src/entities/baseEntity.js`
- [ ] Find `reset()` method
- [ ] Add `this.onDeactivate();` at the START of reset()
- [ ] Run `node tests/phase2-architecture-test.js` - expect 15/15 pass

### 6.2 Convert Legacy Tests
- [ ] Rename `tests/phase1-bugfixes-test.js` to `tests/phase1-bugfixes.test.js`
- [ ] Convert to Jest describe/test/expect pattern
- [ ] Remove all `process.exit()` calls
- [ ] Rename `tests/phase2-architecture-test.js` to `tests/phase2-architecture.test.js`
- [ ] Convert to Jest describe/test/expect pattern
- [ ] Remove all `process.exit()` calls
- [ ] Rename `tests/phase3-event-system-test.js` to `tests/phase3-event-system.test.js`
- [ ] Convert to Jest describe/test/expect pattern
- [ ] Remove all `process.exit()` calls
- [ ] Run `npm test` - all tests should pass

### 6.3 Wave Progress UI
- [ ] Add getter methods to `src/core/waveManager.js`:
  - [ ] `getCurrentWaveNumber()`
  - [ ] `getTotalWaves()`
  - [ ] `getEnemiesRemaining()`
  - [ ] `getTotalEnemiesInWave()`
  - [ ] `isAllWavesComplete()`
- [ ] Add `renderWaveInfo()` to `src/core/renderer.js`
- [ ] Call `renderWaveInfo()` from game loop in `src/core/game.js`
- [ ] Add WAVE_COMPLETED event emission in waveManager

### 6.4 Wave UI Tests
- [ ] Create `tests/waveUI.test.js`
- [ ] Add tests for all new WaveManager methods
- [ ] Run `npm test` - all tests pass
- [ ] Run `docker build -t tdg-test .` - build succeeds

---

## Phase 7: Tower Upgrade System

### 7.1 Upgrade Config
- [ ] Open `src/config.js`
- [ ] Add `upgrades` section with costMultiplier, maxLevel
- [ ] Add tower upgrade paths for basic, sniper, rapid
- [ ] Verify game still loads

### 7.2 Tower Upgrade Methods
- [ ] Open `src/entities/tower.js`
- [ ] Add `upgradeLevels` object in constructor
- [ ] Add `getUpgradeCost(stat)` method
- [ ] Add `canUpgrade(stat, gold)` method
- [ ] Add `applyUpgrade(stat)` method
- [ ] Add `getTotalUpgradeLevel()` method
- [ ] Update `initialize()` to reset upgradeLevels

### 7.3 Add Event Type
- [ ] Open `src/core/EventEmitter.js`
- [ ] Add `TOWER_UPGRADED: 'tower:upgraded'` to GameEvents
- [ ] Add `TOWER_SELECTED: 'tower:selected'` to GameEvents
- [ ] Add `TOWER_DESELECTED: 'tower:deselected'` to GameEvents

### 7.4 UpgradeManager Class
- [ ] Create `src/core/upgradeManager.js`
- [ ] Implement constructor with game reference
- [ ] Implement `selectTower(tower)`
- [ ] Implement `deselectTower()`
- [ ] Implement `upgradeTower(stat)`
- [ ] Implement `getSelectedTowerInfo()`

### 7.5 Game Integration
- [ ] Import UpgradeManager in `src/core/game.js`
- [ ] Create instance in Game constructor
- [ ] Add `handleTowerClick(x, y)` method
- [ ] Wire up click events to tower selection

### 7.6 Upgrade UI
- [ ] Add `renderUpgradePanel()` to `src/core/renderer.js`
- [ ] Call `renderUpgradePanel()` in game render loop
- [ ] Add keyboard handler for 1/2/3/Escape keys
- [ ] Wire up keys to upgradeManager methods

### 7.7 Visual Indicators
- [ ] Add `renderTowerUpgradeIndicator()` to renderer
- [ ] Show pips/stars above upgraded towers
- [ ] Different colors for upgrade levels

### 7.8 Upgrade Tests
- [ ] Create `tests/upgradeSystem.test.js`
- [ ] Test upgrade level tracking
- [ ] Test upgrade cost calculation
- [ ] Test applying upgrades
- [ ] Test canUpgrade logic
- [ ] Test event emission
- [ ] Run `npm test` - all tests pass
- [ ] Run `docker build -t tdg-test .` - build succeeds

---

## Final Verification

### Phase 6 Complete
- [ ] onDeactivate bug fixed (phase2 tests: 15/15)
- [ ] All legacy tests converted to Jest
- [ ] Wave UI shows wave progress
- [ ] `npm test` passes all tests
- [ ] `docker build -t tdg-test .` succeeds

### Phase 7 Complete
- [ ] Tower upgrades work via keyboard (1/2/3)
- [ ] Gold is deducted correctly
- [ ] Upgrade panel shows when tower selected
- [ ] Visual indicators appear on upgraded towers
- [ ] Max level prevents further upgrades
- [ ] `npm test` passes all tests
- [ ] `docker build -t tdg-test .` succeeds

---

## Quick Commands

```bash
# Run tests
npm test

# Run single test file
npm test -- tests/upgradeSystem.test.js

# Docker build (includes tests)
docker build -t tdg-test .

# Start game locally
npm start
```

---

## File Quick Reference

| Task | File |
|------|------|
| onDeactivate fix | `src/entities/baseEntity.js` |
| Upgrade config | `src/config.js` |
| Tower upgrades | `src/entities/tower.js` |
| Event types | `src/core/EventEmitter.js` |
| Upgrade manager | `src/core/upgradeManager.js` (new) |
| Wave UI methods | `src/core/waveManager.js` |
| UI rendering | `src/core/renderer.js` |
| Game integration | `src/core/game.js` |
| Input handling | `src/core/input.js` |
