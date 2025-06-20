// Global game instance
let game;

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
});

// Enhanced Game class with complete integration
class Game {
    constructor() {
        // Core systems
        this.canvas = null;
        this.ctx = null;
        this.assetLoader = new AssetLoader();
        this.audioManager = null;
        this.inputManager = null;
        this.camera = null;
        this.ui = null;
        this.saveManager = null;
        this.particleSystem = new ParticleSystem();
        
        // Game state
        this.state = 'loading';
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.totalPlaytime = 0;
        
        // Game objects
        this.player = null;
        this.dungeon = null;
        this.enemies = [];
        this.items = [];
        
        // Game settings
        this.tileSize = 32;
        this.viewportWidth = 25;
        this.viewportHeight = 19;
        
        // Statistics
        this.statistics = {
            enemiesKilled: 0,
            itemsFound: 0,
            damageDealt: 0,
            damageTaken: 0,
            levelsCompleted: 0,
            timeSpentInCombat: 0
        };
        
        // Debug mode
        this.debugMode = false;
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing Dungeon Crawler...');
            
            this.setupCanvas();
            this.setupEventListeners();
            
            // Load assets with progress tracking
            this.assetLoader.onProgress((progress, loaded, total) => {
                this.updateLoadingScreen(progress, loaded, total);
            });
            
            await this.assetLoader.loadAllAssets();
            console.log('Assets loaded successfully');
            
            // Initialize all systems
            this.audioManager = new AudioManager(this.assetLoader);
            this.inputManager = new InputManager();
            this.camera = new Camera(this.canvas.width, this.canvas.height);
            this.ui = new UIManager(this);
            this.saveManager = new SaveManager();
            
            console.log('All systems initialized');
            
            // Check for auto-save
            this.checkAutoSave();
            
            this.setState('menu');
            this.startGameLoop();
            
            console.log('Game initialization complete');
        } catch (error) {
            console.error('Game initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('Game canvas not found');
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('2D context not supported');
        }
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Optimize canvas for pixel art
        this.ctx.imageSmoothingEnabled = false;
    }

    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        const maxWidth = container.clientWidth - 40;
        const maxHeight = container.clientHeight - 40;
        
