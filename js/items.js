class Item {
    constructor(name, type, rarity = 'common') {
        this.id = this.generateId();
        this.name = name;
        this.type = type; // weapon, armor, consumable, misc
        this.rarity = rarity; // common, uncommon, rare, epic, legendary
        this.weight = 1;
        this.value = 10;
        this.description = '';
        this.sprite = null;
        this.stackable = false;
        this.maxStack = 1;
        this.level = 1;
        this.stats = {};
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getRarityColor() {
        const colors = {
            common: '#ffffff',
            uncommon: '#00ff00',
            rare: '#0080ff',
            epic: '#8000ff',
            legendary: '#ff8000'
        };
        return colors[this.rarity] || colors.common;
    }

    use(player) {
        // Override in subclasses
        return false;
    }

    serialize() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            rarity: this.rarity,
            weight: this.weight,
            value: this.value,
            level: this.level,
            stats: this.stats
        };
    }
}

class Weapon extends Item {
    constructor(weaponType, level = 1) {
        super(`${weaponType} +${level}`, 'weapon', Weapon.getRarityForLevel(level));
        this.weaponType = weaponType;
        this.level = level;
        this.damage = this.calculateDamage();
        this.critChance = 0.05 + (level * 0.01);
        this.durability = 100;
        this.maxDurability = 100;
        this.weight = this.getWeaponWeight();
        this.value = this.calculateValue();
        this.description = this.generateDescription();
        
        this.stats = {
            damage: this.damage,
            critChance: this.critChance
        };
    }

    static getRarityForLevel(level) {
        if (level >= 15) return 'legendary';
        if (level >= 10) return 'epic';
        if (level >= 6) return 'rare';
        if (level >= 3) return 'uncommon';
        return 'common';
    }

    calculateDamage() {
        const baseDamage = {
            sword: 10,
            axe: 12,
            dagger: 6,
            bow: 8,
            staff: 5
        };
        
        const base = baseDamage[this.weaponType] || 8;
        return base + (this.level * 2) + Math.floor(Math.random() * this.level);
    }

    getWeaponWeight() {
        const weights = {
            sword: 3,
            axe: 4,
            dagger: 1,
            bow: 2,
            staff: 2
        };
        return weights[this.weaponType] || 3;
    }

    calculateValue() {
        return this.damage * 5 + (this.level * 10);
    }

    generateDescription() {
        let desc = `A ${this.rarity} ${this.weaponType}. `;
        desc += `Damage: ${this.damage}. `;
        desc += `Critical Chance: ${(this.critChance * 100).toFixed(1)}%. `;
        desc += `Durability: ${this.durability}/${this.maxDurability}.`;
        return desc;
    }

    use(player) {
        // Equip weapon
        if (player.equipment.weapon) {
            player.inventory.addItem(player.equipment.weapon);
        }
        player.equipment.weapon = this;
        return true;
    }
}

class Armor extends Item {
    constructor(armorType, level = 1) {
        super(`${armorType} +${level}`, 'armor', Armor.getRarityForLevel(level));
        this.armorType = armorType;
        this.level = level;
        this.defense = this.calculateDefense();
        this.durability = 100;
        this.maxDurability = 100;
        this.weight = this.getArmorWeight();
        this.value = this.calculateValue();
        this.description = this.generateDescription();
        
        this.stats = {
            defense: this.defense
        };
    }

    static getRarityForLevel(level) {
        return Weapon.getRarityForLevel(level);
    }

    calculateDefense() {
        const baseDefense = {
            helmet: 3,
            chestplate: 8,
            boots: 2,
            gloves: 1
        };
        
        const base = baseDefense[this.armorType] || 3;
        return base + this.level + Math.floor(Math.random() * (this.level / 2 + 1));
    }

    getArmorWeight() {
        const weights = {
            helmet: 2,
            chestplate: 6,
            boots: 2,
            gloves: 1
        };
        return weights[this.armorType] || 3;
    }

    calculateValue() {
        return this.defense * 8 + (this.level * 15);
    }

    generateDescription() {
        let desc = `A ${this.rarity} ${this.armorType}. `;
        desc += `Defense: ${this.defense}. `;
        desc += `Durability: ${this.durability}/${this.maxDurability}.`;
        return desc;
    }

    use(player) {
        // Equip armor
        if (player.equipment[this.armorType]) {
            player.inventory.addItem(player.equipment[this.armorType]);
        }
        player.equipment[this.armorType] = this;
        return true;
    }
}

