// Item management
const items = {
    list: [],
    
    generate: function() {
        this.list = [];
        const numItems = 5 + Math.floor(Math.random() * 8);
        
        const itemTypes = [
            { type: 'health_potion', symbol: '♥', color: '#e74c3c' },
            { type: 'mana_potion', symbol: '♦', color: '#3498db' },
            { type: 'weapon', symbol: '†', color: '#f39c12' },
            { type: 'armor', symbol: '▦', color: '#95a5a6' },
            { type: 'gold', symbol: '$', color: '#f1c40f' }
        ];
        
        for (let i = 0; i < numItems; i++) {
            const room = dungeon.data.rooms[Math.floor(Math.random() * dungeon.data.rooms.length)];
            const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            
            const item = {
                x: (room.x + 1 + Math.floor(Math.random() * (room.width - 2))) * dungeon.data.tileSize,
                y: (room.y + 1 + Math.floor(Math.random() * (room.height - 2))) * dungeon.data.tileSize,
                width: 16, height: 16,
                type: itemType.type,
                symbol: itemType.symbol,
                color: itemType.color,
                value: 10 + Math.floor(Math.random() * 20)
            };
            
            this.list.push(item);
        }
    },
    
    checkCollisions: function() {
        for (let i = this.list.length - 1; i >= 0; i--) {
            const item = this.list[i];
            if (this.collision(player.data, item)) {
                this.collect(item);
                this.list.splice(i, 1);
            }
        }
    },
    
    collision: function(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    collect: function(item) {
        if (player.data.inventory.length < 16) {
            player.data.inventory.push(item);
            audio.play('item');
            ui.addMessage(`Collected ${item.type}!`, 'loot');
        }
    },
    
    use: function(index) {
        if (index >= player.data.inventory.length) return;
        
        const item = player.data.inventory[index];
        
        switch (item.type) {
            case 'health_potion':
                player.data.hp = Math.min(player.data.maxHp, player.data.hp + 30);
                ui.addMessage('Used health potion! +30 HP', 'loot');
                player.data.inventory.splice(index, 1);
                break;
                
            case 'mana_potion':
                player.data.mp = Math.min(player.data.maxMp, player.data.mp + 20);
                ui.addMessage('Used mana potion! +20 MP', 'loot');
                player.data.inventory.splice(index, 1);
                break;
                
            case 'weapon':
                player.data.attack += item.value;
                ui.addMessage(`Equipped weapon! +${item.value} ATK`, 'loot');
                player.data.inventory.splice(index, 1);
                break;
                
            case 'armor':
                player.data.defense += item.value;
                ui.addMessage(`Equipped armor! +${item.value} DEF`, 'loot');
                player.data.inventory.splice(index, 1);
                break;
                
            case 'gold':
                ui.addMessage(`Found ${item.value} gold!`, 'loot');
                player.data.inventory.splice(index, 1);
                break;
        }
    },
    
    useHealthPotion: function() {
        const potionIndex = player.data.inventory.findIndex(item => item.type === 'health_potion');
        if (potionIndex !== -1) {
            this.use(potionIndex);
        }
    },
    
    useManaPotion: function() {
        const potionIndex = player.data.inventory.findIndex(item => item.type === 'mana_potion');
        if (potionIndex !== -1) {
            this.use(potionIndex);
        }
    }
};