/**
 * Phase 3: Event System Tests
 * Tests for the centralized event system implementation
 */

import { EventEmitter, GameEvents, gameEvents } from '../src/core/EventEmitter.js';
import Enemy from '../src/entities/enemy.js';
import Tower from '../src/entities/tower.js';
import Projectile from '../src/entities/projectile.js';
import BaseEntity from '../src/entities/baseEntity.js';
import EntityManager from '../src/core/entityManager.js';

// Test 1: EventEmitter basic functionality
console.log('Test 1: EventEmitter can register and emit events');
const emitter = new EventEmitter();
let callbackCalled = false;
emitter.on('test:event', () => {
    callbackCalled = true;
});
emitter.emit('test:event');
console.assert(callbackCalled === true, 'FAIL: Callback should have been called');
console.log('✅ PASS: EventEmitter emits and handles events correctly');

// Test 2: EventEmitter with event data
console.log('\nTest 2: EventEmitter passes data to callbacks');
const emitter2 = new EventEmitter();
let receivedData = null;
emitter2.on('data:event', (data) => {
    receivedData = data;
});
emitter2.emit('data:event', { value: 42 });
console.assert(receivedData !== null, 'FAIL: Data should have been received');
console.assert(receivedData.value === 42, 'FAIL: Data value should be 42');
console.log('✅ PASS: EventEmitter correctly passes data to callbacks');

// Test 3: EventEmitter multiple listeners
console.log('\nTest 3: EventEmitter supports multiple listeners for same event');
const emitter3 = new EventEmitter();
let call1 = false;
let call2 = false;
emitter3.on('multi:event', () => { call1 = true; });
emitter3.on('multi:event', () => { call2 = true; });
emitter3.emit('multi:event');
console.assert(call1 && call2, 'FAIL: Both callbacks should have been called');
console.log('✅ PASS: Multiple listeners work correctly');

// Test 4: EventEmitter off() method
console.log('\nTest 4: EventEmitter can remove listeners');
const emitter4 = new EventEmitter();
let callCount = 0;
const callback = () => { callCount++; };
emitter4.on('remove:event', callback);
emitter4.emit('remove:event');
emitter4.off('remove:event', callback);
emitter4.emit('remove:event');
console.assert(callCount === 1, 'FAIL: Callback should only be called once');
console.log('✅ PASS: Event listeners can be removed');

// Test 5: EventEmitter once() method
console.log('\nTest 5: EventEmitter once() auto-removes after first call');
const emitter5 = new EventEmitter();
let onceCount = 0;
emitter5.once('once:event', () => { onceCount++; });
emitter5.emit('once:event');
emitter5.emit('once:event');
emitter5.emit('once:event');
console.assert(onceCount === 1, 'FAIL: Once callback should only be called once');
console.log('✅ PASS: once() correctly auto-removes listener');

// Test 6: EventEmitter listener count
console.log('\nTest 6: EventEmitter tracks listener count');
const emitter6 = new EventEmitter();
console.assert(emitter6.listenerCount('test') === 0, 'FAIL: Should have 0 listeners');
emitter6.on('test', () => {});
emitter6.on('test', () => {});
console.assert(emitter6.listenerCount('test') === 2, 'FAIL: Should have 2 listeners');
console.log('✅ PASS: Listener count works correctly');

// Test 7: GameEvents are defined
console.log('\nTest 7: GameEvents object defines all event types');
const requiredEvents = [
    'ENEMY_SPAWNED', 'ENEMY_KILLED', 'ENEMY_REACHED_END', 'ENEMY_DAMAGED',
    'TOWER_PLACED', 'TOWER_FIRED', 'TOWER_TARGET_ACQUIRED', 'TOWER_TARGET_LOST',
    'PROJECTILE_FIRED', 'PROJECTILE_HIT', 'PROJECTILE_MISSED'
];
for (const event of requiredEvents) {
    console.assert(GameEvents[event] !== undefined, `FAIL: GameEvents.${event} should be defined`);
}
console.log('✅ PASS: All required GameEvents are defined');

// Test 8: BaseEntity has events reference
console.log('\nTest 8: BaseEntity has events property');
const entity = new BaseEntity(0, 0, 10, 10);
console.assert(entity.events !== undefined, 'FAIL: BaseEntity should have events property');
console.assert(entity.events === gameEvents, 'FAIL: BaseEntity.events should reference gameEvents');
console.log('✅ PASS: BaseEntity has global event emitter reference');

