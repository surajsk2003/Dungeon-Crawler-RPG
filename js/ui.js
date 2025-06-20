class UIManager {
    constructor(game) {
        this.game = game;
        this.panels = new Map();
        this.notifications = [];
        this.tooltips = new Map();
        this.cinematicBars = false;
        
        this.setupUI();
        this.setupEventListeners();
    }

    setupUI() {
        // Initialize all UI panels
        this.panels.set('inventory', new InventoryPanel());
        this.panels.set('character', new CharacterPanel());
        this.panels.set('settings', new SettingsPanel());
        this.panels.set('pause', new PausePanel());
        
        // Setup HUD updates
        this.setupHUD();
    }

    setupHUD() {
        this.hudElements = {
            healthBar: document.getElementById('healthBar'),
            healthText: document.getElementById('healthText'),
            manaBar: document.getElementById('manaBar'),
            manaText: document.getElementById('manaText'),
            levelText: document.getElementById('levelText'),
            expBar: document.getElementById('expBar'),
            depthText: document.getElementById('depthText'),
            goldText: document.getElementById('goldText'),
            weightText: document.getElementById('weightText')
        };
    }

    setupEventListeners() {
        // Hotkey bindings
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'KeyI':
                    this.togglePanel('inventory');
                    break;
                case 'KeyC':
                    this.togglePanel('character');
                    break;
                case 'Escape':
                    if (this.hasOpenPanels()) {
                        this.closeAllPanels();
                    } else {
                        this.togglePanel('pause');
                    }
                    break;
                case 'KeyM':
                    this.toggleMiniMap();
                    break;
            }
        });

        // Panel click events
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panelName = e.target.getAttribute('data-panel');
                this.closePanel(panelName);
            });
        });

        // Hotkey slot events
        document.querySelectorAll('.hotkey-slot').forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.useHotkey(index + 1);
            });
            
            // Drag and drop support
            slot.addEventListener('dragover', (e) => e.preventDefault());
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                const itemId = e.dataTransfer.getData('text/plain');
                this.assignToHotkey(index + 1, itemId);
            });
        });
    }

    update() {
        this.updateHUD();
        this.updateNotifications();
        this.updateTooltips();
        this.updatePanels();
        this.updateMiniMap();
    }

    updateHUD() {
        const player = this.game.player;
        if (!player) return;

        // Update health
        const healthPercent = (player.stats.health / player.stats.maxHealth) * 100;
        if (this.hudElements.healthBar) {
            this.hudElements.healthBar.style.setProperty('--fill', healthPercent + '%');
        }
        if (this.hudElements.healthText) {
            this.hudElements.healthText.textContent = `${Math.floor(player.stats.health)}/${player.stats.maxHealth}`;
        }

        // Update mana
        const manaPercent = (player.stats.mana / player.stats.maxMana) * 100;
        if (this.hudElements.manaBar) {
            this.hudElements.manaBar.style.setProperty('--fill', manaPercent + '%');
        }
        if (this.hudElements.manaText) {
            this.hudElements.manaText.textContent = `${Math.floor(player.stats.mana)}/${player.stats.maxMana}`;
        }

        // Update level and experience
        if (this.hudElements.levelText) {
            this.hudElements.levelText.textContent = `Level ${player.stats.level}`;
        }
        const expPercent = (player.stats.experience / player.stats.experienceToNext) * 100;
        if (this.hudElements.expBar) {
            this.hudElements.expBar.style.setProperty('--fill', expPercent + '%');
        }

        // Update dungeon depth
        if (this.hudElements.depthText) {
            this.hudElements.depthText.textContent = `Floor ${this.game.dungeon?.currentLevel || 1}`;
        }

        // Update inventory info
        if (this.hudElements.goldText) {
            this.hudElements.goldText.textContent = player.inventory.gold;
        }
        if (this.hudElements.weightText) {
            this.hudElements.weightText.textContent = `${Math.floor(player.inventory.weight)}/${player.inventory.maxWeight}`;
        }

        // Update hotkeys
        this.updateHotkeys();
    }

    updateHotkeys() {
        const slots = document.querySelectorAll('.hotkey-slot');
        slots.forEach((slot, index) => {
            const item = this.game.player.hotkeys?.[index + 1];
            if (item) {
                slot.style.backgroundImage = `url(${item.sprite || ''})`;
                slot.classList.add('occupied');
                slot.textContent = item.name.charAt(0);
            } else {
                slot.style.backgroundImage = '';
                slot.classList.remove('occupied');
                slot.textContent = index + 1;
            }
        });
    }

    updateNotifications() {
        const now = Date.now();
        this.notifications = this.notifications.filter(notification => {
            const age = now - notification.timestamp;
            if (age >= notification.duration) {
                notification.element.remove();
                return false;
            }
            
            // Fade out in last 500ms
            if (age >= notification.duration - 500) {
                const fadeProgress = (age - (notification.duration - 500)) / 500;
                notification.element.style.opacity = 1 - fadeProgress;
            }
            
            return true;
        });
    }

    updateTooltips() {
        // Update tooltip positions and content
        this.tooltips.forEach((tooltip, element) => {
            if (tooltip.visible) {
                const rect = element.getBoundingClientRect();
                tooltip.element.style.left = (rect.left + rect.width / 2) + 'px';
                tooltip.element.style.top = (rect.top - tooltip.element.offsetHeight - 10) + 'px';
            }
        });
    }

    updatePanels() {
        this.panels.forEach(panel => {
            if (panel.isOpen) {
                panel.update();
            }
        });
    }

    showPanel(panelName) {
        const panel = this.panels.get(panelName);
        if (panel) {
            panel.show();
            const element = document.getElementById(panelName + 'Panel');
            if (element) {
                element.classList.remove('hidden');
            }
        }
    }

    hidePanel(panelName) {
        const panel = this.panels.get(panelName);
        if (panel) {
            panel.hide();
            const element = document.getElementById(panelName + 'Panel');
            if (element) {
                element.classList.add('hidden');
            }
        }
    }

    togglePanel(panelName) {
        const panel = this.panels.get(panelName);
        if (panel && panel.isOpen) {
            this.hidePanel(panelName);
        } else {
            this.showPanel(panelName);
        }
    }

    closePanel(panelName) {
        this.hidePanel(panelName);
    }

    closeAllPanels() {
        this.panels.forEach((panel, name) => {
            if (panel.isOpen) {
                this.hidePanel(name);
            }
        });
    }

    hasOpenPanels() {
        return Array.from(this.panels.values()).some(panel => panel.isOpen);
    }

    showNotification(message, duration = 3000, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: ${20 + this.notifications.length * 60}px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: ${this.getNotificationColor(type)};
            padding: 10px 20px;
            border-radius: 5px;
            border: 2px solid ${this.getNotificationColor(type)};
            font-family: monospace;
            z-index: 2000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        this.notifications.push({
            element: notification,
            timestamp: Date.now(),
            duration: duration
        });

        // Play notification sound
        this.game.audioManager?.playSound('notification_' + type);
    }

    getNotificationColor(type) {
        const colors = {
            info: '#00aaff',
            success: '#00ff00',
            warning: '#ffaa00',
            error: '#ff0000'
        };
        return colors[type] || colors.info;
    }

    showTooltip(element, content, delay = 500) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = content;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: #ffffff;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
            white-space: nowrap;
            z-index: 3000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;

        document.body.appendChild(tooltip);

        const tooltipData = {
            element: tooltip,
            visible: false,
            timeout: setTimeout(() => {
                tooltip.style.opacity = '1';
                tooltipData.visible = true;
            }, delay)
        };

        this.tooltips.set(element, tooltipData);

        element.addEventListener('mouseleave', () => {
            this.hideTooltip(element);
        });
    }

    hideTooltip(element) {
        const tooltip = this.tooltips.get(element);
        if (tooltip) {
            clearTimeout(tooltip.timeout);
            tooltip.element.remove();
            this.tooltips.delete(element);
        }
    }

    useHotkey(slot) {
        const player = this.game.player;
        const item = player.hotkeys?.[slot];
        
        if (item && item.use) {
            if (item.use(player)) {
                // Item was consumed
                delete player.hotkeys[slot];
                this.updateHotkeys();
            }
        }
    }

    assignToHotkey(slot, itemId) {
        const player = this.game.player;
        const item = player.inventory.items.find(i => i?.id === itemId);
        
        if (item && item.type === 'consumable') {
            if (!player.hotkeys) player.hotkeys = {};
            player.hotkeys[slot] = item;
            this.updateHotkeys();
            this.showNotification(`${item.name} assigned to hotkey ${slot}`);
        }
    }

    toggleMiniMap() {
        const miniMap = document.getElementById('miniMap');
        if (miniMap) {
            miniMap.classList.toggle('hidden');
        }
    }

    updateMiniMap() {
        const canvas = document.getElementById('miniMapCanvas');
        if (!canvas || canvas.parentElement.classList.contains('hidden')) return;

        const ctx = canvas.getContext('2d');
        const dungeon = this.game.dungeon;
        const player = this.game.player;
        
        if (!dungeon || !player) return;

        // Set canvas size
        canvas.width = 150;
        canvas.height = 150;

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate scale
        const scale = Math.min(canvas.width / dungeon.width, canvas.height / dungeon.height);
        const offsetX = (canvas.width - dungeon.width * scale) / 2;
        const offsetY = (canvas.height - dungeon.height * scale) / 2;

        // Draw dungeon
        for (let y = 0; y < dungeon.height; y++) {
            for (let x = 0; x < dungeon.width; x++) {
                const tile = dungeon.getTile(x, y);
                let color = '#333333';

                switch(tile) {
                    case dungeon.TILES.FLOOR:
                        color = '#666666';
                        break;
                    case dungeon.TILES.WALL:
                        color = '#333333';
                        break;
                    case dungeon.TILES.DOOR:
                        color = '#8B4513';
                        break;
                    case dungeon.TILES.STAIRS_UP:
                        color = '#00FF00';
                        break;
                    case dungeon.TILES.STAIRS_DOWN:
                        color = '#FF0000';
                        break;
                }

                ctx.fillStyle = color;
                ctx.fillRect(
                    offsetX + x * scale,
                    offsetY + y * scale,
                    scale,
                    scale
                );
            }
        }

        // Draw player
        const playerTileX = Math.floor(player.x / 32);
        const playerTileY = Math.floor(player.y / 32);
        
        ctx.fillStyle = '#00AAFF';
        ctx.beginPath();
        ctx.arc(
            offsetX + (playerTileX + 0.5) * scale,
            offsetY + (playerTileY + 0.5) * scale,
            scale * 0.4,
            0, Math.PI * 2
        );
        ctx.fill();

        // Draw enemies
        this.game.enemies.forEach(enemy => {
            const enemyTileX = Math.floor(enemy.x / 32);
            const enemyTileY = Math.floor(enemy.y / 32);
            
            ctx.fillStyle = '#FF4444';
            ctx.fillRect(
                offsetX + enemyTileX * scale,
                offsetY + enemyTileY * scale,
                scale * 0.6,
                scale * 0.6
            );
        });
    }
}

