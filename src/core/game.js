import GameLoop from './gameLoop.js';
import Renderer from './renderer.js';
import InputHandler from './input.js';
import AudioManager from './audio.js';
import EntityManager from './entityManager.js';
import PathManager from '../entities/pathManager.js';
import Config from '../config.js';
import WaveManager from './waveManager.js';
import { GameEvents } from './EventEmitter.js';

class Game extends GameLoop {
    constructor(canvasId = Config.canvas.id) {
        super();

        // Core systems
        this.renderer = new Renderer(canvasId);
        this.input = new InputHandler();
        this.audio = new AudioManager();
        this.entityManager = new EntityManager(this);
        this.pathManager = new PathManager();

        // Wave system
        const CONFIG_WAVES = Config.waves || [];
        this.waveManager = new WaveManager(this.entityManager, CONFIG_WAVES, GameEvents);
        GameEvents.on('wave:completed', () => {
            this.waveInProgress = false;
        });

        // Game state
        this.state = 'menu';
        this.lives = Config.game.startingLives;
        this.money = Config.game.startingMoney;
        this.score = 0;
        this.currentWave = 0;
        this.waveInProgress = false;

        // Selection state
        this.selectedTowerType = null;
        this.hoveredCell = null;

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
        this.setupDefaultPath();
        this.state = 'menu';
    }

    setupDefaultPath() {
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
        if (level.path) {
            level.path.forEach(wp => this.pathManager.addWaypoint(wp.x, wp.y));
        }
        this.lives = level.startingLives || Config.game.startingLives;
        this.money = level.startingMoney || Config.game.startingMoney;
        this.currentWave = 0;
        this.score = 0;
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
        if (!this.waveManager.startNextWave()) {
            this.waveInProgress = false;
        }
    }

    update(deltaTime) {
        if (this.state !== 'playing') return;
        this.waveManager.update(deltaTime);
        this.entityManager.update(deltaTime);
        this.updateTowerTargeting();
    }

