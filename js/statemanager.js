// State Management System
const stateManager = {
    states: {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAMEOVER: 'gameover',
        INVENTORY: 'inventory'
    },
    
    currentState: null,
    previousState: null,
    stateData: {},
    
    init: function() {
        this.setState(this.states.MENU);
    },
    
    setState: function(newState, data = {}) {
        if (this.currentState === newState) return;
        
        // Exit current state
        if (this.currentState) {
            this.exitState(this.currentState);
        }
        
        this.previousState = this.currentState;
        this.currentState = newState;
        this.stateData = data;
        
        // Enter new state
        this.enterState(newState);
    },
    
    enterState: function(state) {
        switch(state) {
            case this.states.MENU:
                this.enterMenu();
                break;
            case this.states.PLAYING:
                this.enterPlaying();
                break;
            case this.states.PAUSED:
                this.enterPaused();
                break;
            case this.states.GAMEOVER:
                this.enterGameOver();
                break;
            case this.states.INVENTORY:
                this.enterInventory();
                break;
        }
    },
    
    exitState: function(state) {
        switch(state) {
            case this.states.MENU:
                this.exitMenu();
                break;
            case this.states.PLAYING:
                this.exitPlaying();
                break;
            case this.states.PAUSED:
                this.exitPaused();
                break;
            case this.states.GAMEOVER:
                this.exitGameOver();
                break;
            case this.states.INVENTORY:
                this.exitInventory();
                break;
        }
    },
    
    update: function(deltaTime) {
        switch(this.currentState) {
            case this.states.MENU:
                this.updateMenu(deltaTime);
                break;
            case this.states.PLAYING:
                this.updatePlaying(deltaTime);
                break;
            case this.states.PAUSED:
                this.updatePaused(deltaTime);
                break;
            case this.states.GAMEOVER:
                this.updateGameOver(deltaTime);
                break;
            case this.states.INVENTORY:
                this.updateInventory(deltaTime);
                break;
        }
    },
    
    render: function(deltaTime) {
        switch(this.currentState) {
            case this.states.MENU:
                this.renderMenu(deltaTime);
                break;
            case this.states.PLAYING:
                this.renderPlaying(deltaTime);
                break;
            case this.states.PAUSED:
                this.renderPaused(deltaTime);
                break;
            case this.states.GAMEOVER:
                this.renderGameOver(deltaTime);
                break;
            case this.states.INVENTORY:
                this.renderInventory(deltaTime);
                break;
        }
    },
    
    handleInput: function(key, type) {
        switch(this.currentState) {
            case this.states.MENU:
                this.handleMenuInput(key, type);
                break;
            case this.states.PLAYING:
                this.handlePlayingInput(key, type);
                break;
            case this.states.PAUSED:
                this.handlePausedInput(key, type);
                break;
            case this.states.GAMEOVER:
                this.handleGameOverInput(key, type);
                break;
            case this.states.INVENTORY:
                this.handleInventoryInput(key, type);
                break;
        }
    },
    
    // Menu State
    enterMenu: function() {
        gameLoop.stop();
    },
    
    exitMenu: function() {},
    
    updateMenu: function(deltaTime) {},
    
    renderMenu: function(deltaTime) {
        const ctx = canvas.ctx;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DUNGEON CRAWLER', canvas.width / 2, canvas.height / 2 - 100);
        
        ctx.font = '24px monospace';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Press L to Load Game', canvas.width / 2, canvas.height / 2 + 40);
    },
    
    handleMenuInput: function(key, type) {
        if (type === 'keydown') {
            if (key === ' ') {
                this.setState(this.states.PLAYING);
            } else if (key.toLowerCase() === 'l') {
                this.loadGame();
            }
        }
    },
    
    // Playing State
    enterPlaying: function() {
        if (typeof game !== 'undefined') {
            game.init();
            game.start();
        }
    },
    
    exitPlaying: function() {},
    
    updatePlaying: function(deltaTime) {
        if (typeof game !== 'undefined') {
            game.update(deltaTime);
        }
    },
    
    renderPlaying: function(deltaTime) {
        if (typeof game !== 'undefined') {
            game.render(deltaTime);
        }
    },
    
    handlePlayingInput: function(key, type) {
        if (type === 'keydown') {
            if (key.toLowerCase() === 'p') {
                this.setState(this.states.PAUSED);
            } else if (key.toLowerCase() === 'i') {
                this.setState(this.states.INVENTORY);
            } else if (key.toLowerCase() === 's' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                this.saveGame();
            } else if (typeof game !== 'undefined') {
                game.handleKeyDown(key);
            }
        } else if (type === 'keyup' && typeof game !== 'undefined') {
            game.handleKeyUp(key);
        }
    },
    
    // Paused State
    enterPaused: function() {},
    
    exitPaused: function() {},
    
    updatePaused: function(deltaTime) {},
    
    renderPaused: function(deltaTime) {
        // Render game in background
        if (typeof game !== 'undefined') {
            game.render(deltaTime);
        }
        
        // Render pause overlay
        const ctx = canvas.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        
        ctx.font = '16px monospace';
        ctx.fillText('Press P to Resume', canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('Press M to Menu', canvas.width / 2, canvas.height / 2 + 60);
    },
    
    handlePausedInput: function(key, type) {
        if (type === 'keydown') {
            if (key.toLowerCase() === 'p') {
                this.setState(this.states.PLAYING);
            } else if (key.toLowerCase() === 'm') {
                this.setState(this.states.MENU);
            }
        }
    },
    
    // Game Over State
    enterGameOver: function() {
        gameLoop.stop();
    },
    
    exitGameOver: function() {},
    
    updateGameOver: function(deltaTime) {},
    
    renderGameOver: function(deltaTime) {
        const ctx = canvas.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#e74c3c';
        ctx.font = '48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.fillText(`Floor Reached: ${game.currentFloor || 1}`, canvas.width / 2, canvas.height / 2 + 60);
        ctx.fillText('Press SPACE for Menu', canvas.width / 2, canvas.height / 2 + 80);
    },
    
    handleGameOverInput: function(key, type) {
        if (type === 'keydown' && key === ' ') {
            this.setState(this.states.MENU);
        }
    },
    
    // Inventory State
    enterInventory: function() {},
    
    exitInventory: function() {},
    
    updateInventory: function(deltaTime) {},
    
    renderInventory: function(deltaTime) {
        // Render game in background
        if (typeof game !== 'undefined') {
            game.render(deltaTime);
        }
        
        // Render inventory overlay
        const ctx = canvas.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('INVENTORY', canvas.width / 2, 100);
        
        ctx.font = '16px monospace';
        ctx.fillText('Press I to Close', canvas.width / 2, canvas.height - 50);
    },
    
    handleInventoryInput: function(key, type) {
        if (type === 'keydown' && key.toLowerCase() === 'i') {
            this.setState(this.states.PLAYING);
        }
    },
    
    // Save/Load System
    saveGame: function() {
        const saveData = {
            player: player.data,
            currentFloor: game.currentFloor,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('dungeonCrawlerSave', JSON.stringify(saveData));
            ui.addMessage('Game Saved!', 'level');
        } catch (e) {
            console.error('Failed to save game:', e);
            ui.addMessage('Save Failed!', 'combat');
        }
    },
    
    loadGame: function() {
        try {
            const saveData = localStorage.getItem('dungeonCrawlerSave');
            if (saveData) {
                const data = JSON.parse(saveData);
                
                // Load player data
                Object.assign(player.data, data.player);
                
                // Load game state
                if (typeof game !== 'undefined') {
                    game.currentFloor = data.currentFloor || 1;
                }
                
                this.setState(this.states.PLAYING);
                ui.addMessage('Game Loaded!', 'level');
            } else {
                ui.addMessage('No Save Found!', 'combat');
                this.setState(this.states.PLAYING);
            }
        } catch (e) {
            console.error('Failed to load game:', e);
            ui.addMessage('Load Failed!', 'combat');
            this.setState(this.states.PLAYING);
        }
    },
    
    hasSave: function() {
        return localStorage.getItem('dungeonCrawlerSave') !== null;
    }
};