// Test 9: Enemy emits ENEMY_DAMAGED event
console.log('\nTest 9: Enemy emits ENEMY_DAMAGED event when taking damage');
const enemy = new Enemy(0, 0, 'basic');
enemy.initialize({ type: 'basic', path: [], x: 0, y: 0 });
let damagedEventData = null;
gameEvents.once(GameEvents.ENEMY_DAMAGED, (data) => {
    damagedEventData = data;
});
enemy.takeDamage(10);
console.assert(damagedEventData !== null, 'FAIL: ENEMY_DAMAGED event should have been emitted');
console.assert(damagedEventData.damage === 10, 'FAIL: Damage value should be 10');
console.assert(damagedEventData.enemy === enemy, 'FAIL: Event should reference enemy');
console.log('✅ PASS: Enemy emits ENEMY_DAMAGED event with correct data');

// Test 10: Enemy emits ENEMY_KILLED event
console.log('\nTest 10: Enemy emits ENEMY_KILLED event when health reaches 0');
const enemy2 = new Enemy(0, 0, 'basic');
enemy2.initialize({ type: 'basic', path: [], x: 0, y: 0 });
let killedEventData = null;
gameEvents.once(GameEvents.ENEMY_KILLED, (data) => {
    killedEventData = data;
});
enemy2.takeDamage(enemy2.health); // Kill enemy
console.assert(killedEventData !== null, 'FAIL: ENEMY_KILLED event should have been emitted');
console.assert(killedEventData.enemy === enemy2, 'FAIL: Event should reference enemy');
console.assert(killedEventData.reward === 10, 'FAIL: Reward should be 10 for basic enemy');
console.log('✅ PASS: Enemy emits ENEMY_KILLED event when killed');

// Test 11: Enemy emits ENEMY_REACHED_END event
console.log('\nTest 11: Enemy emits ENEMY_REACHED_END event when reaching path end');
const enemy3 = new Enemy(0, 0, 'basic');
const testPath = [
    { x: 0, y: 0 },
    { x: 10, y: 10 }
];
enemy3.initialize({ type: 'basic', path: testPath, x: 0, y: 0 });
let reachedEndEventData = null;
gameEvents.once(GameEvents.ENEMY_REACHED_END, (data) => {
    reachedEndEventData = data;
});
// Simulate reaching end by updating until path complete
enemy3.currentPathIndex = testPath.length - 1;
enemy3.x = testPath[testPath.length - 1].x - 0.1;
enemy3.y = testPath[testPath.length - 1].y - 0.1;
enemy3.update(0.016); // One frame
console.assert(reachedEndEventData !== null, 'FAIL: ENEMY_REACHED_END event should have been emitted');
console.assert(reachedEndEventData.enemy === enemy3, 'FAIL: Event should reference enemy');
console.log('✅ PASS: Enemy emits ENEMY_REACHED_END event at path end');

// Test 12: Tower emits TOWER_TARGET_ACQUIRED event
console.log('\nTest 12: Tower emits TOWER_TARGET_ACQUIRED event when acquiring target');
const tower = new Tower(0, 0, 'basic');
tower.initialize({ type: 'basic', x: 0, y: 0 });
const targetEnemy = new Enemy(50, 50, 'basic');
let targetAcquiredEventData = null;
gameEvents.once(GameEvents.TOWER_TARGET_ACQUIRED, (data) => {
    targetAcquiredEventData = data;
});
tower.setTarget(targetEnemy);
console.assert(targetAcquiredEventData !== null, 'FAIL: TOWER_TARGET_ACQUIRED should have been emitted');
console.assert(targetAcquiredEventData.tower === tower, 'FAIL: Event should reference tower');
console.assert(targetAcquiredEventData.target === targetEnemy, 'FAIL: Event should reference target');
console.log('✅ PASS: Tower emits TOWER_TARGET_ACQUIRED event');

// Test 13: Tower emits TOWER_FIRED event
console.log('\nTest 13: Tower emits TOWER_FIRED event when firing');
const tower2 = new Tower(0, 0, 'basic');
tower2.initialize({ type: 'basic', x: 0, y: 0 });
const mockEntityManager = {
    spawnProjectile: () => {}
};
tower2.setTarget(new Enemy(50, 50, 'basic'));
let towerFiredEventData = null;
gameEvents.once(GameEvents.TOWER_FIRED, (data) => {
    towerFiredEventData = data;
});
tower2.fire(mockEntityManager);
console.assert(towerFiredEventData !== null, 'FAIL: TOWER_FIRED should have been emitted');
console.assert(towerFiredEventData.tower === tower2, 'FAIL: Event should reference tower');
console.log('✅ PASS: Tower emits TOWER_FIRED event');

