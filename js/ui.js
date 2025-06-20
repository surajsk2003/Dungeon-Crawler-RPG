class UIManager {
    constructor(game) {
        this.game = game;
        this.panels = new Map();
        this.notifications = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializePanels();
    }

    setupEventListeners() {
        // Panel close buttons
        const closeButtons = document.querySelectorAll('.close-btn');
        closeButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    const panel = e.target.getAttribute('data-panel');
                    if (panel) {
                        this.closePanel(panel);
                    }
                });
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.game.state !== 'playing') return;
            
            switch(e.code) {
                case 'KeyI':
                    e.preventDefault();
                    this.togglePanel('inventory');
                    break;
                case 'KeyC':
                    e.preventDefault();
                    this.togglePanel('character');
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.closeAllPanels();
                    break;
            }
        });
    }

    initializePanels() {
        // Initialize panel states
        this.panels.set('inventory', false);
        this.panels.set('character', false);
    }

    showPanel(panelName) {
        const panel = document.getElementById(panelName + 'Panel');
        if (panel) {
            panel.classList.remove('hidden');
            this.panels.set(panelName, true);
        }
    }

    closePanel(panelName) {
        const panel = document.getElementById(panelName + 'Panel');
        if (panel) {
            panel.classList.add('hidden');
            this.panels.set(panelName, false);
        }
    }

    togglePanel(panelName) {
        if (this.panels.get(panelName)) {
            this.closePanel(panelName);
        } else {
            this.showPanel(panelName);
        }
    }

    closeAllPanels() {
        this.panels.forEach((isOpen, panelName) => {
            if (isOpen) {
                this.closePanel(panelName);
            }
        });
    }

    showNotification(message, duration = 3000, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
            type,
            duration
        };

        this.notifications.push(notification);
        this.displayNotification(notification);

        // Auto-remove after duration
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);
    }

    displayNotification(notification) {
        const container = this.getNotificationContainer();
        
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.id = `notification-${notification.id}`;
        element.textContent = notification.message;
        
        container.appendChild(element);
        
        // Animate in
        setTimeout(() => {
            element.classList.add('show');
        }, 10);
    }

    removeNotification(id) {
        const element = document.getElementById(`notification-${id}`);
        if (element) {
            element.classList.remove('show');
            setTimeout(() => {
                element.remove();
            }, 300);
        }
        
        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    getNotificationContainer() {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    update() {
        if (this.game.state !== 'playing') return;
        
        // Update UI elements
        this.updatePlayerStats();
        this.updateInventoryDisplay();
    }

    updatePlayerStats() {
        const player = this.game.player;
        if (!player) return;

        // Health bar
        const healthBar = document.getElementById('healthBar');
        const healthText = document.getElementById('healthText');
        if (healthBar && healthText) {
            const healthPercent = (player.stats.health / player.stats.maxHealth) * 100;
            healthBar.style.width = healthPercent + '%';
            healthText.textContent = `${Math.floor(player.stats.health)}/${player.stats.maxHealth}`;
        }

        // Mana bar
        const manaBar = document.getElementById('manaBar');
        const manaText = document.getElementById('manaText');
        if (manaBar && manaText) {
            const manaPercent = (player.stats.mana / player.stats.maxMana) * 100;
            manaBar.style.width = manaPercent + '%';
            manaText.textContent = `${Math.floor(player.stats.mana)}/${player.stats.maxMana}`;
        }

        // Level and experience
        const levelText = document.getElementById('levelText');
        const expBar = document.getElementById('expBar');
        if (levelText) {
            levelText.textContent = `Level ${player.stats.level}`;
        }
        if (expBar) {
            const expPercent = (player.stats.experience / player.stats.experienceToNext) * 100;
            expBar.style.width = expPercent + '%';
        }

        // Dungeon depth
        const depthText = document.getElementById('depthText');
        if (depthText && this.game.dungeon) {
            depthText.textContent = `Floor ${this.game.dungeon.currentLevel}`;
        }
    }

    updateInventoryDisplay() {
        const player = this.game.player;
        if (!player) return;

        // Gold display
        const goldText = document.getElementById('goldText');
        if (goldText) {
            goldText.textContent = player.inventory.gold || 0;
        }

        // Weight display
        const weightText = document.getElementById('weightText');
        if (weightText) {
            const weight = player.inventory.weight || 0;
            const maxWeight = player.inventory.maxWeight || 100;
            weightText.textContent = `${weight}/${maxWeight}`;
        }
    }
}

window.UIManager = UIManager;