        const aspectRatio = this.viewportWidth / this.viewportHeight;
        let width = maxWidth;
        let height = width / aspectRatio;
        
        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }
        
        // Set actual canvas resolution
        this.canvas.width = this.viewportWidth * this.tileSize;
        this.canvas.height = this.viewportHeight * this.tileSize;
        
        // Set display size
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // Update camera
        if (this.camera) {
            this.camera.width = this.canvas.width;
            this.camera.height = this.canvas.height;
        }
    }

    setupEventListeners() {
        // Menu button events
        document.getElementById('newGameBtn')?.addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('loadGameBtn')?.addEventListener('click', () => {
            this.showLoadGameMenu();
        });
        
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.ui.showPanel('settings');
        });
        
        document.getElementById('creditsBtn')?.addEventListener('click', () => {
            this.showCredits();
        });
        
        // Global hotkeys
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'F5':
                    e.preventDefault();
                    if (this.state === 'playing') {
                        this.saveManager.quickSave();
                    }
                    break;
                case 'F9':
                    e.preventDefault();
                    this.saveManager.quickLoad();
                    break;
                case 'F12':
                    e.preventDefault();
                    this.toggleDebugMode();
                    break;
            }
        });
        
        // Handle page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state === 'playing') {
                this.setState('paused');
            }
        });
        
        // Handle page unload
        window.addEventListener('beforeunload', () => {
            if (this.state === 'playing') {
                this.saveManager.autoSave();
            }
        });
    }

    updateLoadingScreen(progress, loaded, total) {
        const progressFill = document.getElementById('progressFill');
        const loadingText = document.getElementById('loadingText');
        
        if (progressFill) {
            progressFill.style.width = Math.round(progress) + '%';
        }
        
        if (loadingText) {
            loadingText.textContent = `Loading assets... ${loaded}/${total}`;
        }
    }

    handleInitializationError(error) {
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 5px;
            font-family: monospace;
            z-index: 9999;
        `;
        errorMsg.innerHTML = `
            <h3>Game Failed to Initialize</h3>
            <p>${error.message}</p>
            <p>Please refresh the page to try again.</p>
        `;
        document.body.appendChild(errorMsg);
    }

    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        
        console.log(`State changed: ${oldState} -> ${newState}`);
        
        // Show/hide UI elements based on state
        this.updateUIVisibility();
        
        // State-specific logic
        switch(newState) {
            case 'loading':
                break;
            case 'menu':
                this.audioManager?.stopMusic();
                break;
            case 'playing':
                this.audioManager?.updateMusicForGameState('exploration');
                break;
            case 'paused':
                break;
            case 'gameover':
                this.handleGameOver();
                break;
            case 'victory':
                this.handleVictory();
                break;
        }
    }

    updateUIVisibility() {
        const elements = {
            loadingScreen: document.getElementById('loadingScreen'),
            mainMenu: document.getElementById('mainMenu'),
            gameUI: document.getElementById('gameUI')
        };
        
        // Hide all
        Object.values(elements).forEach(el => {
            if (el) el.classList.add('hidden');
        });
        
        // Show relevant UI
        switch(this.state) {
            case 'loading':
                elements.loadingScreen?.classList.remove('hidden');
                break;
            case 'menu':
                elements.mainMenu?.classList.remove('hidden');
                break;
            case 'playing':
            case 'paused':
                elements.gameUI?.classList.remove('hidden');
                break;
        }
    }

    startNewGame() {
        console.log('Starting new game...');
        
        // Reset statistics
        this.statistics = {
            enemiesKilled: 0,
            itemsFound: 0,
            damageDealt: 0,
            damageTaken: 0,
            levelsCompleted: 0,
            timeSpentInCombat: 0
        };
        
        // Initialize game objects
        this.player = new Player(100, 100, this.assetLoader);
        this.dungeon = new Dungeon(50, 50, this.assetLoader);
        this.enemies = [];
        this.items = [];
        this.particleSystem.clear();
        
        // Generate first level
        this.dungeon.generateLevel(1);
        
        // Place player at spawn point
        const spawn = this.dungeon.getSpawnPoint();
        this.player.setPosition(spawn.x * this.tileSize, spawn.y * this.tileSize);
        
        // Center camera on player
        this.camera.centerOn(this.player.x, this.player.y);
        
        // Set dungeon bounds for camera
        this.camera.setBounds(0, 0, this.dungeon.width * this.tileSize, this.dungeon.height * this.tileSize);
        
        // Reset playtime
        this.totalPlaytime = 0;
        
        console.log('New game started successfully');
        this.setState('playing');
    }

    checkAutoSave() {
        const autoSave = this.saveManager.getSaveMetadata(0);
        if (autoSave) {
            console.log('Auto-save found');
        }
    }

    showLoadGameMenu() {
        this.ui.showPanel('loadGame');
    }

    showCredits() {
        const creditsText = `
            DUNGEON CRAWLER RPG
            
            Programming: Developer
            Art Assets: Various artists (see CREDITS.TXT)
            Music: Dark Fantasy Ambient
            
            Built with HTML5 Canvas and JavaScript
            
            Thanks for playing!
        `;
        
        alert(creditsText);
    }

    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        this.ui.showNotification(`Debug mode: ${this.debugMode ? 'ON' : 'OFF'}`, 2000, 'info');
    }

    startGameLoop() {
        const gameLoop = (currentTime) => {
            // Calculate delta time
            this.deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            // Cap delta time to prevent spiral of death
            this.deltaTime = Math.min(this.deltaTime, 50);
            
            // Update playtime
            if (this.state === 'playing') {
                this.totalPlaytime += this.deltaTime;
            }
            
            // Calculate FPS
            this.frameCount++;
            if (this.frameCount % 60 === 0) {
                this.fps = Math.round(1000 / this.deltaTime);
            }
            
            try {
                this.update(this.deltaTime);
                this.render();
            } catch (error) {
                console.error('Game loop error:', error);
            }
            
            requestAnimationFrame(gameLoop);
        };
        
        requestAnimationFrame(gameLoop);
    }

    update(deltaTime) {
        // Update input manager
        this.inputManager?.update();
        
        // State-specific updates
        if (this.state === 'playing') {
            this.updatePlaying(deltaTime);
        }
        
        // Always update UI and camera
        this.ui?.update();
        this.camera?.update(deltaTime);
        
        // Update particle system
        this.particleSystem.update(deltaTime);
    }

    updatePlaying(deltaTime) {
        // Update player
        if (this.player) {
            this.player.update(deltaTime, this.inputManager, this.dungeon);
            
            // Update camera to follow player
            this.camera.setTarget(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
        }
        
        // Update enemies
        this.enemies.forEach((enemy, index) => {
            enemy.update(deltaTime, this.player, this.dungeon);
            
            // Remove dead enemies
            if (enemy.state === 'dead') {
                this.enemies.splice(index, 1);
            }
        });
        
        // Update items
        this.items.forEach(item => {
            item.update(deltaTime);
        });
        
        // Check level progression
        this.checkLevelProgression();
        
        // Update combat state for music
        this.updateCombatState();
    }

    checkLevelProgression() {
        if (!this.player || !this.dungeon) return;
        
        const playerTileX = Math.floor(this.player.x / this.tileSize);
        const playerTileY = Math.floor(this.player.y / this.tileSize);
        const tile = this.dungeon.getTile(playerTileX, playerTileY);
        
        if (tile === this.dungeon.TILES.STAIRS_DOWN) {
            this.descendLevel();
        }
    }

    descendLevel() {
        const nextLevel = this.dungeon.currentLevel + 1;
        
        // Clear current level entities
        this.enemies = [];
        this.items = [];
        this.particleSystem.clear();
        
        // Generate next level
        this.dungeon.generateLevel(nextLevel);
        
        // Place player at spawn
        const spawn = this.dungeon.getSpawnPoint();
        this.player.setPosition(spawn.x * this.tileSize, spawn.y * this.tileSize);
        
        // Update statistics
        this.statistics.levelsCompleted++;
        
        // Show level transition
        this.ui.showNotification(`Descended to Floor ${nextLevel}`, 3000, 'info');
        
        // Save progress
        this.saveManager.autoSave();
    }

    updateCombatState() {
        const inCombat = this.enemies.some(enemy => 
            enemy.state === 'chase' || enemy.state === 'attack'
        );
        
        if (inCombat && this.audioManager) {
            this.audioManager.updateMusicForGameState('combat');
        } else if (this.audioManager) {
            this.audioManager.updateMusicForGameState('exploration');
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.state === 'playing' || this.state === 'paused') {
            this.renderGame();
        }
        
        // Render debug information
        if (this.debugMode) {
            this.renderDebugInfo();
        }
    }

    renderGame() {
        // Save context for camera transforms
        this.ctx.save();
        
        // Apply camera transform
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Render dungeon
        this.dungeon?.render(this.ctx, this.camera);
        
        // Render items
        this.items.forEach(item => {
            if (this.camera.isVisible(item.x, item.y, this.tileSize, this.tileSize)) {
                item.render(this.ctx);
            }
        });
        
        // Render enemies
        this.enemies.forEach(enemy => {
            if (this.camera.isVisible(enemy.x, enemy.y, enemy.width, enemy.height)) {
                enemy.render(this.ctx);
            }
        });
        
        // Render player
        this.player?.render(this.ctx);
        
        // Render particles
        this.particleSystem.render(this.ctx, this.camera);
        
        // Restore context
        this.ctx.restore();
        
        // Render pause overlay
        if (this.state === 'paused') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = '48px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    renderDebugInfo() {
        const debugInfo = [
            `FPS: ${this.fps}`,
            `State: ${this.state}`,
            `Enemies: ${this.enemies.length}`,
            `Items: ${this.items.length}`,
            `Particles: ${this.particleSystem.getParticleCount()}`
        ];
        
        if (this.player) {
            const tileX = Math.floor(this.player.x / this.tileSize);
            const tileY = Math.floor(this.player.y / this.tileSize);
            debugInfo.push(`Player: (${tileX}, ${tileY})`);
            debugInfo.push(`Health: ${Math.floor(this.player.stats.health)}/${this.player.stats.maxHealth}`);
        }
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '14px monospace';
        this.ctx.textAlign = 'left';
        
        debugInfo.forEach((info, index) => {
            this.ctx.fillText(info, 10, 25 + index * 20);
        });
    }

    handleGameOver() {
        console.log('Game Over');
        
        // Stop music
        this.audioManager?.stopMusic();
        
        // Show game over screen
        setTimeout(() => {
            const playAgain = confirm('Game Over! Play again?');
            if (playAgain) {
                this.startNewGame();
            } else {
                this.setState('menu');
            }
        }, 2000);
    }

    handleVictory() {
        console.log('Victory!');
        
        // Play victory music
        this.audioManager?.playMusic('victory');
        
        // Show victory screen
        this.ui.showNotification('Congratulations! You completed the dungeon!', 10000, 'success');
        
        // Save progress
        this.saveManager.saveGame();
    }

    // Public API methods
    addEnemy(enemy) {
        this.enemies.push(enemy);
    }

    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            this.statistics.enemiesKilled++;
        }
    }

    addItem(item) {
        this.items.push(item);
    }

    removeItem(item) {
        const index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
        }
    }

    addParticle(particle) {
        this.particleSystem.addParticle(particle);
    }
}