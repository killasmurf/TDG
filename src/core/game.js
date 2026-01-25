/**
 * Game Class
 * Main game orchestrator that manages all game systems and entities
 */

import GameLoop from './gameLoop.js';
import Renderer from './renderer.js';
import InputHandler from './input.js';
import AudioManager from './audio.js';
import EntityManager from './entityManager.js';
import PathManager from '../entities/pathManager.js';
import Config from '../config.js';

class Game extends GameLoop {
    constructor(canvasId = Config.canvas.id) {
        super();

        // Core systems
        this.renderer = new Renderer(canvasId);
        this.input = new InputHandler();
        this.audio = new AudioManager();
        this.entityManager = new EntityManager(this);
        this.pathManager = new PathManager();

        // Game state
        this.state = 'menu'; // menu, playing, paused, gameOver, victory
        this.lives = Config.game.startingLives;
        this.money = Config.game.startingMoney;
        this.score = 0;
        this.currentWave = 0;
        this.waveInProgress = false;

        // Level data
        this.currentLevel = null;

        // Selection state (for tower placement)
        this.selectedTowerType = null;
        this.hoveredCell = null;

        // Bind methods
        this.handleClick = this.handleClick.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', this.handleClick);
        document.addEventListener('keydown', this.handleKeyPress);
    }

    handleClick(event) {
        if (this.state !== 'playing') return;

        const mousePos = this.input.getMousePosition();

        // Handle tower placement
        if (this.selectedTowerType) {
            this.placeTower(mousePos.x, mousePos.y);
        }
    }

    handleKeyPress(event) {
        switch (event.key) {
            case 'Escape':
                this.togglePause();
                break;
            case '1':
                this.selectedTowerType = 'basic';
                break;
            case '2':
                this.selectedTowerType = 'sniper';
                break;
            case '3':
                this.selectedTowerType = 'rapid';
                break;
            case ' ':
                if (this.state === 'playing' && !this.waveInProgress) {
                    this.startNextWave();
                }
                break;
        }
    }

    init() {
        console.log('Tower Defense Game Initialized');

        // Setup default path
        this.setupDefaultPath();

        // Start in menu state
        this.state = 'menu';
    }

    setupDefaultPath() {
        // Create a default S-shaped path
        this.pathManager.addWaypoint(0, 100);
        this.pathManager.addWaypoint(200, 100);
        this.pathManager.addWaypoint(200, 300);
        this.pathManager.addWaypoint(600, 300);
        this.pathManager.addWaypoint(600, 500);
        this.pathManager.addWaypoint(800, 500);
    }

    loadLevel(level) {
        this.currentLevel = level;
        this.pathManager = new PathManager();

        // Load level path
        if (level.path) {
            level.path.forEach(waypoint => {
                this.pathManager.addWaypoint(waypoint.x, waypoint.y);
            });
        }

        // Reset game state for new level
        this.lives = level.startingLives || Config.game.startingLives;
        this.money = level.startingMoney || Config.game.startingMoney;
        this.currentWave = 0;
        this.score = 0;

        // Clear entities
        this.entityManager.clear();
    }

