// Jest tests for Phase 2 Architecture Improvements
import { jest } from '@jest/globals';

import Enemy from '../src/entities/enemy.js';
import Tower from '../src/entities/tower.js';
import Projectile from '../src/entities/projectile.js';
import BaseEntity from '../src/entities/baseEntity.js';
import EntityManager from '../src/core/entityManager.js';
import Config from '../src/config.js';

// Helper to simplify repeated assertions
const expectEntityProps = (entity, expected) => {
    Object.entries(expected).forEach(([key, value]) => {
        expect(entity[key]).toBe(value);
    });
};

describe('Phase 2 Architecture Tests', () => {
    // 1. BaseEntity lifecycle hooks
    test('BaseEntity has lifecycle hook methods', () => {
        const entity = new BaseEntity(0, 0, 10, 10);
        expect(typeof entity.initialize).toBe('function');
        expect(typeof entity.onSpawn).toBe('function');
        expect(typeof entity.onDeactivate).toBe('function');
        expect(typeof entity.onDestroy).toBe('function');
        expect(typeof entity.destroy).toBe('function');
    });

    // 2. BaseEntity pooled flag
    test('BaseEntity pooled flag toggles on reset', () => {
        const entity = new BaseEntity(0, 0, 10, 10);
        expect(entity.pooled).toBe(false);
        entity.reset();
        expect(entity.pooled).toBe(true);
    });

    // 3. BaseEntity initialize
    test('BaseEntity initialize sets properties', () => {
        const entity = new BaseEntity(0, 0, 10, 10);
        entity.initialize({ x: 100, y: 200, health: 150 });
        expect(entity.x).toBe(100);
        expect(entity.y).toBe(200);
        expect(entity.health).toBe(150);
        expect(entity.maxHealth).toBe(150);
        expect(entity.active).toBe(true);
        expect(entity.pooled).toBe(false);
    });

    // 4. Enemy initialize (type-specific)
    test('Enemy initialize sets type-specific properties', () => {
        const enemy = new Enemy(0, 0);
        const path = [{ x: 0, y: 0 }, { x: 100, y: 100 }];
        enemy.initialize({ type: 'tank', path, x: 50, y: 75 });
        expect(enemy.type).toBe('tank');
        expect(enemy.health).toBe(Config.enemy.tank.health);
        expect(enemy.maxHealth).toBe(Config.enemy.tank.health);
        expect(enemy.speed).toBe(Config.enemy.tank.speed);
        expect(enemy.damage).toBe(Config.enemy.tank.damage);
        expect(enemy.reward).toBe(Config.enemy.tank.reward);
        expect(enemy.color).toBe(Config.enemy.tank.color);
        expect(enemy.path).toBe(path);
        expect(enemy.currentPathIndex).toBe(0);
        expect(enemy.x).toBe(50);
        expect(enemy.y).toBe(75);
    });

    // 5. Enemy lifecycle hooks
    test('Enemy lifecycle hooks called appropriately', () => {
        const enemy = new Enemy(0, 0);
        let spawnCalled = false;
        let deactivateCalled = false;
        enemy.onSpawn = () => { spawnCalled = true; };
        enemy.onDeactivate = () => { deactivateCalled = true; };
        enemy.initialize({ type: 'basic', path: [{ x: 0, y: 0 }] });
        expect(spawnCalled).toBe(true);
        enemy.reset();
        expect(deactivateCalled).toBe(true);
    });

    // 6. Enemy onDeactivate clears references
    test('Enemy onDeactivate clears paths', () => {
        const enemy = new Enemy(0, 0);
        enemy.initialize({ type: 'basic', path: [{ x: 0, y: 0 }, { x: 100, y: 100 }] });
        expect(enemy.path.length).toBe(2);
        enemy.reset();
        expect(enemy.path.length).toBe(0);
        expect(enemy.currentPathIndex).toBe(0);
    });

    // 7. Tower initialize
    test('Tower initialize sets type-specific properties', () => {
        const tower = new Tower(0, 0);
        tower.initialize({ type: 'sniper', x: 100, y: 150 });
        expect(tower.type).toBe('sniper');
        expect(tower.damage).toBe(Config.tower.sniper.damage);
        expect(tower.range).toBe(Config.tower.sniper.range);
        expect(tower.fireRate).toBe(Config.tower.sniper.fireRate);
        expect(tower.fireTimer).toBe(0);
        expect(tower.target).toBeNull();
        expect(tower.x).toBe(100);
        expect(tower.y).toBe(150);
    });

    // 8. Tower onDeactivate clears references
    test('Tower onDeactivate clears target and manager', () => {
        const tower = new Tower(0, 0);
        tower.target = { active: true };
        tower.entityManager = {};
        tower.reset();
        expect(tower.target).toBeNull();
        expect(tower.entityManager).toBeNull();
    });

    // 9. Projectile initialize
    test('Projectile initialize sets properties', () => {
        const projectile = new Projectile(0, 0, null);
        const target = { x: 100, y: 100 };
        projectile.initialize({ x: 50, y: 75, target, damage: 25 });
        expect(projectile.x).toBe(50);
        expect(projectile.y).toBe(75);
        expect(projectile.target).toBe(target);
        expect(projectile.damage).toBe(25);
        expect(projectile.speed).toBe(Config.projectile.speed);
    });

    // 10. Projectile onDeactivate clears target
    test('Projectile onDeactivate clears target', () => {
        const projectile = new Projectile(0, 0, null);
        projectile.target = { x: 100, y: 100 };
        projectile.reset();
        expect(projectile.target).toBeNull();
    });

    // 11. EntityManager spawnEnemy uses initialize
    test('EntityManager.spawnEnemy uses initialize correctly', () => {
        const mockGame = { enemyKilled: jest.fn(), enemyReachedEnd: jest.fn() };
        const em = new EntityManager(mockGame);
        const path = [{ x: 0, y: 0 }, { x: 100, y: 100 }];
        const enemy = em.spawnEnemy('tank', path);
        expect(enemy.type).toBe('tank');
        expect(enemy.health).toBe(Config.enemy.tank.health);
        expect(enemy.path).toStrictEqual(path);
        expect(enemy.active).toBe(true);
    });

    // 12. EntityManager spawnProjectile uses initialize
    test('EntityManager.spawnProjectile uses initialize correctly', () => {
        const mockGame = { enemyKilled: jest.fn(), enemyReachedEnd: jest.fn() };
        const em = new EntityManager(mockGame);
        const tower = new Tower(100, 100, 'basic');
        const enemy = new Enemy(200, 200, 'basic');
        const projectile = em.spawnProjectile(tower, enemy);
        expect(projectile.target).toBe(enemy);
        expect(projectile.damage).toBe(tower.damage);
        expect(projectile.active).toBe(true);
        const expectedX = tower.x + tower.width / 2;
        const expectedY = tower.y + tower.height / 2;
        expect(projectile.x).toBe(expectedX);
        expect(projectile.y).toBe(expectedY);
    });

    // 13. Spawned towers have no circular reference
    test('Spawned towers do not reference entityManager', () => {
        const mockGame = { enemyKilled: jest.fn(), enemyReachedEnd: jest.fn() };
        const em = new EntityManager(mockGame);
        const tower = em.spawnTower('basic', 100, 100);
        expect(tower.entityManager).toBeNull();
    });

    // 14. ObjectPool sets pooled flag
    test('ObjectPool sets pooled flag correctly', () => {
        const mockGame = { enemyKilled: jest.fn(), enemyReachedEnd: jest.fn() };
        const em = new EntityManager(mockGame);
        const path = [{ x: 0, y: 0 }];
        const e1 = em.spawnEnemy('basic', path);
        expect(e1.pooled).toBe(false);
        e1.active = false;
        em.update(0.016); // triggers pool release
        const e2 = em.spawnEnemy('basic', path);
        expect(e2.pooled).toBe(false);
    });

    // 15. BaseEntity destroy calls onDestroy
    test('BaseEntity.destroy triggers onDestroy', () => {
        const entity = new BaseEntity(0, 0, 10, 10);
        let destroyed = false;
        entity.onDestroy = () => { destroyed = true; };
        entity.destroy();
        expect(destroyed).toBe(true);
        expect(entity.active).toBe(false);
        expect(entity.pooled).toBe(false);
    });
});
