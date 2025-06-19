// UI management
const ui = {
    elements: {},
    
    init: function() {
        this.elements = {
            hpBar: document.getElementById('hpBar'),
            hpText: document.getElementById('hpText'),
            mpBar: document.getElementById('mpBar'),
            mpText: document.getElementById('mpText'),
            xpBar: document.getElementById('xpBar'),
            xpText: document.getElementById('xpText'),
            levelText: document.getElementById('levelText'),
            atkText: document.getElementById('atkText'),
            defText: document.getElementById('defText'),
            magText: document.getElementById('magText'),
            floorDisplay: document.getElementById('floorDisplay'),
            enemiesDisplay: document.getElementById('enemiesDisplay'),
            inventoryGrid: document.getElementById('inventoryGrid'),
            messageLog: document.getElementById('messageLog'),
            muteButton: document.getElementById('muteButton')
        };
        
        this.setupEventListeners();
    },
    
    setupEventListeners: function() {
        // Inventory click handler
        this.elements.inventoryGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('inventory-slot')) {
                const slotIndex = Array.from(e.target.parentNode.children).indexOf(e.target);
                if (slotIndex < player.data.inventory.length) {
                    items.use(slotIndex);
                }
            }
        });
        
        // Mute button handler
        this.elements.muteButton.addEventListener('click', () => {
            const muted = audio.toggleMute();
            this.elements.muteButton.textContent = muted ? '🔇 Sound Off' : '🔊 Sound On';
        });
    },
    
    update: function() {
        // Health bar
        const hpPercent = (player.data.hp / player.data.maxHp) * 100;
        this.elements.hpBar.style.width = hpPercent + '%';
        this.elements.hpText.textContent = `${player.data.hp}/${player.data.maxHp}`;
        
        // Mana bar
        const mpPercent = (player.data.mp / player.data.maxMp) * 100;
        this.elements.mpBar.style.width = mpPercent + '%';
        this.elements.mpText.textContent = `${player.data.mp}/${player.data.maxMp}`;
        
        // XP bar
        const xpPercent = (player.data.xp / player.data.xpToNext) * 100;
        this.elements.xpBar.style.width = xpPercent + '%';
        this.elements.xpText.textContent = `${player.data.xp}/${player.data.xpToNext}`;
        
        // Stats
        this.elements.levelText.textContent = player.data.level;
        this.elements.atkText.textContent = player.data.attack;
        this.elements.defText.textContent = player.data.defense;
        this.elements.magText.textContent = player.data.magicPower;
        
        // Floor info
        this.elements.floorDisplay.textContent = `Floor ${game.currentFloor}`;
        this.elements.enemiesDisplay.textContent = `Enemies: ${enemies.list.length}`;
        
        // Inventory
        this.updateInventory();
    },
    
    updateInventory: function() {
        this.elements.inventoryGrid.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            
            if (i < player.data.inventory.length) {
                const item = player.data.inventory[i];
                slot.classList.add('has-item');
                slot.textContent = item.symbol;
                slot.style.color = item.color;
                slot.title = item.type;
            }
            
            this.elements.inventoryGrid.appendChild(slot);
        }
    },
    
    addMessage: function(text, type = '') {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        this.elements.messageLog.appendChild(message);
        this.elements.messageLog.scrollTop = this.elements.messageLog.scrollHeight;
        
        // Keep only last 100 messages
        while (this.elements.messageLog.children.length > 100) {
            this.elements.messageLog.removeChild(this.elements.messageLog.firstChild);
        }
    },
    
    showLoading: function(text) {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    },
    
    showError: function(text) {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
};