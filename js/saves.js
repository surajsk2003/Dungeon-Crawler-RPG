class SaveManager {
    constructor() {
        this.currentSave = null;
        this.maxSaves = 5;
    }

    saveGame(slot = 0) {
        try {
            if (!game || !game.player || !game.dungeon) {
                throw new Error('Game not ready for saving');
            }

            const saveData = {
                version: '1.0.0',
                timestamp: Date.now(),
                playtime: game.totalPlaytime || 0,
                player: this.serializePlayer(game.player),
                dungeon: this.serializeDungeon(game.dungeon),
                statistics: game.statistics || {},
                settings: this.getGameSettings()
            };

            localStorage.setItem(`dungeonCrawlerSave_${slot}`, JSON.stringify(saveData));
            this.updateSaveMetadata(slot, saveData);
            this.currentSave = slot;

            if (game.ui) {
                game.ui.showNotification('Game saved successfully!', 2000, 'success');
            }
            
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            if (game.ui) {
                game.ui.showNotification('Save failed: ' + error.message, 3000, 'error');
            }
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
            
            if (!this.validateSaveData(saveData)) {
                throw new Error('Save data is corrupted');
            }

            // Load player data
            this.loadPlayerData(saveData.player);
            
            // Load dungeon data
            this.loadDungeonData(saveData.dungeon);
            
            // Load statistics
            if (saveData.statistics) {
                game.statistics = saveData.statistics;
            }
            
            this.currentSave = slot;
            
            if (game.ui) {
                game.ui.showNotification('Game loaded successfully!', 2000, 'success');
            }
            
            return true;
        } catch (error) {
            console.error('Load failed:', error);
            if (game.ui) {
                game.ui.showNotification('Load failed: ' + error.message, 3000, 'error');
            }
            return false;
        }
    }

    serializePlayer(player) {
        return {
            position: { x: player.x, y: player.y },
            stats: { ...player.stats },
            inventory: {
                items: [],
                gold: player.inventory?.gold || 0,
                weight: player.inventory?.weight || 0
            },
            equipment: {},
            hotkeys: player.hotkeys || {}
        };
    }

    serializeDungeon(dungeon) {
        return {
            currentLevel: dungeon.currentLevel || 1,
            currentTheme: dungeon.currentTheme || 'modern',
            seed: dungeon.seed || Math.random()
        };
    }

    loadPlayerData(playerData) {
        if (!game.player) return;
        
        game.player.setPosition(playerData.position.x, playerData.position.y);
        Object.assign(game.player.stats, playerData.stats);
        
        if (playerData.inventory) {
            game.player.inventory = {
                ...game.player.inventory,
                ...playerData.inventory
            };
        }
    }

    loadDungeonData(dungeonData) {
        if (!game.dungeon) return;
        
        game.dungeon.currentLevel = dungeonData.currentLevel || 1;
        game.dungeon.currentTheme = dungeonData.currentTheme || 'modern';
        game.dungeon.seed = dungeonData.seed || Math.random();
        
        // Regenerate current level
        game.dungeon.generateLevel(dungeonData.currentLevel);
    }

    validateSaveData(saveData) {
        const requiredFields = ['version', 'timestamp', 'player', 'dungeon'];
        return requiredFields.every(field => saveData.hasOwnProperty(field));
    }

    getGameSettings() {
        return {
            masterVolume: game.audioManager?.masterVolume || 1.0,
            musicVolume: game.audioManager?.musicVolume || 0.7,
            sfxVolume: game.audioManager?.sfxVolume || 0.8
        };
    }

    updateSaveMetadata(slot, saveData) {
        try {
            const metadata = this.loadSaveMetadata();
            metadata[slot] = {
                timestamp: saveData.timestamp,
                level: saveData.player.stats.level || 1,
                depth: saveData.dungeon.currentLevel || 1,
                playtime: saveData.playtime || 0
            };
            localStorage.setItem('dungeonCrawlerSaveMetadata', JSON.stringify(metadata));
        } catch (error) {
            console.warn('Failed to update save metadata:', error);
        }
    }

    loadSaveMetadata() {
        try {
            const metadataStr = localStorage.getItem('dungeonCrawlerSaveMetadata');
            return metadataStr ? JSON.parse(metadataStr) : {};
        } catch (error) {
            console.warn('Failed to load save metadata:', error);
            return {};
        }
    }

    getSaveMetadata(slot) {
        const metadata = this.loadSaveMetadata();
        return metadata[slot] || null;
    }

    autoSave() {
        return this.saveGame(0); // Use slot 0 for auto-save
    }

    quickSave() {
        return this.saveGame(0); // Use slot 0 for quick save
    }

    quickLoad() {
        return this.loadGame(0); // Load from slot 0
    }

    deleteSave(slot) {
        try {
            localStorage.removeItem(`dungeonCrawlerSave_${slot}`);
            this.updateSaveMetadata(slot, null);
            if (game.ui) {
                game.ui.showNotification(`Save slot ${slot + 1} deleted`, 2000, 'info');
            }
        } catch (error) {
            console.error('Failed to delete save:', error);
        }
    }
}

window.SaveManager = SaveManager;