class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.assetLoader = new AssetLoader();
        this.audioManager = null;
        this.inputManager = null;
        this.camera = null;
        this.ui = null;
        
        // Game state
        this.state = 'loading'; // loading, menu, playing, paused, gameover
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        
        // Game objects
        this.player = null;
        this.dungeon = null;
        this.enemies = [];
        this.items = [];
        this.particles = [];
        
        // Game settings
        this.tileSize = 32;
        this.viewportWidth = 25;
        this.viewportHeight = 19;
        
        this.init();
    }

    async init() {
        this.setupCanvas();
        this.setupEventListeners();
        
        // Load assets
        this.assetLoader.onProgress((progress, loaded, total) => {
            this.updateLoadingScreen(progress, loaded, total);
        });
        
        await this.assetLoader.loadAllAssets();
        
        // Initialize systems
        this.audioManager = new AudioManager(this.assetLoader);
        this.inputManager = new InputManager();
        this.camera = new Camera(this.canvas.width, this.canvas.height);
        this.ui = new UIManager(this);
        
        this.setState('menu');
        this.startGameLoop();
    }

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Disable image smoothing for pixel art
        this.ctx.imageSmoothingEnabled = false;
    }

    resizeCanvas() {
        const maxWidth = window.innerWidth - 40;
        const maxHeight = window.innerHeight - 40;
        
        const aspectRatio = this.viewportWidth / this.viewportHeight;
        
        let width = maxWidth;
        let height = width / aspectRatio;
        
        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }
        
        this.canvas.width = this.viewportWidth * this.tileSize;
        this.canvas.height = this.viewportHeight * this.tileSize;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
    }

    setupEventListeners() {
        // Menu button events
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('loadGameBtn').addEventListener('click', () => {
            this.loadGame();
        });
        
        // Panel close events
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panel = e.target.getAttribute('data-panel');
                this.ui.closePanel(panel);
            });
        });
    }

    updateLoadingScreen(progress, loaded, total) {
        const progressFill = document.getElementById('progressFill');
        const loadingText = document.getElementById('loadingText');
        
        progressFill.style.width = progress + '%';
        loadingText.textContent = `Loading... ${loaded}/${total}`;
    }

    setState(newState) {
        this.state = newState;
        
        // Show/hide UI elements based on state
        switch(newState) {
            case 'loading':
                document.getElementById('loadingScreen').classList.remove('hidden');
                break;
            case 'menu':
                document.getElementById('loadingScreen').classList.add('hidden');
                document.getElementById('mainMenu').classList.remove('hidden');
                document.getElementById('gameUI').classList.add('hidden');
                break;
            case 'playing':
                document.getElementById('mainMenu').classList.add('hidden');
                document.getElementById('gameUI').classList.remove('hidden');
                break;
        }
    }

    startNewGame() {
        // Initialize game objects
        this.player = new Player(100, 100, this.assetLoader);
        this.dungeon = new Dungeon(50, 50, this.assetLoader);
        this.enemies = [];
        this.items = [];
        this.particles = [];
        
        // Generate first level
        this.dungeon.generateLevel(1);
        
        // Place player at spawn point
        const spawn = this.dungeon.getSpawnPoint();
        this.player.setPosition(spawn.x * this.tileSize, spawn.y * this.tileSize);
        
        // Start ambient music
        this.audioManager.playMusic('ambient_music');
        
        this.setState('playing');
    }

    startGameLoop() {
        const gameLoop = (currentTime) => {
            this.deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            // Calculate FPS
            this.frameCount++;
            if (this.frameCount % 60 === 0) {
                this.fps = Math.round(1000 / this.deltaTime);
            }
            
            this.update(this.deltaTime);
            this.render();
            
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
        
        this.particles.forEach((particle, index) => {
            particle.update(deltaTime);
            if (particle.isDead()) {
                this.particles.splice(index, 1);
            }
        });
        
        // Update camera to follow player
        if (this.player) {
            this.camera.followTarget(this.player.x, this.player.y);
            this.camera.update(deltaTime);
        }
        
        // Update UI
        this.ui.update();
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
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });
        
        // Restore context
        this.ctx.restore();
        
        // Render UI (always on top)
        this.renderDebugInfo();
    }

    renderDebugInfo() {
        if (this.state !== 'playing') return;
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`FPS: ${this.fps}`, 10, 25);
        this.ctx.fillText(`Enemies: ${this.enemies.length}`, 10, 45);
        this.ctx.fillText(`Particles: ${this.particles.length}`, 10, 65);
        
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
        this.particles.push(particle);
    }

    saveGame() {
        const saveData = {
            player: this.player.serialize(),
            dungeon: this.dungeon.serialize(),
            timestamp: Date.now()
        };
        
        localStorage.setItem('dungeonCrawlerSave', JSON.stringify(saveData));
    }

    loadGame() {
        const saveData = localStorage.getItem('dungeonCrawlerSave');
        if (saveData) {
            const data = JSON.parse(saveData);
            // Implement load logic
        }
    }
}

window.Game = Game;