import GameLoop from './gameLoop.js';
import Renderer from './renderer.js';
import InputHandler from './input.js';
import AudioManager from './audio.js';
import EntityManager from './entityManager.js';
import PathManager from '../entities/pathManager.js';
import Config from '../config.js';
import WaveManager from './waveManager.js';
import { gameEvents, GameEvents } from './EventEmitter.js';

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
        this.waveManager = new WaveManager(this.entityManager, CONFIG_WAVES, gameEvents);
        gameEvents.on('wave:completed', () => {
            this.waveInProgress = false;
            if (this.waveManager.isAllWavesComplete()) {
                this.victory();
            }
        });

        // Listen for enemy events directly via event system
        gameEvents.on(GameEvents.ENEMY_KILLED, (data) => {
            this.money += data.reward || 0;
            this.score += (data.reward || 0) * 10;
            this.audio.play('enemyDeath');
        });
        gameEvents.on(GameEvents.ENEMY_REACHED_END, (data) => {
            this.lives -= data.damage || 1;
            this.audio.play('lifeLost');
            if (this.lives <= 0) this.gameOver();
        });

        // Game state
        this.state = 'mainMenu';
        this.lives = Config.game.startingLives;
        this.money = Config.game.startingMoney;
        this.score = 0;
        this.currentWave = 0;
        this.waveInProgress = false;
        this.wavePaused = false;

        // Selection state
        this.selectedTowerType = null;
        this.hoveredCell = null;
        this.placementError = null;
        this.placementErrorTimer = 0;

        // Main menu state
        this.mainMenuOptions = [
            { text: 'Play Game', action: 'play' },
            { text: 'Select Map', action: 'selectMap' },
            { text: 'Settings', action: 'settings' },
            { text: 'Exit Game', action: 'exitGame' }
        ];
        this.selectedMainMenuOption = 0;
        this.selectedMapIndex = 0;
        this.availableMaps = Game.getAvailableMaps();
        this.showingMapSelector = false;
        this.showingSettings = false;

        // Pause menu state
        this.pauseMenuOptions = [
            { text: 'Continue', action: 'continue' },
            { text: 'Restart', action: 'restart' },
            { text: 'Settings', action: 'settings' },
            { text: 'Exit to Menu', action: 'exit' }
        ];
        this.selectedMenuOption = 0;

        // Settings
        this.settings = {
            musicVolume: 0.5,
            sfxVolume: 0.8,
            difficulty: 'normal'
        };
        this.selectedSettingOption = 0; // 0 = music, 1 = sfx

        this.handleClick = this.handleClick.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', this.handleClick);
        document.addEventListener('keydown', this.handleKeyPress);
    }

    handleClick(event) {
        console.log('[Game] handleClick - state:', this.state);
        const mousePos = this.input.getMousePosition();

        // Handle main menu clicks
        if (this.state === 'mainMenu') {
            if (this.showingMapSelector) {
                this.handleMapSelectorClick(mousePos);
            } else if (this.showingSettings) {
                this.handleSettingsClick(mousePos);
            } else {
                this.handleMainMenuClick(mousePos);
            }
            return;
        }

        // Handle pause menu clicks
        if (this.state === 'pauseMenu') {
            this.handleMenuClick(mousePos);
            return;
        }

        // Handle in-game clicks
        if (this.state === 'playing') {
            console.log('[Game] Mouse position:', mousePos.x, mousePos.y);
            if (this.selectedTowerType) {
                console.log('[Game] Placing tower:', this.selectedTowerType);
                this.placeTower(mousePos.x, mousePos.y);
            }
            return;
        }

        // Old menu click-to-start (for backwards compatibility)
        if (this.state === 'menu') {
            console.log('[Game] Starting game from old menu...');
            this.startGame();
        }
    }

    handleMenuClick(mousePos) {
        // Calculate menu button positions
        const menuX = Config.canvas.width / 2 - 100;
        const menuY = Config.canvas.height / 2 - 100;
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonSpacing = 60;

        for (let i = 0; i < this.pauseMenuOptions.length; i++) {
            const buttonY = menuY + i * buttonSpacing;

            if (mousePos.x >= menuX && mousePos.x <= menuX + buttonWidth &&
                mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight) {
                this.executeMenuAction(this.pauseMenuOptions[i].action);
                return;
            }
        }
    }

    handleMainMenuClick(mousePos) {
        const menuX = Config.canvas.width / 2 - 100;
        const menuY = Config.canvas.height / 2 - 60;
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonSpacing = 60;

        for (let i = 0; i < this.mainMenuOptions.length; i++) {
            const buttonY = menuY + i * buttonSpacing;

            if (mousePos.x >= menuX && mousePos.x <= menuX + buttonWidth &&
                mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight) {
                this.executeMainMenuAction(this.mainMenuOptions[i].action);
                return;
            }
        }
    }

    handleMapSelectorClick(mousePos) {
        const menuX = Config.canvas.width / 2 - 150;
        const menuY = Config.canvas.height / 2 - 150;
        const buttonWidth = 300;
        const buttonHeight = 45;
        const buttonSpacing = 50;

        // Check map buttons
        for (let i = 0; i < this.availableMaps.length; i++) {
            const buttonY = menuY + 60 + i * buttonSpacing;

            if (mousePos.x >= menuX && mousePos.x <= menuX + buttonWidth &&
                mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight) {
                this.selectedMapIndex = i;
                this.showingMapSelector = false;
                this.loadMapAndStart(this.availableMaps[i].path);
                return;
            }
        }

        // Check back button
        const backButtonY = menuY + 60 + this.availableMaps.length * buttonSpacing + 20;
        if (mousePos.x >= menuX && mousePos.x <= menuX + buttonWidth &&
            mousePos.y >= backButtonY && mousePos.y <= backButtonY + buttonHeight) {
            this.showingMapSelector = false;
        }
    }

    handleSettingsClick(mousePos) {
        const menuX = Config.canvas.width / 2 - 150;
        const menuY = Config.canvas.height / 2 + 100;
        const buttonWidth = 300;
        const buttonHeight = 45;

        // Back button
        if (mousePos.x >= menuX && mousePos.x <= menuX + buttonWidth &&
            mousePos.y >= menuY && mousePos.y <= menuY + buttonHeight) {
            this.showingSettings = false;
        }
    }

    handleKeyPress(event) {
        console.log('[Game] Key pressed:', event.key, 'state:', this.state);

        // Handle main menu navigation
        if (this.state === 'mainMenu') {
            if (this.showingMapSelector) {
                // Map selector keyboard navigation
                switch (event.key) {
                    case 'ArrowUp':
                        this.selectedMapIndex = Math.max(0, this.selectedMapIndex - 1);
                        break;
                    case 'ArrowDown':
                        this.selectedMapIndex = Math.min(this.availableMaps.length - 1, this.selectedMapIndex + 1);
                        break;
                    case 'Enter':
                        this.showingMapSelector = false;
                        this.loadMapAndStart(this.availableMaps[this.selectedMapIndex].path);
                        break;
                    case 'Escape':
                        this.showingMapSelector = false;
                        break;
                }
            } else if (this.showingSettings) {
                // Settings keyboard navigation
                switch (event.key) {
                    case 'Escape':
                        this.showingSettings = false;
                        this.selectedSettingOption = 0; // Reset to music
                        break;
                    case 'ArrowUp':
                        this.selectedSettingOption = Math.max(0, this.selectedSettingOption - 1);
                        break;
                    case 'ArrowDown':
                        this.selectedSettingOption = Math.min(1, this.selectedSettingOption + 1);
                        break;
                    case 'ArrowLeft':
                        if (this.selectedSettingOption === 0) {
                            // Decrease music volume
                            this.settings.musicVolume = Math.max(0, this.settings.musicVolume - 0.1);
                            this.audio.setMusicVolume(this.settings.musicVolume);
                        } else if (this.selectedSettingOption === 1) {
                            // Decrease SFX volume
                            this.settings.sfxVolume = Math.max(0, this.settings.sfxVolume - 0.1);
                            this.audio.setSfxVolume(this.settings.sfxVolume);
                        }
                        break;
                    case 'ArrowRight':
                        if (this.selectedSettingOption === 0) {
                            // Increase music volume
                            this.settings.musicVolume = Math.min(1, this.settings.musicVolume + 0.1);
                            this.audio.setMusicVolume(this.settings.musicVolume);
                        } else if (this.selectedSettingOption === 1) {
                            // Increase SFX volume
                            this.settings.sfxVolume = Math.min(1, this.settings.sfxVolume + 0.1);
                            this.audio.setSfxVolume(this.settings.sfxVolume);
                        }
                        break;
                }
            } else {
                // Main menu keyboard navigation
                switch (event.key) {
                    case 'ArrowUp':
                        this.selectedMainMenuOption = Math.max(0, this.selectedMainMenuOption - 1);
                        break;
                    case 'ArrowDown':
                        this.selectedMainMenuOption = Math.min(this.mainMenuOptions.length - 1, this.selectedMainMenuOption + 1);
                        break;
                    case 'Enter':
                        this.executeMainMenuAction(this.mainMenuOptions[this.selectedMainMenuOption].action);
                        break;
                }
            }
            return;
        }

        // Handle pause menu navigation
        if (this.state === 'pauseMenu') {
            switch (event.key) {
                case 'ArrowUp':
                    this.selectedMenuOption = Math.max(0, this.selectedMenuOption - 1);
                    break;
                case 'ArrowDown':
                    this.selectedMenuOption = Math.min(this.pauseMenuOptions.length - 1, this.selectedMenuOption + 1);
                    break;
                case 'Enter':
                    this.executeMenuAction(this.pauseMenuOptions[this.selectedMenuOption].action);
                    break;
                case 'Escape':
                    this.state = 'playing';
                    this.selectedMenuOption = 0;
                    break;
            }
            return;
        }

        switch (event.key) {
            case 'Escape':
                if (this.state === 'playing') {
                    this.openPauseMenu();
                }
                break;
            case '1':
                if (this.state === 'playing') {
                    this.selectedTowerType = 'basic';
                    console.log('[Game] Selected tower: basic');
                }
                break;
            case '2':
                if (this.state === 'playing') {
                    this.selectedTowerType = 'sniper';
                    console.log('[Game] Selected tower: sniper');
                }
                break;
            case '3':
                if (this.state === 'playing') {
                    this.selectedTowerType = 'rapid';
                    console.log('[Game] Selected tower: rapid');
                }
                break;
            case ' ':
                console.log('[Game] Space pressed, waveInProgress:', this.waveInProgress, 'wavePaused:', this.wavePaused);
                if (this.state === 'playing') {
                    if (!this.waveInProgress) {
                        console.log('[Game] Starting next wave...');
                        this.startNextWave();
                    } else {
                        // Toggle wave pause
                        this.wavePaused = !this.wavePaused;
                        console.log('[Game] Wave', this.wavePaused ? 'paused' : 'resumed');
                    }
                }
                break;
        }
    }

    init() {
        this.setupDefaultPath();
        this.state = 'mainMenu';
        // Start the render loop immediately so main menu is visible
        this.start();
    }

    setupDefaultPath() {
        this.pathManager.addWaypoint(0, 100);
        this.pathManager.addWaypoint(200, 100);
        this.pathManager.addWaypoint(200, 300);
        this.pathManager.addWaypoint(600, 300);
        this.pathManager.addWaypoint(600, 500);
        this.pathManager.addWaypoint(800, 500);

        // Set path on entityManager for WaveManager to use
        this.entityManager.path = this.pathManager.getWaypoints();
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

    /**
     * Load a map from a JSON file
     * @param {string} mapPath - Path to the map JSON file (e.g., './maps/default.json')
     * @returns {Promise<boolean>} - True if loaded successfully
     */
    async loadMapFromFile(mapPath) {
        try {
            console.log('[Game] Loading map from:', mapPath);
            const response = await fetch(mapPath);

            if (!response.ok) {
                throw new Error(`Failed to load map: ${response.status} ${response.statusText}`);
            }

            const mapData = await response.json();
            console.log('[Game] Map loaded:', mapData.name);

            // Validate map data
            if (!mapData.path || !mapData.path.waypoints || mapData.path.waypoints.length < 2) {
                throw new Error('Invalid map data: path must have at least 2 waypoints');
            }

            // Clear existing path
            this.pathManager.clearWaypoints();

            // Load waypoints from map
            mapData.path.waypoints.forEach(wp => {
                this.pathManager.addWaypoint(wp.x, wp.y);
            });

            // Set path on entity manager for WaveManager
            this.entityManager.path = this.pathManager.getWaypoints();

            // Load settings
            if (mapData.settings) {
                this.lives = mapData.settings.startingLives || Config.game.startingLives;
                this.money = mapData.settings.startingMoney || Config.game.startingMoney;
            }

            // Store map metadata
            this.currentMapName = mapData.name || 'Unknown Map';
            this.currentMapDescription = mapData.description || '';

            console.log('[Game] Map loaded successfully:', this.currentMapName);
            return true;

        } catch (error) {
            console.error('[Game] Failed to load map:', error);
            console.log('[Game] Falling back to default path');
            this.setupDefaultPath();
            return false;
        }
    }

    /**
     * Get list of available maps
     * @returns {Array} List of map file paths
     */
    static getAvailableMaps() {
        return [
            { name: 'Default Map', path: './maps/default.json', description: 'The standard winding path' },
            { name: 'Straight Shot', path: './maps/straight.json', description: 'Simple straight path' },
            { name: 'Serpentine Path', path: './maps/serpentine.json', description: 'Winding S-shaped path' },
            { name: 'Spiral Fortress', path: './maps/spiral.json', description: 'Challenging spiral path' }
        ];
    }

    startGame() {
        this.state = 'playing';
        // Game loop already running from init(), just change state
    }

    openPauseMenu() {
        this.state = 'pauseMenu';
        this.selectedMenuOption = 0;
        console.log('[Game] Pause menu opened');
    }

    executeMenuAction(action) {
        console.log('[Game] Menu action:', action);
        switch (action) {
            case 'continue':
                this.state = 'playing';
                this.selectedMenuOption = 0;
                break;
            case 'restart':
                this.restartGame();
                break;
            case 'settings':
                this.showingSettings = true;
                this.state = 'mainMenu';
                break;
            case 'exit':
                this.exitToMenu();
                break;
        }
    }

    executeMainMenuAction(action) {
        console.log('[Game] Main menu action:', action);
        switch (action) {
            case 'play':
                this.startGameFromMenu();
                break;
            case 'selectMap':
                this.showingMapSelector = true;
                break;
            case 'settings':
                this.showingSettings = true;
                break;
            case 'exitGame':
                this.exitGame();
                break;
        }
    }

    startGameFromMenu() {
        // Load current selected map and start
        const selectedMap = this.availableMaps[this.selectedMapIndex];
        this.loadMapAndStart(selectedMap.path);
    }

    async loadMapAndStart(mapPath) {
        console.log('[Game] Loading map and starting:', mapPath);
        await this.loadMapFromFile(mapPath);
        this.state = 'menu';
        // Auto-start after brief moment
        setTimeout(() => {
            if (this.state === 'menu') {
                this.startGame();
            }
        }, 100);
    }

    exitGame() {
        // Try to close the window (works in Electron)
        if (window.close) {
            window.close();
        } else {
            console.log('[Game] Cannot close window - not in Electron');
            alert('Press Alt+F4 or close the window to exit');
        }
    }

    restartGame() {
        // Reset game state
        this.lives = Config.game.startingLives;
        this.money = Config.game.startingMoney;
        this.score = 0;
        this.currentWave = 0;
        this.waveInProgress = false;
        this.wavePaused = false;
        this.selectedTowerType = null;
        this.entityManager.clear();
        this.waveManager.currentWaveIndex = 0;
        this.state = 'playing';
        // Re-apply current path for enemies
        if (this.pathManager && this.entityManager) {
            const currentPath = this.pathManager.getWaypoints();
            this.entityManager.path = currentPath;
        }
        console.log('[Game] Game restarted');
    }

    exitToMenu() {
        // Reset to main menu state
        this.lives = Config.game.startingLives;
        this.money = Config.game.startingMoney;
        this.score = 0;
        this.currentWave = 0;
        this.waveInProgress = false;
        this.wavePaused = false;
        this.selectedTowerType = null;
        this.showingMapSelector = false;
        this.showingSettings = false;
        this.entityManager.clear();
        this.waveManager.currentWaveIndex = 0;
        this.state = 'mainMenu';
        console.log('[Game] Exited to main menu');
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

        // Count down placement error display
        if (this.placementErrorTimer > 0) {
            this.placementErrorTimer -= deltaTime * 1000;
            if (this.placementErrorTimer <= 0) {
                this.placementError = null;
                this.placementErrorTimer = 0;
            }
        }

        // Pause wave updates if wavePaused
        if (!this.wavePaused) {
            this.waveManager.update(deltaTime);
            this.entityManager.update(deltaTime);
            this.updateTowerTargeting();
        }
    }

    updateTowerTargeting() {
        // Targeting is now handled inside tower.update() via entityManager.findClosestEnemy()
        // This method is kept as a no-op for any external callers
    }

    placeTower(x, y) {
        console.log('[Game] placeTower called at', x, y);
        const towerConfig = Config.tower[this.selectedTowerType];
        if (!towerConfig) {
            console.log('[Game] No tower config for type:', this.selectedTowerType);
            return;
        }
        console.log('[Game] Tower cost:', towerConfig.cost, 'Player money:', this.money);

        // Check money first
        if (this.money < towerConfig.cost) {
            console.log('[Game] Not enough money');
            this.placementError = 'Not enough money!';
            this.placementErrorTimer = 2000;
            return; // Keep selectedTowerType so user can try another position
        }

        const isValidPos = this.isValidTowerPosition(x, y);
        console.log('[Game] Is valid position:', isValidPos);
        if (isValidPos) {
            console.log('[Game] Spawning tower!');
            // Center tower at click position (matches preview)
            const tx = x - towerConfig.width / 2;
            const ty = y - towerConfig.height / 2;
            this.entityManager.spawnTower(this.selectedTowerType, tx, ty);
            this.money -= towerConfig.cost;
            this.audio.play('towerPlace');
            this.placementError = null;
            this.selectedTowerType = null;
        } else {
            console.log('[Game] Invalid position');
            this.placementError = 'Cannot place here!';
            this.placementErrorTimer = 2000;
            // Keep selectedTowerType so user can try another position
        }
    }

    isValidTowerPosition(x, y) {
        const towerConfig = Config.tower[this.selectedTowerType];
        if (!towerConfig) return false;

        const waypoints = this.pathManager.getWaypoints();
        const pathWidth = 40; // Path visual width from config
        const towerSize = Math.max(towerConfig.width, towerConfig.height);

        // Calculate required clearance: half path width + half tower size + safety buffer
        const requiredClearance = (pathWidth / 2) + (towerSize / 2) + 15;

        console.log('[Game] Checking position', x, y, 'clearance needed:', requiredClearance);

        // Check distance to each path segment
        for (let i = 0; i < waypoints.length - 1; i++) {
            const dist = this.pointToLineDistance(
                x, y,
                waypoints[i].x, waypoints[i].y,
                waypoints[i + 1].x, waypoints[i + 1].y
            );

            if (dist < requiredClearance) {
                console.log('[Game] Too close to path segment', i, '- distance:', dist.toFixed(1), 'needed:', requiredClearance);
                return false;
            }
        }

        // Check distance to other towers (prevent overlap)
        const towers = this.entityManager.getEntitiesByType('tower');
        for (const tower of towers) {
            const distance = Math.hypot(tower.x - x, tower.y - y);
            const minDistance = (towerSize / 2) + (Math.max(tower.width, tower.height) / 2) + 10;

            if (distance < minDistance) {
                console.log('[Game] Too close to existing tower - distance:', distance.toFixed(1), 'needed:', minDistance);
                return false;
            }
        }

        // Check if tower would be within canvas bounds
        const halfSize = towerSize / 2;
        if (x - halfSize < 0 || x + halfSize > Config.canvas.width ||
            y - halfSize < 0 || y + halfSize > Config.canvas.height) {
            console.log('[Game] Tower would be outside canvas bounds');
            return false;
        }

        return true;
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
        // Keep render loop running to show game over screen
        console.log('Game Over! Final Score:', this.score);
    }

    victory() {
        this.state = 'victory';
        // Keep render loop running to show victory screen
        console.log('Victory! Final Score:', this.score);
    }

    render() {
        this.renderer.clear();
        this.renderer.drawRect(0, 0, Config.canvas.width, Config.canvas.height, '#2d2d2d');
        this.renderPath();
        this.entityManager.render(this.renderer);
        this.renderTowerPlacementPreview();
        this.renderUI();
        this.renderStateOverlay();
        this.renderDebugInfo();
    }

    renderTowerPlacementPreview() {
        if (this.state !== 'playing' || !this.selectedTowerType) return;

        const mousePos = this.input.getMousePosition();
        const towerConfig = Config.tower[this.selectedTowerType];
        if (!towerConfig) return;

        const canAfford = this.money >= towerConfig.cost;
        const isValid = canAfford && this.isValidTowerPosition(mousePos.x, mousePos.y);
        const color = isValid ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';

        // Draw preview of tower at mouse position
        this.renderer.drawRect(
            mousePos.x - towerConfig.width / 2,
            mousePos.y - towerConfig.height / 2,
            towerConfig.width,
            towerConfig.height,
            color
        );

        // Draw range indicator
        this.renderer.drawCircleOutline(mousePos.x, mousePos.y, towerConfig.range, color, 2);

        // Show cost warning if can't afford
        if (!canAfford) {
            this.renderer.drawText(`Need $${towerConfig.cost} (have $${this.money})`, mousePos.x - 60, mousePos.y - towerConfig.height / 2 - 10, 12, 'red');
        }
    }

    renderDebugInfo() {
        // Show debug info in corner - helps verify game is running
        const ctx = this.renderer;
        const mousePos = this.input.getMousePosition();
        ctx.drawText(`State: ${this.state}`, 10, Config.canvas.height - 50, 12, 'lime');
        ctx.drawText(`Mouse: ${Math.round(mousePos.x)}, ${Math.round(mousePos.y)}`, 10, Config.canvas.height - 35, 12, 'lime');
        ctx.drawText(`Tower: ${this.selectedTowerType || 'none'}`, 150, Config.canvas.height - 50, 12, 'lime');
        ctx.drawText(`Towers placed: ${this.entityManager.towers.length}`, 150, Config.canvas.height - 35, 12, 'lime');
    }

    renderPath() {
        const waypoints = this.pathManager.getWaypoints();
        if (waypoints.length < 2) return;
        const ctx = this.renderer.ctx;

        // Draw path border (darker)
        ctx.strokeStyle = '#5a4a3a';
        ctx.lineWidth = 44;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(waypoints[0].x, waypoints[0].y);
        for (let i = 1; i < waypoints.length; i++) {
            ctx.lineTo(waypoints[i].x, waypoints[i].y);
        }
        ctx.stroke();

        // Draw main path (lighter tan/brown for dirt road look)
        ctx.strokeStyle = '#8b7355';
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
        if (!this.waveInProgress && this.state === 'playing') {
            ctx.drawText('Press SPACE to start wave', 10, Config.canvas.height - 10, 16, 'yellow');
        } else if (this.waveInProgress && !this.wavePaused && this.state === 'playing') {
            ctx.drawText('Press SPACE to pause wave', 10, Config.canvas.height - 10, 14, 'yellow');
        }
        if (this.state === 'playing' && !this.selectedTowerType) {
            ctx.drawText('Press 1, 2, or 3 to select a tower', Config.canvas.width / 2 - 110, Config.canvas.height - 10, 14, 'cyan');
        }
        ctx.drawText('1-3: Select tower | ESC: Menu', Config.canvas.width - 220, Config.canvas.height - 10, 12, 'gray');

        // Show placement error message
        if (this.placementError) {
            ctx.drawRect(Config.canvas.width / 2 - 100, Config.canvas.height / 2 - 15, 200, 30, 'rgba(200, 0, 0, 0.8)');
            ctx.drawText(this.placementError, Config.canvas.width / 2 - 70, Config.canvas.height / 2 + 7, 16, 'white');
        }
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
        if (this.state === 'mainMenu') {
            if (this.showingMapSelector) {
                this.renderMapSelector();
            } else if (this.showingSettings) {
                this.renderSettings();
            } else {
                this.renderMainMenu();
            }
        } else if (this.state === 'menu') {
            ctx.drawRect(0, 0, Config.canvas.width, Config.canvas.height, 'rgba(0, 0, 0, 0.5)');
            ctx.drawText('TOWER DEFENSE', Config.canvas.width / 2 - 120, Config.canvas.height / 2 - 50, 32, 'white');
            ctx.drawText('Click to Start', Config.canvas.width / 2 - 60, Config.canvas.height / 2 + 10, 18, 'lime');
        } else if (this.state === 'pauseMenu') {
            this.renderPauseMenu();
        } else if (this.state === 'playing' && this.wavePaused) {
            // Show wave paused indicator
            ctx.drawRect(10, 50, 150, 30, 'rgba(0, 0, 0, 0.7)');
            ctx.drawText('WAVE PAUSED', 15, 70, 16, 'yellow');
            ctx.drawText('Press SPACE to resume', 15, 85, 12, 'gray');
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

    renderPauseMenu() {
        const ctx = this.renderer;

        // Semi-transparent background
        ctx.drawRect(0, 0, Config.canvas.width, Config.canvas.height, 'rgba(0, 0, 0, 0.7)');

        // Menu background
        const menuX = Config.canvas.width / 2 - 100;
        const menuY = Config.canvas.height / 2 - 100;
        const menuWidth = 200;
        const menuHeight = 240;

        ctx.drawRect(menuX - 10, menuY - 50, menuWidth + 20, menuHeight + 60, 'rgba(20, 20, 20, 0.9)');

        // Title
        ctx.drawText('PAUSED', Config.canvas.width / 2 - 50, menuY - 20, 28, 'white');

        // Menu buttons
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonSpacing = 60;

        for (let i = 0; i < this.pauseMenuOptions.length; i++) {
            const option = this.pauseMenuOptions[i];
            const buttonY = menuY + i * buttonSpacing;
            const isSelected = i === this.selectedMenuOption;

            // Button background
            const buttonColor = isSelected ? 'rgba(100, 150, 255, 0.7)' : 'rgba(50, 50, 50, 0.7)';
            ctx.drawRect(menuX, buttonY, buttonWidth, buttonHeight, buttonColor);

            // Button border
            const borderColor = isSelected ? '#6495ff' : '#555';
            ctx.ctx.strokeStyle = borderColor;
            ctx.ctx.lineWidth = 2;
            ctx.ctx.strokeRect(menuX, buttonY, buttonWidth, buttonHeight);

            // Button text
            const textColor = isSelected ? 'white' : '#ccc';
            const textX = Config.canvas.width / 2 - (option.text.length * 8) / 2;
            ctx.drawText(option.text, textX, buttonY + 32, 18, textColor);
        }

        // Instructions
        ctx.drawText('Use Arrow Keys or Click', Config.canvas.width / 2 - 95, menuY + menuHeight + 20, 14, 'gray');
        ctx.drawText('Press Enter or ESC', Config.canvas.width / 2 - 75, menuY + menuHeight + 40, 14, 'gray');
    }

    renderMainMenu() {
        const ctx = this.renderer;

        // Full background
        ctx.drawRect(0, 0, Config.canvas.width, Config.canvas.height, 'rgba(0, 0, 0, 0.85)');

        // Title
        ctx.drawText('TOWER DEFENSE GAME', Config.canvas.width / 2 - 180, 120, 36, '#FFD700');
        ctx.drawText('Defend your base from waves of enemies!', Config.canvas.width / 2 - 140, 160, 14, '#AAA');

        // Menu buttons
        const menuX = Config.canvas.width / 2 - 100;
        const menuY = Config.canvas.height / 2 - 60;
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonSpacing = 60;

        for (let i = 0; i < this.mainMenuOptions.length; i++) {
            const option = this.mainMenuOptions[i];
            const buttonY = menuY + i * buttonSpacing;
            const isSelected = i === this.selectedMainMenuOption;

            // Button background
            const buttonColor = isSelected ? 'rgba(100, 150, 255, 0.7)' : 'rgba(50, 50, 50, 0.7)';
            ctx.drawRect(menuX, buttonY, buttonWidth, buttonHeight, buttonColor);

            // Button border
            const borderColor = isSelected ? '#6495ff' : '#555';
            ctx.ctx.strokeStyle = borderColor;
            ctx.ctx.lineWidth = 2;
            ctx.ctx.strokeRect(menuX, buttonY, buttonWidth, buttonHeight);

            // Button text
            const textColor = isSelected ? 'white' : '#ccc';
            const textX = Config.canvas.width / 2 - (option.text.length * 9) / 2;
            ctx.drawText(option.text, textX, buttonY + 32, 18, textColor);
        }

        // Current map info
        const currentMap = this.availableMaps[this.selectedMapIndex];
        ctx.drawText(`Selected Map: ${currentMap.name}`, Config.canvas.width / 2 - 80, Config.canvas.height - 80, 14, '#AAA');

        // Instructions
        ctx.drawText('Use Arrow Keys or Click | Press Enter to select', Config.canvas.width / 2 - 135, Config.canvas.height - 50, 12, 'gray');

        // Version/credits
        ctx.drawText('v1.0 | Made with Claude Code', Config.canvas.width / 2 - 90, Config.canvas.height - 20, 12, '#666');
    }

    renderMapSelector() {
        const ctx = this.renderer;

        // Background
        ctx.drawRect(0, 0, Config.canvas.width, Config.canvas.height, 'rgba(0, 0, 0, 0.9)');

        // Title
        ctx.drawText('SELECT MAP', Config.canvas.width / 2 - 80, 100, 32, '#FFD700');

        // Map list
        const menuX = Config.canvas.width / 2 - 150;
        const menuY = Config.canvas.height / 2 - 150;
        const buttonWidth = 300;
        const buttonHeight = 45;
        const buttonSpacing = 50;

        for (let i = 0; i < this.availableMaps.length; i++) {
            const map = this.availableMaps[i];
            const buttonY = menuY + 60 + i * buttonSpacing;
            const isSelected = i === this.selectedMapIndex;

            // Button
            const buttonColor = isSelected ? 'rgba(100, 150, 255, 0.6)' : 'rgba(50, 50, 50, 0.6)';
            ctx.drawRect(menuX, buttonY, buttonWidth, buttonHeight, buttonColor);
            ctx.ctx.strokeStyle = isSelected ? '#6495ff' : '#555';
            ctx.ctx.lineWidth = 2;
            ctx.ctx.strokeRect(menuX, buttonY, buttonWidth, buttonHeight);

            // Map name and description
            ctx.drawText(map.name, menuX + 10, buttonY + 18, 16, 'white');
            ctx.drawText(map.description, menuX + 10, buttonY + 35, 12, '#AAA');
        }

        // Back button
        const backButtonY = menuY + 60 + this.availableMaps.length * buttonSpacing + 20;
        ctx.drawRect(menuX, backButtonY, buttonWidth, buttonHeight, 'rgba(80, 50, 50, 0.6)');
        ctx.ctx.strokeStyle = '#555';
        ctx.ctx.lineWidth = 2;
        ctx.ctx.strokeRect(menuX, backButtonY, buttonWidth, buttonHeight);
        ctx.drawText('Back to Menu', Config.canvas.width / 2 - 60, backButtonY + 28, 16, '#ccc');

        // Instructions
        ctx.drawText('Arrow Keys: Navigate | Enter: Select | ESC: Back', Config.canvas.width / 2 - 140, Config.canvas.height - 30, 12, 'gray');
    }

    renderSettings() {
        const ctx = this.renderer;

        // Background
        ctx.drawRect(0, 0, Config.canvas.width, Config.canvas.height, 'rgba(0, 0, 0, 0.9)');

        // Title
        ctx.drawText('SETTINGS', Config.canvas.width / 2 - 70, 100, 32, '#FFD700');

        // Settings info
        const menuX = Config.canvas.width / 2 - 150;
        const menuY = Config.canvas.height / 2 - 100;

        ctx.drawText('Audio Settings:', menuX, menuY, 18, 'white');

        // Music volume with visual bar and selection highlight
        const isMusicSelected = this.selectedSettingOption === 0;
        const musicTextColor = isMusicSelected ? 'white' : '#AAA';
        ctx.drawText(`${isMusicSelected ? '> ' : '  '}Music Volume: ${Math.round(this.settings.musicVolume * 100)}%`, menuX + 10, menuY + 40, 16, musicTextColor);
        const musicBarWidth = 200;
        const musicBarHeight = 10;
        ctx.drawRect(menuX + 20, menuY + 50, musicBarWidth, musicBarHeight, 'rgba(50, 50, 50, 0.8)');
        const musicBarColor = isMusicSelected ? 'rgba(100, 200, 100, 0.9)' : 'rgba(100, 150, 255, 0.8)';
        ctx.drawRect(menuX + 20, menuY + 50, musicBarWidth * this.settings.musicVolume, musicBarHeight, musicBarColor);

        // SFX volume with visual bar and selection highlight
        const isSfxSelected = this.selectedSettingOption === 1;
        const sfxTextColor = isSfxSelected ? 'white' : '#AAA';
        ctx.drawText(`${isSfxSelected ? '> ' : '  '}SFX Volume: ${Math.round(this.settings.sfxVolume * 100)}%`, menuX + 10, menuY + 90, 16, sfxTextColor);
        ctx.drawRect(menuX + 20, menuY + 100, musicBarWidth, musicBarHeight, 'rgba(50, 50, 50, 0.8)');
        const sfxBarColor = isSfxSelected ? 'rgba(100, 200, 100, 0.9)' : 'rgba(100, 150, 255, 0.8)';
        ctx.drawRect(menuX + 20, menuY + 100, musicBarWidth * this.settings.sfxVolume, musicBarHeight, sfxBarColor);

        ctx.drawText('Difficulty:', menuX, menuY + 140, 18, 'white');
        ctx.drawText(`Current: ${this.settings.difficulty}`, menuX + 20, menuY + 170, 16, '#AAA');

        // Back button
        const buttonY = Config.canvas.height / 2 + 100;
        const buttonWidth = 300;
        const buttonHeight = 45;
        ctx.drawRect(menuX, buttonY, buttonWidth, buttonHeight, 'rgba(80, 50, 50, 0.6)');
        ctx.ctx.strokeStyle = '#555';
        ctx.ctx.lineWidth = 2;
        ctx.ctx.strokeRect(menuX, buttonY, buttonWidth, buttonHeight);
        ctx.drawText('Back to Menu', Config.canvas.width / 2 - 60, buttonY + 28, 16, '#ccc');

        // Instructions
        ctx.drawText('Up/Down: Select | Left/Right: Adjust Volume | ESC: Back', Config.canvas.width / 2 - 165, Config.canvas.height - 30, 12, 'gray');
    }

    destroy() {
        document.removeEventListener('click', this.handleClick);
        document.removeEventListener('keydown', this.handleKeyPress);
        this.stop();
    }
}

export default Game;