class Consumable extends Item {
    constructor(name, effect) {
        super(name, 'consumable');
        this.effect = effect;
        this.stackable = true;
        this.maxStack = 10;
        this.weight = 0.1;
    }

    use(player) {
        this.effect(player);
        return true; // Consume the item
    }
}

class HealthPotion extends Consumable {
    constructor() {
        super('Health Potion', (player) => {
            const healAmount = 30 + Math.floor(Math.random() * 20);
            player.heal(healAmount);
            game.addParticle(new HealParticle(player.x, player.y - 20, healAmount));
            game.audioManager?.playSound('potion_drink');
        });
        this.value = 25;
        this.description = 'Restores 30-50 health points.';
    }
}

class ManaPotion extends Consumable {
    constructor() {
        super('Mana Potion', (player) => {
            const manaAmount = 20 + Math.floor(Math.random() * 15);
            player.stats.mana = Math.min(player.stats.maxMana, player.stats.mana + manaAmount);
            game.addParticle(new ManaParticle(player.x, player.y - 20, manaAmount));
            game.audioManager?.playSound('potion_drink');
        });
        this.value = 20;
        this.description = 'Restores 20-35 mana points.';
    }
}

class MagicScroll extends Consumable {
    constructor(spellType = null) {
        const spells = ['fireball', 'heal', 'lightning', 'shield', 'teleport'];
        const spell = spellType || spells[Math.floor(Math.random() * spells.length)];
        
        super(`Scroll of ${spell}`, (player) => {
            this.castSpell(spell, player);
        });
        
        this.spellType = spell;
        this.value = 50;
        this.description = `Casts ${spell} when used.`;
    }

    castSpell(spell, player) {
        switch(spell) {
            case 'fireball':
                this.castFireball(player);
                break;
            case 'heal':
                this.castHeal(player);
                break;
            case 'lightning':
                this.castLightning(player);
                break;
            case 'shield':
                this.castShield(player);
                break;
            case 'teleport':
                this.castTeleport(player);
                break;
        }
    }

    castFireball(player) {
        const range = 100;
        const damage = 25 + Math.floor(Math.random() * 15);
        
        game.enemies.forEach(enemy => {
            const distance = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
            if (distance <= range) {
                enemy.takeDamage(damage);
                game.addParticle(new FireParticle(enemy.x, enemy.y));
            }
        });
        
        game.audioManager?.playSound('fireball');
    }

    castHeal(player) {
        const healAmount = 50 + Math.floor(Math.random() * 25);
        player.heal(healAmount);
        game.addParticle(new HealParticle(player.x, player.y - 20, healAmount));
    }

    castLightning(player) {
        // Find closest enemy
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        game.enemies.forEach(enemy => {
            const distance = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
            if (distance < closestDistance && distance <= 150) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        if (closestEnemy) {
            const damage = 35 + Math.floor(Math.random() * 20);
            closestEnemy.takeDamage(damage);
            game.addParticle(new LightningParticle(player.x, player.y, closestEnemy.x, closestEnemy.y));
            game.audioManager?.playSound('lightning');
        }
    }

    castShield(player) {
        const shieldEffect = {
            type: 'shield',
            duration: 10000,
            defense: 10,
            color: '#00aaff',
            onApply: (p) => p.stats.defense = (p.stats.defense || 0) + 10,
            onRemove: (p) => p.stats.defense = (p.stats.defense || 0) - 10,
            onUpdate: () => {}
        };
        
        player.addStatusEffect(shieldEffect);
        game.addParticle(new ShieldParticle(player.x, player.y));
    }

    castTeleport(player) {
        const range = 5;
        const currentTileX = Math.floor(player.x / 32);
        const currentTileY = Math.floor(player.y / 32);
        
        // Find valid teleport locations
        const validLocations = [];
        for (let dx = -range; dx <= range; dx++) {
            for (let dy = -range; dy <= range; dy++) {
                const newX = currentTileX + dx;
                const newY = currentTileY + dy;
                
                if (game.dungeon.isWalkable(newX, newY)) {
                    validLocations.push({ x: newX * 32, y: newY * 32 });
                }
            }
        }
        
        if (validLocations.length > 0) {
            const newPos = validLocations[Math.floor(Math.random() * validLocations.length)];
            game.addParticle(new TeleportParticle(player.x, player.y));
            player.setPosition(newPos.x, newPos.y);
            game.addParticle(new TeleportParticle(newPos.x, newPos.y));
            game.audioManager?.playSound('teleport');
        }
    }
}

class Gold extends Item {
    constructor(amount) {
        super('Gold', 'currency');
        this.amount = amount;
        this.stackable = true;
        this.maxStack = 999;
        this.weight = 0;
        this.value = amount;
        this.description = `${amount} gold coins.`;
    }

    use(player) {
        player.inventory.gold += this.amount;
        game.audioManager?.playSound('gold_pickup');
        return true;
    }
}

// Dropped item entity
class DroppedItem {
    constructor(x, y, item) {
        this.x = x;
        this.y = y;
        this.item = item;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.bobSpeed = 2;
        this.sparkleTimer = 0;
        this.pickupRange = 30;
        
        // Auto-pickup timer
        this.autoPickupTimer = 30000; // 30 seconds
        this.lifeTimer = 0;
    }

    update(deltaTime) {
        this.lifeTimer += deltaTime;
        this.sparkleTimer += deltaTime;
        
        // Check for pickup
        const player = game.player;
        if (player) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.pickupRange) {
                this.pickup(player);
                return;
            }
        }
        
        // Auto-remove after time limit
        if (this.lifeTimer >= this.autoPickupTimer) {
            game.removeItem(this);
        }
    }

