/**
 * Phase 1 Bug Fixes Test
 * Tests for the 3 critical bugs fixed in Phase 1
 */

import Enemy from '../src/entities/enemy.js';
import Projectile from '../src/entities/projectile.js';
import Tower from '../src/entities/tower.js';
import Config from '../src/config.js';

console.log('=== Phase 1 Bug Fixes Test ===\n');

// Test 1: Projectile damage should use Config.projectile.damage, not Config.projectile.speed
console.log('Test 1: Projectile Damage Default');
const projectile1 = new Projectile(0, 0, null);
const expectedDamage = Config.projectile.damage;
const actualDamage = projectile1.damage;

if (actualDamage === expectedDamage) {
    console.log(`✓ PASS: Projectile damage is ${actualDamage} (expected ${expectedDamage})`);
} else {
    console.log(`✗ FAIL: Projectile damage is ${actualDamage} (expected ${expectedDamage})`);
}

// Test 2: Projectile reset should use correct damage
console.log('\nTest 2: Projectile Reset Damage');
projectile1.damage = 999; // Modify damage
projectile1.reset(); // Reset should restore to Config.projectile.damage

if (projectile1.damage === Config.projectile.damage) {
    console.log(`✓ PASS: Projectile reset correctly sets damage to ${projectile1.damage}`);
} else {
    console.log(`✗ FAIL: Projectile reset incorrectly sets damage to ${projectile1.damage} (expected ${Config.projectile.damage})`);
}

// Test 3: Enemy health reset should respect enemy type
console.log('\nTest 3: Enemy Health Reset by Type');

// Test basic enemy (100 health)
const basicEnemy = new Enemy(0, 0, 'basic');
basicEnemy.health = 50; // Take damage
basicEnemy.reset('basic'); // Reset as basic

if (basicEnemy.health === Config.enemy.basic.health && basicEnemy.maxHealth === Config.enemy.basic.health) {
    console.log(`✓ PASS: Basic enemy reset to ${basicEnemy.health} health (expected ${Config.enemy.basic.health})`);
} else {
    console.log(`✗ FAIL: Basic enemy reset to ${basicEnemy.health} health (expected ${Config.enemy.basic.health})`);
}

// Test fast enemy (50 health)
const fastEnemy = new Enemy(0, 0, 'fast');
fastEnemy.reset('fast');

if (fastEnemy.health === Config.enemy.fast.health && fastEnemy.maxHealth === Config.enemy.fast.health) {
    console.log(`✓ PASS: Fast enemy reset to ${fastEnemy.health} health (expected ${Config.enemy.fast.health})`);
} else {
    console.log(`✗ FAIL: Fast enemy reset to ${fastEnemy.health} health (expected ${Config.enemy.fast.health})`);
}

// Test tank enemy (300 health)
const tankEnemy = new Enemy(0, 0, 'tank');
tankEnemy.reset('tank');

if (tankEnemy.health === Config.enemy.tank.health && tankEnemy.maxHealth === Config.enemy.tank.health) {
    console.log(`✓ PASS: Tank enemy reset to ${tankEnemy.health} health (expected ${Config.enemy.tank.health})`);
} else {
    console.log(`✗ FAIL: Tank enemy reset to ${tankEnemy.health} health (expected ${Config.enemy.tank.health})`);
}

// Test 4: Enemy reset should update all properties
console.log('\nTest 4: Enemy Reset Updates All Properties');
const enemy = new Enemy(0, 0, 'basic');
enemy.reset('tank'); // Reset to different type

const allPropsCorrect =
    enemy.type === 'tank' &&
    enemy.health === Config.enemy.tank.health &&
    enemy.speed === Config.enemy.tank.speed &&
    enemy.damage === Config.enemy.tank.damage &&
    enemy.reward === Config.enemy.tank.reward &&
    enemy.color === Config.enemy.tank.color;

if (allPropsCorrect) {
    console.log(`✓ PASS: Enemy reset correctly updated all properties to tank type`);
} else {
    console.log(`✗ FAIL: Enemy reset did not update all properties correctly`);
    console.log(`  Type: ${enemy.type} (expected 'tank')`);
    console.log(`  Health: ${enemy.health} (expected ${Config.enemy.tank.health})`);
    console.log(`  Speed: ${enemy.speed} (expected ${Config.enemy.tank.speed})`);
}

// Test 5: Tower fire rate uses deltaTime (fireTimer instead of Date.now())
console.log('\nTest 5: Tower Fire Rate Uses DeltaTime');
const tower = new Tower(0, 0, 'basic');

// Check that fireTimer exists and is initialized to 0
if (tower.hasOwnProperty('fireTimer') && tower.fireTimer === 0) {
    console.log(`✓ PASS: Tower has fireTimer initialized to 0`);
} else {
    console.log(`✗ FAIL: Tower does not have fireTimer property or it's not initialized correctly`);
}

// Simulate update with deltaTime
const mockEnemy = new Enemy(50, 50, 'basic');
mockEnemy.active = true;
tower.setTarget(mockEnemy);

const mockEntityManager = {
    spawnProjectile: () => {} // Mock function
};

// Update tower with 0.5 seconds (500ms) of deltaTime
tower.update(0.5, mockEntityManager);

// fireTimer should accumulate deltaTime (0.5s * 1000 = 500ms)
if (tower.fireTimer === 500) {
    console.log(`✓ PASS: Tower fireTimer correctly accumulates deltaTime (${tower.fireTimer}ms)`);
} else {
    console.log(`✗ FAIL: Tower fireTimer is ${tower.fireTimer}ms (expected 500ms)`);
}

// Test 6: Tower fires when fireTimer >= fireRate
console.log('\nTest 6: Tower Fires at Correct Rate');
const tower2 = new Tower(0, 0, 'basic');
tower2.setTarget(mockEnemy);

let projectileCount = 0;
const mockEntityManager2 = {
    spawnProjectile: () => { projectileCount++; }
};

// Update with enough time to fire (fireRate is 1000ms for basic tower)
tower2.update(1.0, mockEntityManager2); // 1 second

if (projectileCount === 1 && tower2.fireTimer === 0) {
    console.log(`✓ PASS: Tower fired once and reset fireTimer to 0`);
} else {
    console.log(`✗ FAIL: Tower fired ${projectileCount} times, fireTimer is ${tower2.fireTimer}ms`);
}

// Update with not enough time to fire
tower2.update(0.5, mockEntityManager2); // 0.5 seconds (total 0.5s)

if (projectileCount === 1 && tower2.fireTimer === 500) {
    console.log(`✓ PASS: Tower did not fire prematurely, fireTimer is ${tower2.fireTimer}ms`);
} else {
    console.log(`✗ FAIL: Tower fired ${projectileCount} times when it shouldn't have`);
}

console.log('\n=== Test Complete ===');
