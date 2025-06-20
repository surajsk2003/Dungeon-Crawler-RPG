class SaveManager {
    constructor() {
        this.saveSlots = 3;
        this.currentSave = null;
        this.autoSaveInterval = 60000; // 1 minute
        this.autoSaveTimer = 0;
        
        this.init();
    }

    init() {
        // Check for existing saves
        this.loadSaveMetadata();
        
        // Start auto-save timer
        this.startAutoSave();
    }

    startAutoSave() {
        setInterval(() => {
            if (game.state === 'playing' && this.currentSave !== null) {
                this.autoSave();
            }
        }, this.autoSaveInterval);
    }

    createSaveData() {
        const player = game.player;
        const dungeon = game.dungeon;
        
        if (!player || !dungeon) {
            throw new Error('Cannot save: missing player or dungeon data');
        }

        return {
            version: '1.0.0',
            timestamp: Date.now(),
            playtime: this.getPlaytime(),
            
            // Player data
            player: {
                position: { x: player.x, y: player.y },
                stats: { ...player.stats },
                inventory: player.inventory.serialize(),
                equipment: this.serializeEquipment(player.equipment),
                hotkeys: { ...player.hotkeys }
            },
            
            // Dungeon data
            dungeon: {
                currentLevel: dungeon.currentLevel,
                currentTheme: dungeon.currentTheme,
                seed: dungeon.seed,
                exploredLevels: dungeon.exploredLevels || {}
            },
            
            // Game progress
            progress: {
                enemiesKilled: game.statistics?.enemiesKilled || 0,
                itemsFound: game.statistics?.itemsFound || 0,
                levelsCompleted: dungeon.currentLevel - 1,
                achievements: game.achievements?.unlocked || []
            },
            
            // Settings
            settings: {
                masterVolume: game.audioManager?.masterVolume || 1.0,
                musicVolume: game.audioManager?.musicVolume || 0.6,
                sfxVolume: game.audioManager?.sfxVolume || 0.8,
                keyBindings: this.serializeKeyBindings()
            }
        };
    }

    serializeEquipment(equipment) {
        const serialized = {};
        for (const [slot, item] of Object.entries(equipment)) {
            serialized[slot] = item ? item.serialize() : null;
        }
        return serialized;
    }

    serializeKeyBindings() {
        const bindings = {};
        if (game.inputManager) {
            game.inputManager.keyBindings.forEach((action, key) => {
                bindings[key] = action;
            });
        }
        return bindings;
    }

    saveGame(slot = null) {
        try {
            const saveData = this.createSaveData();
            const saveSlot = slot !== null ? slot : this.currentSave || 0;
            
            // Store save data
            localStorage.setItem(`dungeonCrawlerSave_${saveSlot}`, JSON.stringify(saveData));
            
            // Update metadata
            this.updateSaveMetadata(saveSlot, saveData);
            
            this.currentSave = saveSlot;
            
            game.ui?.showNotification('Game saved successfully!', 2000, 'success');
            
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            game.ui?.showNotification('Save failed: ' + error.message, 3000, 'error');
            return false;
        }
    }

    loadGame(slot) {
        try {
            const saveDataStr = localStorage.getItem(`dungeonCrawlerSave_${slot}`);
            if (!saveDataStr) {
                throw new Error('Save slot is empty');
            }

            const saveData = JSON.parse(saveDataStr);
            
            // Validate save data
            if (!this.validateSaveData(saveData)) {
                throw new Error('Save data is corrupted or incompatible');
            }

            // Load player data
            this.loadPlayerData(saveData.player);
            
            // Load dungeon data
            this.loadDungeonData(saveData.dungeon);
            
            // Load settings
            this.loadSettings(saveData.settings);
            
            // Update current save slot
            this.currentSave = slot;
            
            game.ui?.showNotification('Game loaded successfully!', 2000, 'success');
            
            return true;
        } catch (error) {
            console.error('Load failed:', error);
            game.ui?.showNotification('Load failed: ' + error.message, 3000, 'error');
            return false;
        }
    }

    validateSaveData(saveData) {
        return saveData && 
               saveData.version && 
               saveData.player && 
               saveData.dungeon &&
               saveData.player.stats &&
               saveData.player.position;
    }

    loadPlayerData(playerData) {
        const player = game.player;
        if (!player) return;

        // Restore position
        player.setPosition(playerData.position.x, playerData.position.y);
        
        // Restore stats
        Object.assign(player.stats, playerData.stats);
        
        // Restore inventory
        if (playerData.inventory) {
            this.loadInventory(player.inventory, playerData.inventory);
        }
        
        // Restore equipment
        if (playerData.equipment) {
            this.loadEquipment(player.equipment, playerData.equipment);
        }
        
        // Restore hotkeys
        if (playerData.hotkeys) {
            player.hotkeys = { ...playerData.hotkeys };
        }
    }

    loadInventory(inventory, inventoryData) {
        inventory.gold = inventoryData.gold || 0;
        inventory.weight = inventoryData.weight || 0;
        
        // Restore items
        if (inventoryData.items) {
            inventory.items = inventoryData.items.map(itemData => {
                return itemData ? this.deserializeItem(itemData) : null;
            });
        }
    }

    loadEquipment(equipment, equipmentData) {
        for (const [slot, itemData] of Object.entries(equipmentData)) {
            equipment[slot] = itemData ? this.deserializeItem(itemData) : null;
        }
    }

    deserializeItem(itemData) {
        // Recreate item based on type
        switch(itemData.type) {
            case 'weapon':
                return this.createWeapon(itemData);
            case 'armor':
                return this.createArmor(itemData);
            case 'consumable':
                return this.createConsumable(itemData);
            default:
                return ItemFactory.createItem(itemData.name, itemData.level);
        }
    }

    createWeapon(itemData) {
        const weapon = new Weapon(itemData.weaponType || 'sword', itemData.level || 1);
        weapon.id = itemData.id;
        weapon.stats = itemData.stats;
        return weapon;
    }

    createArmor(itemData) {
        const armor = new Armor(itemData.armorType || 'helmet', itemData.level || 1);
        armor.id = itemData.id;
        armor.stats = itemData.stats;
        return armor;
    }

    createConsumable(itemData) {
        return ItemFactory.createItem(itemData.name.toLowerCase().replace(' ', '_'));
    }

    loadDungeonData(dungeonData) {
        const dungeon = game.dungeon;
        if (!dungeon) return;

        dungeon.currentLevel = dungeonData.currentLevel || 1;
        dungeon.currentTheme = dungeonData.currentTheme || 'modern';
        dungeon.seed = dungeonData.seed;
        dungeon.exploredLevels = dungeonData.exploredLevels || {};
        
        // Regenerate current level
        dungeon.generateLevel(dungeon.currentLevel);
    }

    loadSettings(settingsData) {
        if (!settingsData) return;

        // Load audio settings
        if (game.audioManager) {
            game.audioManager.setMasterVolume(settingsData.masterVolume || 1.0);
            game.audioManager.setMusicVolume(settingsData.musicVolume || 0.6);
            game.audioManager.setSfxVolume(settingsData.sfxVolume || 0.8);
        }

        // Load key bindings
        if (settingsData.keyBindings && game.inputManager) {
            for (const [key, action] of Object.entries(settingsData.keyBindings)) {
                game.inputManager.setKeyBinding(key, action);
            }
        }
    }

    autoSave() {
        if (this.currentSave !== null) {
            this.saveGame(this.currentSave);
            console.log('Auto-save completed');
        }
    }

    deleteSave(slot) {
        try {
            localStorage.removeItem(`dungeonCrawlerSave_${slot}`);
            this.updateSaveMetadata(slot, null);
            
            if (this.currentSave === slot) {
                this.currentSave = null;
            }
            
            game.ui?.showNotification(`Save slot ${slot + 1} deleted`, 2000, 'info');
            return true;
        } catch (error) {
            console.error('Delete save failed:', error);
            return false;
        }
    }

    getSaveMetadata(slot) {
        const metadataStr = localStorage.getItem('dungeonCrawlerSaveMetadata');
        if (!metadataStr) return null;

        const metadata = JSON.parse(metadataStr);
        return metadata[slot] || null;
    }

    loadSaveMetadata() {
        const metadataStr = localStorage.getItem('dungeonCrawlerSaveMetadata');
        this.saveMetadata = metadataStr ? JSON.parse(metadataStr) : {};
    }

    updateSaveMetadata(slot, saveData) {
        if (!this.saveMetadata) this.saveMetadata = {};

        if (saveData) {
            this.saveMetadata[slot] = {
                timestamp: saveData.timestamp,
                playtime: saveData.playtime,
                level: saveData.player.stats.level,
                dungeonLevel: saveData.dungeon.currentLevel,
                playerName: 'Hero' // Could be customizable
            };
        } else {
            delete this.saveMetadata[slot];
        }

        localStorage.setItem('dungeonCrawlerSaveMetadata', JSON.stringify(this.saveMetadata));
    }

    getPlaytime() {
        // Calculate playtime (would need to track game start time)
        return game.playtime || 0;
    }

    formatPlaytime(milliseconds) {
        const hours = Math.floor(milliseconds / 3600000);
        const minutes = Math.floor((milliseconds % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }

    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    exportSave(slot) {
        const saveData = localStorage.getItem(`dungeonCrawlerSave_${slot}`);
        if (!saveData) return null;

        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `dungeon_crawler_save_${slot + 1}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    importSave(file, slot) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const saveData = JSON.parse(e.target.result);
                    
                    if (!this.validateSaveData(saveData)) {
                        reject(new Error('Invalid save file'));
                        return;
                    }
                    
                    localStorage.setItem(`dungeonCrawlerSave_${slot}`, JSON.stringify(saveData));
                    this.updateSaveMetadata(slot, saveData);
                    
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // Quick save/load functions
    quickSave() {
        return this.saveGame(0); // Use slot 0 for quick save
    }

    quickLoad() {
        return this.loadGame(0);
    }

    // Check if save exists
    hasSave(slot) {
        return localStorage.getItem(`dungeonCrawlerSave_${slot}`) !== null;
    }

    // Get all save slots info
    getAllSaves() {
        const saves = [];
        for (let i = 0; i < this.saveSlots; i++) {
            const metadata = this.getSaveMetadata(i);
            saves.push({
                slot: i,
                exists: this.hasSave(i),
                metadata: metadata
            });
        }
        return saves;
    }
}

// Game state management
class GameStateManager {
    constructor() {
        this.currentState = 'loading';
        this.previousState = null;
        this.stateStack = [];
        this.stateData = {};
    }

    setState(newState, data = null) {
        this.previousState = this.currentState;
        this.currentState = newState;
        this.stateData = data || {};
        
        this.onStateChange(newState, this.previousState);
    }

    pushState(newState, data = null) {
        this.stateStack.push({
            state: this.currentState,
            data: this.stateData
        });
        
        this.setState(newState, data);
    }

    popState() {
        if (this.stateStack.length > 0) {
            const previousState = this.stateStack.pop();
            this.setState(previousState.state, previousState.data);
        }
    }

    onStateChange(newState, oldState) {
        console.log(`State changed: ${oldState} -> ${newState}`);
        
        // Handle state-specific logic
        switch(newState) {
            case 'playing':
                this.onEnterPlaying();
                break;
            case 'paused':
                this.onEnterPaused();
                break;
            case 'menu':
                this.onEnterMenu();
                break;
            case 'gameover':
                this.onEnterGameOver();
                break;
        }
    }

    onEnterPlaying() {
        // Resume game systems
        if (game.audioManager) {
            game.audioManager.updateMusicForGameState('exploration');
        }
    }

    onEnterPaused() {
        // Pause game systems
        console.log('Game paused');
    }

    onEnterMenu() {
        // Stop game music, show menu music
        if (game.audioManager) {
            game.audioManager.stopMusic();
        }
    }

    onEnterGameOver() {
        // Handle game over
        if (game.audioManager) {
            game.audioManager.updateMusicForGameState('gameover');
        }
    }

    isState(state) {
        return this.currentState === state;
    }

    canTransitionTo(newState) {
        // Define valid state transitions
        const validTransitions = {
            'loading': ['menu'],
            'menu': ['playing', 'settings'],
            'playing': ['paused', 'inventory', 'character', 'gameover'],
            'paused': ['playing', 'menu'],
            'inventory': ['playing'],
            'character': ['playing'],
            'gameover': ['menu']
        };

        return validTransitions[this.currentState]?.includes(newState) || false;
    }
}

window.SaveManager = SaveManager;
window.GameStateManager = GameStateManager;