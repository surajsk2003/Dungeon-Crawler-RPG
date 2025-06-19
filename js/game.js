// Core game logic
const game = {
    canvas: null,
    ctx: null,
    currentFloor: 1,
    gameRunning: false,
    keys: {},
    lastTime: 0,
    
    init: function() {
        canvas.init();
        this.canvas = canvas.element;
        this.ctx = canvas.ctx;
        
        player.init();
        this.setupEventListeners();
        this.generateLevel();
    },
    
    start: function() {
        this.gameRunning = true;
        gameLoop.init();
        gameLoop.start();
        ui.addMessage("Game started! Use WASD to move, Space to attack, F for Fireball.", "level");
    },
    
    generateLevel: function() {
        dungeon.generate();
        enemies.generate(this.currentFloor);
        items.generate();
    },
    
    setupEventListeners: function() {
        // Event listeners are now handled by canvas module
    },
    
    // Input handlers called by canvas module
    handleKeyDown: function(key, code) {
        this.keys[key.toLowerCase()] = true;
        
        if (key === ' ') {
            this.handleAttack();
        } else if (key.toLowerCase() === 'e') {
            items.useHealthPotion();
        } else if (key.toLowerCase() === 'r') {
            items.useManaPotion();
        } else if (key.toLowerCase() === 'f') {
            this.handleFireball();
        } else if (key === 'Enter') {
            if (enemies.list.length === 0) {
                this.nextFloor();
            }
        } else if (key.toLowerCase() === 'm') {
            const muted = audio.toggleMute();
            ui.elements.muteButton.textContent = muted ? '🔇 Sound Off' : '🔊 Sound On';
        }
    },
    
    handleKeyUp: function(key, code) {
        this.keys[key.toLowerCase()] = false;
    },
    
    handleMouseDown: function(x, y, button) {
        // Handle mouse clicks if needed
    },
    
    handleMouseUp: function(x, y, button) {
        // Handle mouse releases if needed
    },
    
    handleMouseMove: function(x, y) {
        // Handle mouse movement if needed
    },
    
    handleTouchStart: function(x, y) {
        // Handle touch start for mobile
    },
    
    handleTouchEnd: function(x, y) {
        // Handle touch end for mobile
    },
    
    handleTouchMove: function(x, y) {
        // Handle touch movement for mobile
    },
    
    handleAttack: function() {
        if (player.attack()) {
            enemies.takeDamage(player.data.attack);
        }
    },
    
    handleFireball: function() {
        if (player.castFireball()) {
            enemies.takeDamage(player.data.magicPower, 100);
            ui.addMessage("You cast Fireball!", "combat");
        } else if (player.data.mp < 15) {
            ui.addMessage("Not enough mana to cast Fireball!", "combat");
        }
    },
    
    nextFloor: function() {
        if (enemies.list.length > 0) {
            ui.addMessage('Clear all enemies before proceeding!');
            return;
        }
        
        this.currentFloor++;
        ui.addMessage(`Entering floor ${this.currentFloor}...`, 'level');
        this.generateLevel();
    },
    
    // Game loop now handled by gameLoop module
    
    update: function(deltaTime) {
        if (!this.gameRunning) return;
        
        player.update(deltaTime, this.keys);
        enemies.update(deltaTime);
        items.checkCollisions();
        ui.update();
    },
    
    render: function(deltaTime) {
        if (!this.gameRunning) return;
        
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Camera offset to center on player
        const cameraX = player.data.x - this.canvas.width / 2;
        const cameraY = player.data.y - this.canvas.height / 2;
        
        ctx.save();
        ctx.translate(-cameraX, -cameraY);
        
        this.renderDungeon(ctx);
        this.renderItems(ctx);
        this.renderEnemies(ctx);
        this.renderPlayer(ctx);
        
        ctx.restore();
        
        // Render pause overlay if paused
        if (gameLoop.isPaused) {
            this.renderPauseOverlay(ctx);
        }
    },
    
    renderDungeon: function(ctx) {
        const { tileSize, tiles, width, height } = dungeon.data;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tile = tiles[y][x];
                const tileX = x * tileSize;
                const tileY = y * tileSize;
                
                if (tile === 1) { // Wall
                    ctx.fillStyle = '#555';
                    ctx.fillRect(tileX, tileY, tileSize, tileSize);
                } else { // Floor
                    ctx.fillStyle = '#2a2a2a';
                    ctx.fillRect(tileX, tileY, tileSize, tileSize);
                }
            }
        }
    },
    
    renderItems: function(ctx) {
        items.list.forEach(item => {
            ctx.fillStyle = item.color;
            ctx.fillRect(item.x, item.y, item.width, item.height);
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(item.symbol, item.x + item.width/2, item.y + item.height/2 + 4);
        });
    },
    
    renderEnemies: function(ctx) {
        enemies.list.forEach(enemy => {
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Health bar
            const healthPercent = enemy.hp / enemy.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * healthPercent, 4);
        });
    },
    
    renderPlayer: function(ctx) {
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(player.data.x, player.data.y, player.data.width, player.data.height);
    },
    
    gameOver: function() {
        this.gameRunning = false;
        audio.play('gameover');
        ui.addMessage('Game Over!', 'combat');
        
        if (typeof stateManager !== 'undefined') {
            stateManager.setState(stateManager.states.GAMEOVER);
        }
    },
    
    renderPauseOverlay: function(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        ctx.font = '16px monospace';
        ctx.fillText('Press P to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
};