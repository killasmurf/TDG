/**
 * Phase 2 Architecture Improvements Tests
 * Tests for initialize() methods, lifecycle hooks, and circular reference removal
 */

import Enemy from '../src/entities/enemy.js';
import Tower from '../src/entities/tower.js';
import Projectile from '../src/entities/projectile.js';
import BaseEntity from '../src/entities/baseEntity.js';
import EntityManager from '../src/core/entityManager.js';
import Config from '../src/config.js';

// Test counter
let testsRun = 0;
let testsPassed = 0;

// Helper function to run tests
function test(name, fn) {
    testsRun++;
    try {
        fn();
        testsPassed++;
        console.log(`✅ ${name}`);
    } catch (error) {
        console.error(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
    }
}

// Helper function for assertions
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

console.log('\n=== Phase 2: Architecture Improvements Tests ===\n');

// ========================================
// Test 1: BaseEntity lifecycle hooks exist
// ========================================
test('BaseEntity has lifecycle hook methods', () => {
    const entity = new BaseEntity(0, 0, 10, 10);

    assert(typeof entity.initialize === 'function', 'BaseEntity should have initialize() method');
    assert(typeof entity.onSpawn === 'function', 'BaseEntity should have onSpawn() method');
    assert(typeof entity.onDeactivate === 'function', 'BaseEntity should have onDeactivate() method');
    assert(typeof entity.onDestroy === 'function', 'BaseEntity should have onDestroy() method');
    assert(typeof entity.destroy === 'function', 'BaseEntity should have destroy() method');
});

// ========================================
// Test 2: BaseEntity pooled flag
// ========================================
test('BaseEntity has pooled flag', () => {
    const entity = new BaseEntity(0, 0, 10, 10);

    assert(entity.pooled === false, 'BaseEntity should start with pooled=false');

    entity.reset();
    assert(entity.pooled === true, 'BaseEntity.reset() should set pooled=true');
});

// ========================================
// Test 3: BaseEntity initialize() method
// ========================================
test('BaseEntity initialize() sets properties correctly', () => {
    const entity = new BaseEntity(0, 0, 10, 10);

    entity.initialize({
        x: 100,
        y: 200,
        health: 150
    });

    assert(entity.x === 100, 'initialize() should set x position');
    assert(entity.y === 200, 'initialize() should set y position');
    assert(entity.health === 150, 'initialize() should set health');
    assert(entity.maxHealth === 150, 'initialize() should set maxHealth');
    assert(entity.active === true, 'initialize() should set active=true');
    assert(entity.pooled === false, 'initialize() should set pooled=false');
});

// ========================================
// Test 4: Enemy initialize() method
// ========================================
test('Enemy initialize() sets type-specific properties', () => {
    const enemy = new Enemy(0, 0);

    const path = [{x: 0, y: 0}, {x: 100, y: 100}];

    enemy.initialize({
        type: 'tank',
        path: path,
        x: 50,
        y: 75
    });

    assert(enemy.type === 'tank', 'initialize() should set type to tank');
    assert(enemy.health === Config.enemy.tank.health, 'initialize() should set tank health (300)');
    assert(enemy.maxHealth === Config.enemy.tank.health, 'initialize() should set tank maxHealth (300)');
    assert(enemy.speed === Config.enemy.tank.speed, 'initialize() should set tank speed');
    assert(enemy.damage === Config.enemy.tank.damage, 'initialize() should set tank damage');
    assert(enemy.reward === Config.enemy.tank.reward, 'initialize() should set tank reward');
    assert(enemy.color === Config.enemy.tank.color, 'initialize() should set tank color');
    assert(enemy.path.length === 2, 'initialize() should set path');
    assert(enemy.currentPathIndex === 0, 'initialize() should reset path index');
    assert(enemy.x === 50, 'initialize() should set x position');
    assert(enemy.y === 75, 'initialize() should set y position');
});

// ========================================
// Test 5: Enemy lifecycle hooks
// ========================================
test('Enemy lifecycle hooks are called', () => {
    const enemy = new Enemy(0, 0);

    let spawnCalled = false;
    let deactivateCalled = false;

    // Override hooks to track calls
    const originalOnSpawn = enemy.onSpawn.bind(enemy);
    const originalOnDeactivate = enemy.onDeactivate.bind(enemy);

    enemy.onSpawn = () => {
        spawnCalled = true;
        originalOnSpawn();
    };

    enemy.onDeactivate = () => {
        deactivateCalled = true;
        originalOnDeactivate();
    };

    // Test onSpawn is called during initialize
    enemy.initialize({
        type: 'basic',
        path: [{x: 0, y: 0}]
    });

    assert(spawnCalled === true, 'onSpawn() should be called during initialize()');

    // Test onDeactivate is called during reset
    enemy.reset();

    assert(deactivateCalled === true, 'onDeactivate() should be called during reset()');
});

// ========================================
// Test 6: Enemy onDeactivate clears references
// ========================================
test('Enemy onDeactivate() clears path references', () => {
    const enemy = new Enemy(0, 0);

    enemy.initialize({
        type: 'basic',
        path: [{x: 0, y: 0}, {x: 100, y: 100}]
    });

    assert(enemy.path.length === 2, 'Enemy should have path before deactivate');

    enemy.reset();

    assert(enemy.path.length === 0, 'Enemy path should be cleared after reset');
    assert(enemy.currentPathIndex === 0, 'Enemy path index should be reset');
});

// ========================================
// Test 7: Tower initialize() method
// ========================================
test('Tower initialize() sets type-specific properties', () => {
    const tower = new Tower(0, 0);

    tower.initialize({
        type: 'sniper',
        x: 100,
        y: 150
    });

    assert(tower.type === 'sniper', 'initialize() should set type to sniper');
    assert(tower.damage === Config.tower.sniper.damage, 'initialize() should set sniper damage');
    assert(tower.range === Config.tower.sniper.range, 'initialize() should set sniper range');
    assert(tower.fireRate === Config.tower.sniper.fireRate, 'initialize() should set sniper fire rate');
    assert(tower.fireTimer === 0, 'initialize() should reset fire timer');
    assert(tower.target === null, 'initialize() should clear target');
    assert(tower.x === 100, 'initialize() should set x position');
    assert(tower.y === 150, 'initialize() should set y position');
});

// ========================================
// Test 8: Tower lifecycle hooks
// ========================================
test('Tower onDeactivate() clears references', () => {
    const tower = new Tower(0, 0);
    const mockTarget = { active: true };
    const mockManager = {};

    tower.target = mockTarget;
    tower.entityManager = mockManager;

    tower.reset();

    assert(tower.target === null, 'Tower target should be cleared after reset');
    assert(tower.entityManager === null, 'Tower entityManager should be cleared after reset');
});

// ========================================
// Test 9: Projectile initialize() method
// ========================================
test('Projectile initialize() sets properties correctly', () => {
    const projectile = new Projectile(0, 0, null);
    const mockTarget = { x: 100, y: 100 };

    projectile.initialize({
        x: 50,
        y: 75,
        target: mockTarget,
        damage: 25
    });

    assert(projectile.x === 50, 'initialize() should set x position');
    assert(projectile.y === 75, 'initialize() should set y position');
    assert(projectile.target === mockTarget, 'initialize() should set target');
    assert(projectile.damage === 25, 'initialize() should set damage');
    assert(projectile.speed === Config.projectile.speed, 'initialize() should set speed from config');
});

// ========================================
// Test 10: Projectile onDeactivate clears target
// ========================================
test('Projectile onDeactivate() clears target reference', () => {
    const projectile = new Projectile(0, 0, null);
    const mockTarget = { x: 100, y: 100 };

    projectile.target = mockTarget;

    projectile.reset();

    assert(projectile.target === null, 'Projectile target should be cleared after reset');
});

// ========================================
// Test 11: EntityManager uses initialize() for enemies
// ========================================
test('EntityManager.spawnEnemy() uses initialize() method', () => {
    const mockGame = {
        enemyKilled: () => {},
        enemyReachedEnd: () => {}
    };
    const entityManager = new EntityManager(mockGame);

    const path = [{x: 0, y: 0}, {x: 100, y: 100}];
    const enemy = entityManager.spawnEnemy('tank', path);

    assert(enemy.type === 'tank', 'Spawned enemy should have correct type');
    assert(enemy.health === Config.enemy.tank.health, 'Spawned enemy should have tank health (300)');
    assert(enemy.path.length === 2, 'Spawned enemy should have path');
    assert(enemy.active === true, 'Spawned enemy should be active');
});

// ========================================
// Test 12: EntityManager uses initialize() for projectiles
// ========================================
test('EntityManager.spawnProjectile() uses initialize() method', () => {
    const mockGame = {
        enemyKilled: () => {},
        enemyReachedEnd: () => {}
    };
    const entityManager = new EntityManager(mockGame);

    const tower = new Tower(100, 100, 'basic');
    const enemy = new Enemy(200, 200, 'basic');

    const projectile = entityManager.spawnProjectile(tower, enemy);

    assert(projectile.target === enemy, 'Spawned projectile should have target');
    assert(projectile.damage === tower.damage, 'Spawned projectile should have tower damage');
    assert(projectile.active === true, 'Spawned projectile should be active');

    // Verify position is centered on tower
    const expectedX = tower.x + tower.width / 2;
    const expectedY = tower.y + tower.height / 2;
    assert(projectile.x === expectedX, 'Projectile should spawn at tower center X');
    assert(projectile.y === expectedY, 'Projectile should spawn at tower center Y');
});

// ========================================
// Test 13: No circular references in spawned towers
// ========================================
test('Spawned towers have no entityManager circular reference', () => {
    const mockGame = {
        enemyKilled: () => {},
        enemyReachedEnd: () => {}
    };
    const entityManager = new EntityManager(mockGame);

    const tower = entityManager.spawnTower('basic', 100, 100);

    assert(tower.entityManager === null || tower.entityManager === undefined,
           'Tower should not have entityManager circular reference');
});

// ========================================
// Test 14: ObjectPool sets pooled flag correctly
// ========================================
test('ObjectPool sets pooled flag on acquire/release', () => {
    const mockGame = {
        enemyKilled: () => {},
        enemyReachedEnd: () => {}
    };
    const entityManager = new EntityManager(mockGame);

    const path = [{x: 0, y: 0}];
    const enemy1 = entityManager.spawnEnemy('basic', path);

    assert(enemy1.pooled === false, 'Acquired enemy should have pooled=false');

    // Deactivate and release
    enemy1.active = false;
    entityManager.update(0.016); // This will release the enemy

    // Spawn again to get same enemy from pool
    const enemy2 = entityManager.spawnEnemy('basic', path);

    assert(enemy2.pooled === false, 'Re-acquired enemy should have pooled=false');
});

// ========================================
// Test 15: BaseEntity destroy() method
// ========================================
test('BaseEntity destroy() calls onDestroy() hook', () => {
    const entity = new BaseEntity(0, 0, 10, 10);

    let destroyCalled = false;

    entity.onDestroy = () => {
        destroyCalled = true;
    };

    entity.destroy();

    assert(destroyCalled === true, 'destroy() should call onDestroy() hook');
    assert(entity.active === false, 'destroy() should set active=false');
    assert(entity.pooled === false, 'destroy() should set pooled=false');
});

// ========================================
// Summary
// ========================================
console.log(`\n=== Test Summary ===`);
console.log(`Tests Run: ${testsRun}`);
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsRun - testsPassed}`);
console.log(`Success Rate: ${((testsPassed / testsRun) * 100).toFixed(1)}%`);

if (testsPassed === testsRun) {
    console.log('\n✅ All Phase 2 architecture tests passed!\n');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed!\n');
    process.exit(1);
}