// Panel classes
class Panel {
    constructor() {
        this.isOpen = false;
    }

    show() {
        this.isOpen = true;
    }

    hide() {
        this.isOpen = false;
    }

    update() {
        // Override in subclasses
    }
}

class InventoryPanel extends Panel {
    constructor() {
        super();
        this.setupInventoryGrid();
    }

    setupInventoryGrid() {
        const grid = document.getElementById('inventoryGrid');
        if (!grid) return;

        // Create inventory slots if they don't exist
        if (grid.children.length === 0) {
            for (let i = 0; i < 20; i++) {
                const slot = document.createElement('div');
                slot.className = 'inventory-slot';
                slot.dataset.slot = i;
                slot.addEventListener('click', (e) => this.handleSlotClick(e, i));
                grid.appendChild(slot);
            }
        }
    }

    update() {
        this.updateInventorySlots();
    }

    updateInventorySlots() {
        const player = game.player;
        if (!player) return;

        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach((slot, index) => {
            const item = player.inventory.items[index];
            
            if (item) {
                slot.style.background = item.getRarityColor();
                slot.textContent = item.name.charAt(0);
                slot.title = `${item.name} - ${item.description}`;
            } else {
                slot.style.background = 'rgba(255, 255, 255, 0.1)';
                slot.textContent = '';
                slot.title = '';
            }
        });
    }