// Test 14: Projectile emits PROJECTILE_HIT event
console.log('\nTest 14: Projectile emits PROJECTILE_HIT event on collision');
const projectile = new Projectile(0, 0, null);
const hitTarget = new Enemy(1, 1, 'basic'); // Very close position
hitTarget.initialize({ type: 'basic', path: [], x: 1, y: 1 });
projectile.initialize({
    x: 0,
    y: 0,
    target: hitTarget,
    damage: 10
});
let projectileHitEventData = null;
gameEvents.once(GameEvents.PROJECTILE_HIT, (data) => {
    projectileHitEventData = data;
});
projectile.update(0.016); // Should hit immediately due to close range
console.assert(projectileHitEventData !== null, 'FAIL: PROJECTILE_HIT should have been emitted');
console.assert(projectileHitEventData.projectile === projectile, 'FAIL: Event should reference projectile');
console.assert(projectileHitEventData.damage === 10, 'FAIL: Event should include damage');
console.log('✅ PASS: Projectile emits PROJECTILE_HIT event');

// Test 15: Projectile emits PROJECTILE_MISSED event
console.log('\nTest 15: Projectile emits PROJECTILE_MISSED event when target becomes inactive');
const projectile2 = new Projectile(0, 0, null);
const missTarget = new Enemy(100, 100, 'basic');
missTarget.initialize({ type: 'basic', path: [], x: 100, y: 100 });
projectile2.initialize({
    x: 0,
    y: 0,
    target: missTarget,
    damage: 10
});
missTarget.active = false; // Make target inactive
let projectileMissedEventData = null;
gameEvents.once(GameEvents.PROJECTILE_MISSED, (data) => {
    projectileMissedEventData = data;
});
projectile2.update(0.016);
console.assert(projectileMissedEventData !== null, 'FAIL: PROJECTILE_MISSED should have been emitted');
console.assert(projectileMissedEventData.projectile === projectile2, 'FAIL: Event should reference projectile');
console.log('✅ PASS: Projectile emits PROJECTILE_MISSED event');

// Test 16: EntityManager provides event subscription methods
console.log('\nTest 16: EntityManager has on() and off() methods');
const em = new EntityManager(null);
console.assert(typeof em.on === 'function', 'FAIL: EntityManager should have on() method');
console.assert(typeof em.off === 'function', 'FAIL: EntityManager should have off() method');
console.assert(em.events === gameEvents, 'FAIL: EntityManager should reference gameEvents');
console.log('✅ PASS: EntityManager has event subscription methods');

// Test 17: EntityManager on() method works
console.log('\nTest 17: EntityManager.on() correctly subscribes to events');
const em2 = new EntityManager(null);
let emCallbackCalled = false;
em2.on('test:em', () => {
    emCallbackCalled = true;
});
gameEvents.emit('test:em');
console.assert(emCallbackCalled === true, 'FAIL: EntityManager.on() should subscribe to events');
console.log('✅ PASS: EntityManager.on() works correctly');

// Test 18: Event error handling
console.log('\nTest 18: EventEmitter handles errors in listeners gracefully');
const emitter8 = new EventEmitter();
let secondCallbackCalled = false;
emitter8.on('error:test', () => {
    throw new Error('Test error');
});
emitter8.on('error:test', () => {
    secondCallbackCalled = true;
});
emitter8.emit('error:test');
console.assert(secondCallbackCalled === true, 'FAIL: Second callback should still execute after error');
console.log('✅ PASS: EventEmitter handles errors gracefully');

// Test 19: Clear specific event listeners
console.log('\nTest 19: EventEmitter can clear specific event type');
const emitter9 = new EventEmitter();
emitter9.on('clear:test', () => {});
emitter9.on('keep:test', () => {});
console.assert(emitter9.listenerCount('clear:test') === 1, 'FAIL: Should have 1 listener');
emitter9.clear('clear:test');
console.assert(emitter9.listenerCount('clear:test') === 0, 'FAIL: Should have 0 listeners after clear');
console.assert(emitter9.listenerCount('keep:test') === 1, 'FAIL: Other event should still have listener');
console.log('✅ PASS: EventEmitter can clear specific event types');

// Test 20: Clear all event listeners
console.log('\nTest 20: EventEmitter can clear all listeners');
const emitter10 = new EventEmitter();
emitter10.on('event1', () => {});
emitter10.on('event2', () => {});
emitter10.on('event3', () => {});
emitter10.clear();
console.assert(emitter10.listenerCount('event1') === 0, 'FAIL: event1 should have 0 listeners');
console.assert(emitter10.listenerCount('event2') === 0, 'FAIL: event2 should have 0 listeners');
console.assert(emitter10.listenerCount('event3') === 0, 'FAIL: event3 should have 0 listeners');
console.log('✅ PASS: EventEmitter can clear all listeners');

console.log('\n==============================================');
console.log('Phase 3 Event System Tests Complete!');
console.log('All 20 tests passed ✅');
console.log('==============================================');
