// Jest test for Phase 1 Bug Fixes
import { jest } from '@jest/globals';

import Enemy from '../src/entities/enemy.js';
import Projectile from '../src/entities/projectile.js';
import Tower from '../src/entities/tower.js';
import Config from '../src/config.js';

describe('Phase 1 Bug Fixes Test', () => {
    test('Projectile damage uses Config.projectile.damage', () => {
        const projectile = new Projectile(0, 0, null);
        expect(projectile.damage).toBe(Config.projectile.damage);
    });

    test('Projectile reset restores damage to Config.projectile.damage', () => {
        const projectile = new Projectile(0, 0, null);
        projectile.damage = 999;
        projectile.reset();
        expect(projectile.damage).toBe(Config.projectile.damage);
    });

    test('Enemy reset respects enemy type (basic)', () => {
        const enemy = new Enemy(0, 0, 'basic');
        enemy.health = 50;
        enemy.reset('basic');
        expect(enemy.health).toBe(Config.enemy.basic.health);
        expect(enemy.maxHealth).toBe(Config.enemy.basic.health);
    });

    test('Enemy reset respects enemy type (fast)', () => {
        const enemy = new Enemy(0, 0, 'fast');
        enemy.reset('fast');
        expect(enemy.health).toBe(Config.enemy.fast.health);
        expect(enemy.maxHealth).toBe(Config.enemy.fast.health);
    });

    test('Enemy reset respects enemy type (tank)', () => {
        const enemy = new Enemy(0, 0, 'tank');
        enemy.reset('tank');
        expect(enemy.health).toBe(Config.enemy.tank.health);
        expect(enemy.maxHealth).toBe(Config.enemy.tank.health);
    });

    test('Enemy reset updates all properties', () => {
        const enemy = new Enemy(0, 0, 'basic');
        enemy.reset('tank');
        expect(enemy.type).toBe('tank');
        expect(enemy.health).toBe(Config.enemy.tank.health);
        expect(enemy.speed).toBe(Config.enemy.tank.speed);
        expect(enemy.damage).toBe(Config.enemy.tank.damage);
        expect(enemy.reward).toBe(Config.enemy.tank.reward);
        expect(enemy.color).toBe(Config.enemy.tank.color);
    });

    test('Tower initializes fireTimer and uses deltaTime', () => {
        const tower = new Tower(0, 0, 'basic');
        expect(tower.fireTimer).toBe(0);
    });

    test('Tower fireTimer accumulates deltaTime', () => {
        const tower = new Tower(0, 0, 'basic');
        const enemy = new Enemy(50, 50, 'basic');
        enemy.active = true;
        tower.setTarget(enemy);
        const mockEntityManager = { spawnProjectile: jest.fn() };
        tower.update(0.5, mockEntityManager);
        expect(tower.fireTimer).toBe(500);
    });

    test('Tower fires at correct rate', () => {
        const tower = new Tower(0, 0, 'basic');
        const enemy = new Enemy(50, 50, 'basic');
        enemy.active = true;
        tower.setTarget(enemy);
        const mockEntityManager = { spawnProjectile: jest.fn() };
        tower.update(1.0, mockEntityManager);
        expect(mockEntityManager.spawnProjectile).toHaveBeenCalledTimes(1);
        expect(tower.fireTimer).toBe(0);
        tower.update(0.5, mockEntityManager);
        expect(tower.fireTimer).toBe(500);
    });
});
