// Enemy management
const enemies = {
    list: [],
    
    generate: function(currentFloor) {
        this.list = [];
        const numEnemies = 3 + currentFloor * 2;
        
        for (let i = 0; i < numEnemies; i++) {
            const room = dungeon.data.rooms[Math.floor(Math.random() * dungeon.data.rooms.length)];
            const enemy = {
                x: (room.x + 1 + Math.floor(Math.random() * (room.width - 2))) * dungeon.data.tileSize,
                y: (room.y + 1 + Math.floor(Math.random() * (room.height - 2))) * dungeon.data.tileSize,
                width: 18, height: 18,
                hp: 20 + currentFloor * 10,
                maxHp: 20 + currentFloor * 10,
                attack: 5 + currentFloor * 2,
                speed: 0.5 + currentFloor * 0.1,
                lastAttack: 0, attackCooldown: 1000,
                ai: { state: 'patrol', targetX: 0, targetY: 0, lastSeen: 0 }
            };
            
            this.list.push(enemy);
        }
    },
    
    update: function(deltaTime) {
        this.list.forEach(enemy => {
            const dx = player.data.x - enemy.x;
            const dy = player.data.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const moveX = (dx / distance) * enemy.speed;
                const moveY = (dy / distance) * enemy.speed;
                
                const newX = enemy.x + moveX;
                const newY = enemy.y + moveY;
                
                if (dungeon.canMoveTo(newX, enemy.y, enemy.width, enemy.height)) {
                    enemy.x = newX;
                }
                if (dungeon.canMoveTo(enemy.x, newY, enemy.width, enemy.height)) {
                    enemy.y = newY;
                }
                
                // Attack player if close enough
                if (distance < 30 && Date.now() - enemy.lastAttack > enemy.attackCooldown) {
                    this.attack(enemy);
                    enemy.lastAttack = Date.now();
                }
            }
        });
    },
    
    attack: function(enemy) {
        const damage = Math.max(1, enemy.attack - player.data.defense);
        player.data.hp -= damage;
        
        ui.addMessage(`Enemy deals ${damage} damage to you!`, 'combat');
        
        if (player.data.hp <= 0) {
            game.gameOver();
        }
    },
    
    takeDamage: function(damage, range = 40) {
        for (let i = this.list.length - 1; i >= 0; i--) {
            const enemy = this.list[i];
            const dx = player.data.x - enemy.x;
            const dy = player.data.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < range) {
                const actualDamage = Math.max(1, damage - Math.floor(Math.random() * 5));
                enemy.hp -= actualDamage;
                
                audio.play('hit');
                ui.addMessage(`You deal ${actualDamage} damage to enemy!`, 'combat');
                
                if (enemy.hp <= 0) {
                    const xpGain = 15 + game.currentFloor * 5;
                    player.data.xp += xpGain;
                    ui.addMessage(`Enemy defeated! +${xpGain} XP`, 'combat');
                    
                    this.list.splice(i, 1);
                    
                    if (player.data.xp >= player.data.xpToNext) {
                        player.levelUp();
                        ui.addMessage(`Level Up! You are now level ${player.data.level}!`, 'level');
                    }
                }
            }
        }
    }
};