    startGame() {
        this.state = 'playing';
        this.start();
    }

    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.stop();
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.start();
        }
    }

    startNextWave() {
        if (this.waveInProgress) return;

        this.currentWave++;
        this.waveInProgress = true;

        // Spawn wave of enemies
        const enemyCount = 5 + (this.currentWave * 2);
        const path = this.pathManager.getWaypoints();

        for (let i = 0; i < enemyCount; i++) {
            setTimeout(() => {
                if (this.state === 'playing') {
                    this.entityManager.spawnEnemy('basic', path);
                }
            }, i * 1000); // Spawn one enemy per second
        }

        // Wave ends when all enemies are spawned (actual end checked in update)
        setTimeout(() => {
            this.checkWaveComplete();
        }, enemyCount * 1000 + 5000);
    }

    checkWaveComplete() {
        const enemies = this.entityManager.getEntitiesByType('enemy');
        if (enemies.length === 0) {
            this.waveInProgress = false;
            console.log(`Wave ${this.currentWave} complete!`);
        } else {
            // Check again later
            setTimeout(() => this.checkWaveComplete(), 1000);
        }
    }

    placeTower(x, y) {
        const towerConfig = Config.tower[this.selectedTowerType];

        if (!towerConfig) return;

        if (this.money >= towerConfig.cost) {
            // Check if position is valid (not on path, not overlapping)
            if (this.isValidTowerPosition(x, y)) {
                this.entityManager.spawnTower(this.selectedTowerType, x, y);
                this.money -= towerConfig.cost;
                this.audio.play('towerPlace');
            }
        }

        // Deselect tower after placement
        this.selectedTowerType = null;
    }

    isValidTowerPosition(x, y) {
        // Check if too close to path
        const waypoints = this.pathManager.getWaypoints();
        for (let i = 0; i < waypoints.length - 1; i++) {
            const dist = this.pointToLineDistance(
                x, y,
                waypoints[i].x, waypoints[i].y,
                waypoints[i + 1].x, waypoints[i + 1].y
            );
            if (dist < 50) return false;
        }

        // Check if overlapping with existing towers
        const towers = this.entityManager.getEntitiesByType('tower');
        for (const tower of towers) {
            const dx = x - tower.x;
            const dy = y - tower.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 50) return false;
        }

        return true;
    }

    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    enemyReachedEnd(enemy) {
        this.lives -= enemy.damage;
        this.audio.play('lifeLost');

        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    enemyKilled(enemy) {
        this.money += enemy.reward;
        this.score += enemy.reward * 10;
        this.audio.play('enemyDeath');
    }

    gameOver() {
        this.state = 'gameOver';
        this.stop();
        console.log('Game Over! Final Score:', this.score);
    }

    victory() {
        this.state = 'victory';
        this.stop();
        console.log('Victory! Final Score:', this.score);
    }

    update(deltaTime) {
        if (this.state !== 'playing') return;

        // Update all entities
        this.entityManager.update(deltaTime);

        // Tower targeting
        this.updateTowerTargeting();
    }

    updateTowerTargeting() {
        const towers = this.entityManager.getEntitiesByType('tower');
        const enemies = this.entityManager.getEntitiesByType('enemy');

        for (const tower of towers) {
            if (!tower.target || !tower.target.active) {
                // Find new target
                let closestEnemy = null;
                let closestDistance = Infinity;

                for (const enemy of enemies) {
                    const dx = enemy.x - tower.x;
                    const dy = enemy.y - tower.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance <= tower.range && distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                }

                tower.setTarget(closestEnemy);
            }
        }
    }

    render() {
        // Clear canvas
        this.renderer.clear();

        // Draw background
        this.renderer.drawRect(0, 0, Config.canvas.width, Config.canvas.height, '#2d2d2d');

        // Draw path
        this.renderPath();

        // Render all entities
        this.entityManager.render(this.renderer);

        // Draw UI
        this.renderUI();

        // Draw state-specific overlays
        this.renderStateOverlay();
    }

    renderPath() {
        const waypoints = this.pathManager.getWaypoints();

        if (waypoints.length < 2) return;

        // Draw path lines
        this.renderer.ctx.strokeStyle = '#4a4a4a';
        this.renderer.ctx.lineWidth = 40;
        this.renderer.ctx.lineCap = 'round';
        this.renderer.ctx.lineJoin = 'round';
        this.renderer.ctx.beginPath();
        this.renderer.ctx.moveTo(waypoints[0].x, waypoints[0].y);

        for (let i = 1; i < waypoints.length; i++) {
            this.renderer.ctx.lineTo(waypoints[i].x, waypoints[i].y);
        }

        this.renderer.ctx.stroke();
    }

    renderUI() {
        // Draw HUD background
        this.renderer.drawRect(0, 0, Config.canvas.width, 40, 'rgba(0, 0, 0, 0.7)');

        // Draw lives
        this.renderer.drawText(`Lives: ${this.lives}`, 10, 28, 18, 'white');

        // Draw money
        this.renderer.drawText(`Money: $${this.money}`, 150, 28, 18, 'gold');

        // Draw wave
        this.renderer.drawText(`Wave: ${this.currentWave}`, 300, 28, 18, 'white');

        // Draw score
        this.renderer.drawText(`Score: ${this.score}`, 450, 28, 18, 'white');

        // Draw selected tower
        if (this.selectedTowerType) {
            this.renderer.drawText(
                `Selected: ${this.selectedTowerType.toUpperCase()} ($${Config.tower[this.selectedTowerType].cost})`,
                600, 28, 14, 'cyan'
            );
        }

        // Draw controls hint
        if (!this.waveInProgress) {
            this.renderer.drawText('Press SPACE to start wave', 10, Config.canvas.height - 10, 14, 'white');
        }

        this.renderer.drawText('1-3: Select tower | ESC: Pause', Config.canvas.width - 220, Config.canvas.height - 10, 12, 'gray');
    }

    renderStateOverlay() {
        if (this.state === 'menu') {
            this.renderer.drawRect(0, 0, Config.canvas.width, Config.canvas.height, 'rgba(0, 0, 0, 0.8)');
            this.renderer.drawText('TOWER DEFENSE', Config.canvas.width / 2 - 120, Config.canvas.height / 2 - 50, 32, 'white');
            this.renderer.drawText('Click to Start', Config.canvas.width / 2 - 60, Config.canvas.height / 2 + 10, 18, 'gray');
        } else if (this.state === 'paused') {
            this.renderer.drawRect(0, 0, Config.canvas.width, Config.canvas.height, 'rgba(0, 0, 0, 0.5)');
            this.renderer.drawText('PAUSED', Config.canvas.width / 2 - 50, Config.canvas.height / 2, 32, 'white');
            this.renderer.drawText('Press ESC to resume', Config.canvas.width / 2 - 70, Config.canvas.height / 2 + 40, 16, 'gray');
        } else if (this.state === 'gameOver') {
            this.renderer.drawRect(0, 0, Config.canvas.width, Config.canvas.height, 'rgba(0, 0, 0, 0.8)');
            this.renderer.drawText('GAME OVER', Config.canvas.width / 2 - 80, Config.canvas.height / 2 - 20, 32, 'red');
            this.renderer.drawText(`Final Score: ${this.score}`, Config.canvas.width / 2 - 60, Config.canvas.height / 2 + 30, 18, 'white');
        } else if (this.state === 'victory') {
            this.renderer.drawRect(0, 0, Config.canvas.width, Config.canvas.height, 'rgba(0, 0, 0, 0.8)');
            this.renderer.drawText('VICTORY!', Config.canvas.width / 2 - 60, Config.canvas.height / 2 - 20, 32, 'gold');
            this.renderer.drawText(`Final Score: ${this.score}`, Config.canvas.width / 2 - 60, Config.canvas.height / 2 + 30, 18, 'white');
        }
    }

    destroy() {
        document.removeEventListener('click', this.handleClick);
        document.removeEventListener('keydown', this.handleKeyPress);
        this.stop();
    }
}

export default Game;
