// Jest tests for Phase 3 Event System
import { jest } from '@jest/globals';

import { EventEmitter, GameEvents, gameEvents } from '../src/core/EventEmitter.js';
import Enemy from '../src/entities/enemy.js';
import Tower from '../src/entities/tower.js';
import Projectile from '../src/entities/projectile.js';

describe('Phase 3 Event System Tests', () => {
    // Use a fresh emitter for isolated tests
    let testEmitter;

    beforeEach(() => {
        testEmitter = new EventEmitter();
        // Clear global event listeners between tests
        gameEvents.clear();
    });

    test('EventEmitter can register and emit events', () => {
        const callback = jest.fn();
        testEmitter.on(GameEvents.ENEMY_KILLED, callback);
        testEmitter.emit(GameEvents.ENEMY_KILLED, { id: 12 });
        expect(callback).toHaveBeenCalledWith({ id: 12 });
    });

    test('EventEmitter removes listeners correctly', () => {
        const callback = jest.fn();
        testEmitter.on(GameEvents.ENEMY_REACHED_END, callback);
        testEmitter.off(GameEvents.ENEMY_REACHED_END, callback);
        testEmitter.emit(GameEvents.ENEMY_REACHED_END, {});
        expect(callback).not.toHaveBeenCalled();
    });

    test('Tower fires projectile when timer reaches fireRate with target', () => {
        const tower = new Tower(0, 0, 'basic');
        const enemy = new Enemy(50, 50, 'basic');
        enemy.active = true;
        tower.setTarget(enemy);
        const mockEntityManager = { spawnProjectile: jest.fn() };

        // Basic tower fireRate is 1000ms, so 1 second should trigger a fire
        tower.update(1.0, mockEntityManager);
        expect(mockEntityManager.spawnProjectile).toHaveBeenCalledTimes(1);
    });

    test('Tower does not fire without target', () => {
        const tower = new Tower(0, 0, 'basic');
        tower.initialize({});
        const mockEntityManager = { spawnProjectile: jest.fn() };

        // Even with enough time, no target means no firing
        tower.update(2.0, mockEntityManager);
        expect(mockEntityManager.spawnProjectile).not.toHaveBeenCalled();
    });

    test('Enemy emits ENEMY_KILLED event when health <= 0', () => {
        const enemy = new Enemy(0, 0, 'basic');
        const killCallback = jest.fn();
        // Enemy uses global gameEvents singleton
        gameEvents.on(GameEvents.ENEMY_KILLED, killCallback);

        enemy.takeDamage(9999);
        expect(killCallback).toHaveBeenCalled();
    });

    test('Enemy emits ENEMY_DAMAGED event on damage', () => {
        const enemy = new Enemy(0, 0, 'basic');
        const damageCallback = jest.fn();
        gameEvents.on(GameEvents.ENEMY_DAMAGED, damageCallback);

        enemy.takeDamage(10);
        expect(damageCallback).toHaveBeenCalled();
        expect(damageCallback).toHaveBeenCalledWith(expect.objectContaining({
            damage: 10,
            enemy: enemy
        }));
    });
});
