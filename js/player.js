// Player management
const player = {
    data: {
        x: 0, y: 0, width: 20, height: 20, speed: 2,
        hp: 100, maxHp: 100, mp: 50, maxMp: 50,
        level: 1, xp: 0, xpToNext: 100,
        attack: 10, defense: 5, magicPower: 15,
        inventory: [], lastAttack: 0, attackCooldown: 500,
        lastSpell: 0, spellCooldown: 1000
    },
    
    init: function() {
        this.reset();
    },
    
    reset: function() {
        Object.assign(this.data, {
            x: 0, y: 0, hp: 100, mp: 50, level: 1, xp: 0,
            inventory: [], lastAttack: 0, lastSpell: 0
        });
    },
    
    update: function(deltaTime, keys) {
        let dx = 0, dy = 0;
        
        if (keys['w'] || keys['arrowup']) dy = -this.data.speed;
        if (keys['s'] || keys['arrowdown']) dy = this.data.speed;
        if (keys['a'] || keys['arrowleft']) dx = -this.data.speed;
        if (keys['d'] || keys['arrowright']) dx = this.data.speed;
        
        const newX = this.data.x + dx;
        const newY = this.data.y + dy;
        
        if (dungeon.canMoveTo(newX, this.data.y, this.data.width, this.data.height)) {
            this.data.x = newX;
        }
        if (dungeon.canMoveTo(this.data.x, newY, this.data.width, this.data.height)) {
            this.data.y = newY;
        }
    },
    
    attack: function() {
        if (Date.now() - this.data.lastAttack < this.data.attackCooldown) return false;
        
        this.data.lastAttack = Date.now();
        audio.play('attack');
        return true;
    },
    
    castFireball: function() {
        if (Date.now() - this.data.lastSpell < this.data.spellCooldown) return false;
        if (this.data.mp < 15) return false;
        
        this.data.mp -= 15;
        this.data.lastSpell = Date.now();
        audio.play('fireball');
        return true;
    },
    
    levelUp: function() {
        this.data.level++;
        this.data.xp -= this.data.xpToNext;
        this.data.xpToNext = Math.floor(this.data.xpToNext * 1.5);
        
        this.data.maxHp += 20;
        this.data.hp = this.data.maxHp;
        this.data.maxMp += 10;
        this.data.mp = this.data.maxMp;
        this.data.attack += 3;
        this.data.defense += 2;
        this.data.magicPower += 5;
        
        audio.play('levelup');
    }
};