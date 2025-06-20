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
        const newGameBtn = document.getElementById('newGameBtn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.startNewGame();
            });
        }
        
        const loadGameBtn = document.getElementById('loadGameBtn');
        if (loadGameBtn) {
            loadGameBtn.addEventListener('click', () => {
                this.showLoadGameMenu();
            });
        }
        
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showCredits();
            });
        }
        
        const creditsBtn = document.getElementById('creditsBtn');
        if (creditsBtn) {
            creditsBtn.addEventListener('click', () => {
                this.showCredits();
            });
        }
        
        // Global hotkeys
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'F5':
                    e.preventDefault();
                    if (this.state === 'playing') {
                        this.saveManager?.quickSave();
                    }
                    break;
                case 'F9':
                    e.preventDefault();
                    this.saveManager?.quickLoad();
                    break;
                case 'F12':
                    e.preventDefault();
                    this.toggleDebugMode();
                    break;
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
        
        // Start ambient music
        this.audioManager?.playMusic('ambient');
        
        this.setState('playing');
    }

    showLoadGameMenu() {
        console.log('Load game menu');
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
        console.log(`Debug mode: ${this.debugMode ? 'ON' : 'OFF'}`);
    }

    startGameLoop() {
        const gameLoop = (currentTime) => {
            this.deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            // Cap delta time to prevent spiral of death
            this.deltaTime = Math.min(this.deltaTime, 50);
            
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
        if (this.state !== 'playing') return;
        
        // Update game objects
        this.player?.update(deltaTime, this.inputManager, this.dungeon);
        
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.player, this.dungeon);
        });
        
        this.items.forEach(item => {
            item.update(deltaTime);
        });
        
        // Update camera to follow player
        if (this.player) {
            this.camera.setTarget(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
            this.camera.update(deltaTime);
        }
        
        // Update particle system
        this.particleSystem.update(deltaTime);
        
        // Update UI
        this.ui?.update();
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.state !== 'playing') return;
        
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
            if (this.camera.isVisible(enemy.x, enemy.y, this.tileSize, this.tileSize)) {
                enemy.render(this.ctx);
            }
        });
        
        // Render player
        this.player?.render(this.ctx);
        
        // Render particles
        this.particleSystem.render(this.ctx, this.camera);
        
        // Restore context
        this.ctx.restore();
        
        // Render debug info
        if (this.debugMode) {
            this.renderDebugInfo();
        }
    }

    renderDebugInfo() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`FPS: ${this.fps}`, 10, 25);
        this.ctx.fillText(`Enemies: ${this.enemies.length}`, 10, 45);
        this.ctx.fillText(`Particles: ${this.particleSystem.getParticleCount()}`, 10, 65);
        
        if (this.player) {
            const tileX = Math.floor(this.player.x / this.tileSize);
            const tileY = Math.floor(this.player.y / this.tileSize);
            this.ctx.fillText(`Player: (${tileX}, ${tileY})`, 10, 85);
        }
    }

    addEnemy(enemy) {
        this.enemies.push(enemy);
    }

    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
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

window.Game = Game;