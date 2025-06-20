class Player {
    constructor(x, y, assetLoader) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.assetLoader = assetLoader;
        
        // Player stats
        this.stats = {
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            level: 1,
            experience: 0,
            experienceToNext: 100,
            strength: 10,
            dexterity: 10,
            intelligence: 10,
            constitution: 10
        };
        
        // Movement
        this.speed = 100;
        this.vx = 0;
        this.vy = 0;
        
        // Inventory
        this.inventory = {
            items: [],
            gold: 0,
            weight: 0,
            maxWeight: 100,
            serialize: () => ({ items: [], gold: 0, weight: 0 })
        };
        
        // Equipment
        this.equipment = {};
        
        // Hotkeys
        this.hotkeys = {};
    }

    update(deltaTime, inputManager, dungeon) {
        if (!inputManager) return;
        
        // Handle input
        this.vx = 0;
        this.vy = 0;
        
        if (inputManager.isKeyPressed('move_left')) this.vx = -this.speed;
        if (inputManager.isKeyPressed('move_right')) this.vx = this.speed;
        if (inputManager.isKeyPressed('move_up')) this.vy = -this.speed;
        if (inputManager.isKeyPressed('move_down')) this.vy = this.speed;
        
        // Update position
        this.x += this.vx * (deltaTime / 1000);
        this.y += this.vy * (deltaTime / 1000);
        
        // Keep in bounds
        this.x = Math.max(0, Math.min(this.x, (dungeon?.width || 50) * 32 - this.width));
        this.y = Math.max(0, Math.min(this.y, (dungeon?.height || 50) * 32 - this.height));
    }

    render(ctx) {
        // Simple rectangle for now
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}

window.Player = Player;