    pickup(player) {
        if (this.item.type === 'currency') {
            this.item.use(player);
            game.removeItem(this);
        } else if (player.inventory.addItem(this.item)) {
            game.audioManager?.playSound('item_pickup');
            game.removeItem(this);
            
            // Show pickup notification
            game.ui?.showNotification(`Picked up: ${this.item.name}`);
        } else {
            // Inventory full
            game.ui?.showNotification('Inventory full!');
        }
    }

    render(ctx) {
        // Bobbing animation
        const bobY = Math.sin(Date.now() * 0.001 * this.bobSpeed + this.bobOffset) * 3;
        const drawY = this.y + bobY;
        
        // Draw item (simplified)
        const color = this.item.getRarityColor();
        ctx.fillStyle = color;
        ctx.fillRect(this.x + 8, drawY + 8, 16, 16);
        
        // Draw sparkles for rare items
        if (this.item.rarity !== 'common' && this.sparkleTimer % 1000 < 100) {
            this.renderSparkles(ctx, drawY);
        }
        
        // Draw rarity glow
        if (this.item.rarity !== 'common') {
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.fillStyle = color + '40';
            ctx.fillRect(this.x + 6, drawY + 6, 20, 20);
            ctx.shadowBlur = 0;
        }
    }

    renderSparkles(ctx, drawY) {
        for (let i = 0; i < 3; i++) {
            const sparkleX = this.x + 16 + Math.cos(Date.now() * 0.01 + i * 2) * 20;
            const sparkleY = drawY + 16 + Math.sin(Date.now() * 0.01 + i * 2) * 20;
            
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(sparkleX, sparkleY, 2, 2);
        }
    }
}

// Item Factory for generating items
class ItemFactory {
    static createItem(type, level = 1) {
        switch(type) {
            case 'health_potion':
                return new HealthPotion();
            case 'mana_potion':
                return new ManaPotion();
            case 'scroll':
                return new MagicScroll();
            case 'gold':
                return new Gold(5 + Math.floor(Math.random() * 20));
            case 'sword':
                return new Weapon('sword', level);
            case 'axe':
                return new Weapon('axe', level);
            case 'bow':
                return new Weapon('bow', level);
            case 'helmet':
                return new Armor('helmet', level);
            case 'chestplate':
                return new Armor('chestplate', level);
            case 'boots':
                return new Armor('boots', level);
            default:
                return new HealthPotion();
        }
    }

    static createRandomItem(level = 1) {
        const itemTypes = [
            'health_potion', 'mana_potion', 'scroll', 'gold',
            'sword', 'axe', 'bow', 'helmet', 'chestplate', 'boots'
        ];
        
        const weights = [
            15, 10, 8, 20,  // Consumables
            5, 5, 5, 4, 4, 4   // Equipment
        ];
        
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < itemTypes.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return this.createItem(itemTypes[i], level);
            }
        }
        
        return new HealthPotion();
    }
}

window.Item = Item;
window.Weapon = Weapon;
window.Armor = Armor;
window.Consumable = Consumable;
window.HealthPotion = HealthPotion;
window.ManaPotion = ManaPotion;
window.MagicScroll = MagicScroll;
window.Gold = Gold;
window.DroppedItem = DroppedItem;
window.ItemFactory = ItemFactory;