    updateTowerTargeting() {
        const towers = this.entityManager.getEntitiesByType('tower');
        const enemies = this.entityManager.getEntitiesByType('enemy');
        for (const tower of towers) {
            if (!tower.target || !tower.target.active) {
                let closestEnemy = null;
                let closestDistance = Infinity;
                for (const enemy of enemies) {
                    const dx = enemy.x - tower.x;
                    const dy = enemy.y - tower.y;
                    const distance = Math.hypot(dx, dy);
                    if (distance <= tower.range && distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                }
                tower.setTarget(closestEnemy);
            }
        }
    }

    placeTower(x, y) {
        const towerConfig = Config.tower[this.selectedTowerType];
        if (!towerConfig) return;
        if (this.money >= towerConfig.cost && this.isValidTowerPosition(x, y)) {
            this.entityManager.spawnTower(this.selectedTowerType, x, y);
            this.money -= towerConfig.cost;
            this.audio.play('towerPlace');
        }
        this.selectedTowerType = null;
    }

    isValidTowerPosition(x, y) {
        const waypoints = this.pathManager.getWaypoints();
        for (let i = 0; i < waypoints.length - 1; i++) {
            const dist = this.pointToLineDistance(
                x, y,
                waypoints[i].x, waypoints[i].y,
                waypoints[i + 1].x, waypoints[i + 1].y
            );
            if (dist < 50) return false;
        }
        const towers = this.entityManager.getEntitiesByType('tower');
        return towers.every(t => Math.hypot(t.x - x, t.y - y) >= 50);
    }

    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1; const B = py - y1;
        const C = x2 - x1; const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
        let xx, yy;
        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }
        return Math.hypot(px - xx, py - yy);
    }

    enemyReachedEnd(enemy) {
        this.lives -= enemy.damage;
        this.audio.play('lifeLost');
        if (this.lives <= 0) this.gameOver();
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

    render() {
        this.renderer.clear();
        this.renderer.drawRect(0, 0, Config.canvas.width, Config.canvas.height, '#2d2d2d');
        this.renderPath();
        this.entityManager.render(this.renderer);
        this.renderUI();
        this.renderStateOverlay();
    }

    renderPath() {
        const waypoints = this.pathManager.getWaypoints();
        if (waypoints.length < 2) return;
        const ctx = this.renderer.ctx;
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 40;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(waypoints[0].x, waypoints[0].y);
        for (let i = 1; i < waypoints.length; i++) {
            ctx.lineTo(waypoints[i].x, waypoints[i].y);
        }
        ctx.stroke();
    }

    renderUI() {
        const ctx = this.renderer;
        ctx.drawRect(0, 0, Config.canvas.width, 40, 'rgba(0, 0, 0, 0.7)');
        ctx.drawText(`Lives: ${this.lives}`, 10, 28, 18, 'white');
        ctx.drawText(`Money: $${this.money}`, 150, 28, 18, 'gold');
        ctx.drawText(`Wave: ${this.currentWave}`, 300, 28, 18, 'white');
        ctx.drawText(`Score: ${this.score}`, 450, 28, 18, 'white');
        if (this.selectedTowerType) {
            ctx.drawText(`Selected: ${this.selectedTowerType.toUpperCase()} ($${Config.tower[this.selectedTowerType].cost})`, 600, 28, 14, 'cyan');
        }
        if (!this.waveInProgress) {
            ctx.drawText('Press SPACE to start wave', 10, Config.canvas.height - 10, 14, 'white');
        }
        ctx.drawText('1-3: Select tower | ESC: Pause', Config.canvas.width - 220, Config.canvas.height - 10, 12, 'gray');
        if (this.waveManager) {
            ctx.renderWaveInfo(
                this.waveManager.getCurrentWaveNumber(),
                this.waveManager.getTotalWaves(),
                this.waveManager.getEnemiesRemaining(),
                this.waveManager.getTotalEnemiesInWave()
            );
        }
    }

    renderStateOverlay() {
        const ctx = this.renderer;
        if (this.state === 'menu') {
            ctx.drawRect(0, 0, Config.canvas.width, Config.canvas.height, 'rgba(0, 0, 0, 0.8)');
            ctx.drawText('TOWER DEFENSE', Config.canvas.width / 2 - 120, Config.canvas.height / 2 - 50, 32, 'white');
            ctx.drawText('Click to Start', Config.canvas.width / 2 - 60, Config.canvas.height / 2 + 10, 18, 'gray');
        } else if (this.state === 'paused') {
            ctx.drawRect(0, 0, Config.canvas.width, Config.canvas.height, 'rgba(0, 0, 0, 0.5)');
            ctx.drawText('PAUSED', Config.canvas.width / 2 - 50, Config.canvas.height / 2, 32, 'white');
            ctx.drawText('Press ESC to resume', Config.canvas.width / 2 - 70, Config.canvas.height / 2 + 40, 16, 'gray');
        } else if (this.state === 'gameOver') {
            ctx.drawRect(0, 0, Config.canvas.width, Config.canvas.height, 'rgba(0, 0, 0, 0.8)');
            ctx.drawText('GAME OVER', Config.canvas.width / 2 - 80, Config.canvas.height / 2 - 20, 32, 'red');
            ctx.drawText(`Final Score: ${this.score}`, Config.canvas.width / 2 - 60, Config.canvas.height / 2 + 30, 18, 'white');
        } else if (this.state === 'victory') {
            ctx.drawRect(0, 0, Config.canvas.width, Config.canvas.height, 'rgba(0, 0, 0, 0.8)');
            ctx.drawText('VICTORY!', Config.canvas.width / 2 - 60, Config.canvas.height / 2 - 20, 32, 'gold');
            ctx.drawText(`Final Score: ${this.score}`, Config.canvas.width / 2 - 60, Config.canvas.height / 2 + 30, 18, 'white');
        }
    }

    destroy() {
        document.removeEventListener('click', this.handleClick);
        document.removeEventListener('keydown', this.handleKeyPress);
        this.stop();
    }
}

export default Game;