    handleSlotClick(event, slotIndex) {
        const player = game.player;
        const item = player.inventory.items[slotIndex];
        
        if (item) {
            if (event.ctrlKey) {
                // Use item
                if (item.use && item.use(player)) {
                    player.inventory.removeItem(slotIndex);
                }
            } else if (event.shiftKey) {
                // Drop item
                game.addItem(new DroppedItem(player.x, player.y, item));
                player.inventory.removeItem(slotIndex);
            }
        }
    }
}

class CharacterPanel extends Panel {
    update() {
        const player = game.player;
        if (!player) return;

        // Update character stats display
        const strText = document.getElementById('strText');
        const dexText = document.getElementById('dexText');
        const intText = document.getElementById('intText');
        const conText = document.getElementById('conText');

        if (strText) strText.textContent = player.stats.strength;
        if (dexText) dexText.textContent = player.stats.dexterity;
        if (intText) intText.textContent = player.stats.intelligence;
        if (conText) conText.textContent = player.stats.constitution;

        // Update equipment slots
        this.updateEquipmentSlots();
    }

    updateEquipmentSlots() {
        const player = game.player;
        const slots = document.querySelectorAll('.equipment-slot');
        
        slots.forEach(slot => {
            const slotType = slot.dataset.slot;
            const item = player.equipment[slotType];
            
            if (item) {
                slot.style.background = item.getRarityColor();
                slot.textContent = item.name.substring(0, 3);
            } else {
                slot.style.background = 'rgba(255, 255, 255, 0.1)';
                slot.textContent = '';
            }
        });
    }
}

class SettingsPanel extends Panel {
    constructor() {
        super();
    }

    update() {
        // Settings panel update logic
    }
}

class PausePanel extends Panel {
    show() {
        super.show();
        if (game.setState) {
            game.setState('paused');
        }
    }

    hide() {
        super.hide();
        if (game.setState) {
            game.setState('playing');
        }
    }
}

window.UIManager = UIManager;
window.Panel = Panel;
window.InventoryPanel = InventoryPanel;
window.CharacterPanel = CharacterPanel;
window.SettingsPanel = SettingsPanel;
window.PausePanel = PausePanel;