class Enemy {
    constructor(x, y, type, assetLoader) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = type;
        this.assetLoader = assetLoader;
        
        // AI State
        this.state = 'idle'; // idle, patrol, chase, attack, flee, dead
        this.lastStateChange = 0;
        this.stateData = {};
        
        // Movement
        this.speed = this.getBaseSpeed();
        this.targetX = x;
        this.targetY = y;
        this.isMoving = false;
        this.pathfinding = new AStar();
        this.currentPath = [];
        this.pathIndex = 0;
        
        // Stats based on enemy type
        this.stats = this.getStatsForType(type);
        this.maxHealth = this.stats.health;
        
        // Vision and detection
        this.visionRange = 150;
        this.attackRange = 40;
        this.lostPlayerTime = 0;
        this.lastKnownPlayerPos = null;
        
        // Combat
        this.lastAttackTime = 0;
        this.attackCooldown = this.stats.attackSpeed;
        this.damage = this.stats.damage;
        
        // Animation
        this.currentAnimation = 'idle';
        this.animationFrame = 0;
        this.animationTime = 0;
        this.animationSpeed = 200;
        
        // Drops
        this.dropTable = this.getDropTable();
        
        this.initializeAI();
    }

    getStatsForType(type) {
        const statTable = {
            skeleton: {
                health: 30,
                damage: 8,
                defense: 2,
                speed: 80,
                attackSpeed: 1500,
                experience: 15
            },
            goblin: {
                health: 25,
                damage: 6,
                defense: 1,
                speed: 100,
                attackSpeed: 1200,
                experience: 12
            },
            orc: {
                health: 50,
                damage: 12,
                defense: 4,
                speed: 60,
                attackSpeed: 2000,
                experience: 25
            },
            robot: {
                health: 40,
                damage: 10,
                defense: 5,
                speed: 70,
                attackSpeed: 1800,
                experience: 20
            },
            wolf: {
                health: 35,
                damage: 9,
                defense: 2,
                speed: 120,
                attackSpeed: 1400,
                experience: 18
            },
            golem: {
                health: 80,
                damage: 15,
                defense: 8,
                speed: 40,
                attackSpeed: 2500,
                experience: 40
            }
        };
        
        return statTable[type] || statTable.skeleton;
    }

    getBaseSpeed() {
        return this.stats?.speed || 80;
    }

    getDropTable() {
        const baseTables = {
            skeleton: [
                { item: 'bone', chance: 0.6 },
                { item: 'sword', chance: 0.1 },
                { item: 'gold', chance: 0.8, amount: [5, 15] }
            ],
            goblin: [
                { item: 'dagger', chance: 0.15 },
                { item: 'leather_armor', chance: 0.08 },
                { item: 'gold', chance: 0.7, amount: [3, 10] }
            ],
            orc: [
                { item: 'axe', chance: 0.2 },
                { item: 'shield', chance: 0.12 },
                { item: 'gold', chance: 0.9, amount: [8, 25] }
            ]
        };
        
        return baseTables[this.type] || baseTables.skeleton;
    }

    initializeAI() {
        this.setState('patrol');
    }

    update(deltaTime, player, dungeon) {
        if (this.state === 'dead') return;
        
        this.updateAI(deltaTime, player, dungeon);
        this.updateMovement(deltaTime, dungeon);
        this.updateAnimation(deltaTime);
    }

    updateAI(deltaTime, player, dungeon) {
        const distanceToPlayer = this.getDistanceToPlayer(player);
        const canSeePlayer = this.canSeePlayer(player, dungeon);
        
        switch(this.state) {
            case 'idle':
                this.handleIdleState(deltaTime, player, distanceToPlayer, canSeePlayer);
                break;
            case 'patrol':
                this.handlePatrolState(deltaTime, player, distanceToPlayer, canSeePlayer, dungeon);
                break;
            case 'chase':
                this.handleChaseState(deltaTime, player, distanceToPlayer, canSeePlayer, dungeon);
                break;
            case 'attack':
                this.handleAttackState(deltaTime, player, distanceToPlayer);
                break;
            case 'flee':
                this.handleFleeState(deltaTime, player, dungeon);
                break;
        }
    }

    handleIdleState(deltaTime, player, distanceToPlayer, canSeePlayer) {
        if (canSeePlayer && distanceToPlayer < this.visionRange) {
            this.setState('chase');
            this.lastKnownPlayerPos = { x: player.x, y: player.y };
        } else if (Date.now() - this.lastStateChange > 3000) {
            this.setState('patrol');
        }
    }

    handlePatrolState(deltaTime, player, distanceToPlayer, canSeePlayer, dungeon) {
        if (canSeePlayer && distanceToPlayer < this.visionRange) {
            this.setState('chase');
            this.lastKnownPlayerPos = { x: player.x, y: player.y };
            return;
        }
        
        // Simple patrol behavior - move to random nearby positions
        if (!this.isMoving) {
            const patrolRadius = 3;
            const currentTileX = Math.floor(this.x / 32);
            const currentTileY = Math.floor(this.y / 32);
            
            let attempts = 0;
            while (attempts < 10) {
                const newX = currentTileX + Math.floor(Math.random() * patrolRadius * 2) - patrolRadius;
                const newY = currentTileY + Math.floor(Math.random() * patrolRadius * 2) - patrolRadius;
                
                if (dungeon.isWalkable(newX, newY)) {
                    this.moveToTile(newX, newY, dungeon);
                    break;
                }
                attempts++;
            }
        }
    }

    handleChaseState(deltaTime, player, distanceToPlayer, canSeePlayer, dungeon) {
        if (canSeePlayer) {
            this.lastKnownPlayerPos = { x: player.x, y: player.y };
            this.lostPlayerTime = 0;
            
            if (distanceToPlayer <= this.attackRange) {
                this.setState('attack');
                return;
            }
            
            // Move towards player
            this.moveTowardsPlayer(player, dungeon);
        } else {
            this.lostPlayerTime += deltaTime;
            
            if (this.lostPlayerTime > 5000) {
                // Lost player for too long, return to patrol
                this.setState('patrol');
            } else if (this.lastKnownPlayerPos) {
                // Move to last known position
                this.moveToPosition(this.lastKnownPlayerPos, dungeon);
            }
        }
    }

    handleAttackState(deltaTime, player, distanceToPlayer) {
        if (distanceToPlayer > this.attackRange) {
            this.setState('chase');
            return;
        }
        
        const now = Date.now();
        if (now - this.lastAttackTime >= this.attackCooldown) {
            this.attackPlayer(player);
            this.lastAttackTime = now;
        }
    }

    handleFleeState(deltaTime, player, dungeon) {
        // Run away from player
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length > 0) {
            const fleeX = this.x + (dx / length) * 64;
            const fleeY = this.y + (dy / length) * 64;
            
            const tileX = Math.floor(fleeX / 32);
            const tileY = Math.floor(fleeY / 32);
            
            if (dungeon.isWalkable(tileX, tileY)) {
                this.moveToTile(tileX, tileY, dungeon);
            }
        }
        
        // Stop fleeing after some time
        if (Date.now() - this.lastStateChange > 3000) {
            this.setState('patrol');
        }
    }

    setState(newState) {
        this.state = newState;
        this.lastStateChange = Date.now();
        this.stateData = {};
        
        // State-specific initialization
        switch(newState) {
            case 'attack':
                this.currentAnimation = 'attack';
                this.isMoving = false;
                break;
            case 'chase':
                this.currentAnimation = 'walk';
                break;
            case 'flee':
                this.currentAnimation = 'walk';
                this.speed = this.getBaseSpeed() * 1.5; // Flee faster
                break;
            default:
                this.currentAnimation = 'idle';
                this.speed = this.getBaseSpeed();
        }
    }

    getDistanceToPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    canSeePlayer(player, dungeon) {
        // Simple line-of-sight check
        const steps = 20;
        const dx = (player.x - this.x) / steps;
        const dy = (player.y - this.y) / steps;
        
        for (let i = 1; i < steps; i++) {
            const checkX = Math.floor((this.x + dx * i) / 32);
            const checkY = Math.floor((this.y + dy * i) / 32);
            
            if (!dungeon.isWalkable(checkX, checkY)) {
                return false;
            }
        }
        
        return true;
    }

    moveTowardsPlayer(player, dungeon) {
        const playerTileX = Math.floor(player.x / 32);
        const playerTileY = Math.floor(player.y / 32);
        this.moveToTile(playerTileX, playerTileY, dungeon);
    }

    moveToPosition(position, dungeon) {
        const tileX = Math.floor(position.x / 32);
        const tileY = Math.floor(position.y / 32);
        this.moveToTile(tileX, tileY, dungeon);
    }

    moveToTile(tileX, tileY, dungeon) {
        const currentTileX = Math.floor(this.x / 32);
        const currentTileY = Math.floor(this.y / 32);
        
        // Simple direct movement for now
        this.targetX = tileX * 32;
        this.targetY = tileY * 32;
        this.isMoving = true;
    }

    updateMovement(deltaTime, dungeon) {
        if (!this.isMoving) return;
        
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 1) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.isMoving = false;
        } else {
            const moveDistance = this.speed * (deltaTime / 1000);
            const ratio = Math.min(moveDistance / distance, 1);
            
            this.x += dx * ratio;
            this.y += dy * ratio;
        }
    }

    updateAnimation(deltaTime) {
        this.animationTime += deltaTime;
        
        if (this.animationTime >= this.animationSpeed) {
            this.animationTime = 0;
            this.animationFrame++;
            
            const maxFrames = this.getAnimationFrameCount(this.currentAnimation);
            if (this.animationFrame >= maxFrames) {
                this.animationFrame = 0;
                
                // Reset to idle after attack animation
                if (this.currentAnimation === 'attack' && this.state !== 'attack') {
                    this.currentAnimation = 'idle';
                }
            }
        }
    }

    getAnimationFrameCount(animation) {
        switch(animation) {
            case 'idle': return 4;
            case 'walk': return 6;
            case 'attack': return 4;
            case 'death': return 6;
            default: return 1;
        }
    }

    attackPlayer(player) {
        this.currentAnimation = 'attack';
        this.animationFrame = 0;
        
        // Calculate damage
        const damage = Math.floor(this.damage * (0.8 + Math.random() * 0.4));
        player.takeDamage(damage);
        
        // Play attack sound
        game.audioManager?.playSound(`${this.type}_attack`);
        
        // Create damage number
        game.addParticle(new DamageNumber(player.x, player.y - 20, damage, '#ff4444'));
    }

    takeDamage(amount) {
        this.stats.health -= amount;
        
        // Create damage effect
        for (let i = 0; i < 3; i++) {
            game.addParticle(new BloodParticle(
                this.x + Math.random() * this.width,
                this.y + Math.random() * this.height
            ));
        }
        
        // React to damage
        if (this.stats.health <= 0) {
            this.die();
        } else if (this.state === 'patrol' || this.state === 'idle') {
            this.setState('chase');
        }
    }

    die() {
        this.state = 'dead';
        this.currentAnimation = 'death';
        this.animationFrame = 0;
        
        // Drop items
        this.dropLoot();
        
        // Give experience to player
        game.player.gainExperience(this.stats.experience);
        
        // Play death sound
        game.audioManager?.playSound(`${this.type}_death`);
        
        // Remove from game after death animation
        setTimeout(() => {
            game.removeEnemy(this);
        }, 1000);
    }

    dropLoot() {
        this.dropTable.forEach(drop => {
            if (Math.random() < drop.chance) {
                let item;
                
                if (drop.item === 'gold') {
                    const amount = drop.amount[0] + Math.floor(Math.random() * (drop.amount[1] - drop.amount[0]));
                    item = new Gold(amount);
                } else {
                    item = ItemFactory.createItem(drop.item);
                }
                
                if (item) {
                    game.addItem(new DroppedItem(this.x, this.y, item));
                }
            }
        });
    }

    render(ctx) {
        if (this.state === 'dead' && this.animationFrame >= this.getAnimationFrameCount('death') - 1) {
            return; // Don't render if death animation is complete
        }
        
        const sprite = this.assetLoader.getSprite(`enemy_${this.type}`);
        if (!sprite) {
            // Fallback rendering
            ctx.fillStyle = this.getTypeColor();
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Add simple face
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x + 8, this.y + 8, 4, 4);
            ctx.fillRect(this.x + 20, this.y + 8, 4, 4);
            ctx.fillRect(this.x + 8, this.y + 20, 16, 4);
        } else {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        }
        
        // Render health bar if damaged
        this.renderHealthBar(ctx);
        
        // Debug: render state
        if (game.debugMode) {
            ctx.fillStyle = '#ffff00';
            ctx.font = '10px monospace';
            ctx.fillText(this.state, this.x, this.y - 15);
        }
    }

    getTypeColor() {
        const colors = {
            skeleton: '#f0f0f0',
            goblin: '#90EE90',
            orc: '#8B4513',
            robot: '#C0C0C0',
            wolf: '#8B4513',
            golem: '#696969'
        };
        return colors[this.type] || '#666666';
    }

    renderHealthBar(ctx) {
        if (this.stats.health >= this.maxHealth) return;
        
        const barWidth = this.width;
        const barHeight = 4;
        const x = this.x;
        const y = this.y - 8;
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health
        const healthRatio = this.stats.health / this.maxHealth;
        ctx.fillStyle = healthRatio > 0.5 ? '#00ff00' : healthRatio > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(x, y, barWidth * healthRatio, barHeight);
    }
}

// Simple A* pathfinding
class AStar {
    findPath(startX, startY, endX, endY, dungeon) {
        // Simplified pathfinding - direct line for now
        return [{ x: startX, y: startY }, { x: endX, y: endY }];
    }
}

window.Enemy = Enemy;
window.AStar = AStar;