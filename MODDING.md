# 🔧 Modding Guide

This guide explains how to extend and modify the Dungeon Crawler RPG.

## Adding New Enemy Types

### 1. Extend the Enemy Class

```javascript
class NewEnemyType extends Enemy {
    constructor(x, y, assetLoader) {
        super(x, y, assetLoader);
        this.type = 'new_enemy';
        this.customProperty = 'value';
    }
    
    customBehavior() {
        // Add unique enemy behavior
    }
}
```

### 2. Add Sprite Assets
- Place sprite files in `/assets/sprites/`
- Use consistent naming: `enemy_newtype.png`
- Recommended size: 32x32 pixels

### 3. Register in EnemyFactory
```javascript
// In js/enemies.js
EnemyFactory.createEnemy = function(type, x, y, assetLoader) {
    switch(type) {
        case 'new_enemy':
            return new NewEnemyType(x, y, assetLoader);
        // ... existing cases
    }
}
```

### 4. Define Stats
```javascript
getStatsForType(type) {
    const stats = {
        new_enemy: {
            health: 80,
            damage: 15,
            speed: 60,
            xpReward: 25
        }
        // ... existing stats
    };
    return stats[type] || stats.skeleton;
}
```

## Adding New Items

### 1. Extend Item Classes

**Weapons:**
```javascript
class NewWeapon extends Weapon {
    constructor(level = 1) {
        super('new_weapon', level);
        this.specialAbility = 'fire_damage';
    }
}
```

**Armor:**
```javascript
class NewArmor extends Armor {
    constructor(level = 1) {
        super('new_armor', level);
        this.setBonus = 'magic_resistance';
    }
}
```

**Consumables:**
```javascript
class NewPotion extends Consumable {
    constructor() {
        super('new_potion');
        this.effect = 'temporary_buff';
    }
    
    use(player) {
        // Custom effect logic
        return true; // Item consumed
    }
}
```

### 2. Register in ItemFactory
```javascript
ItemFactory.createItem = function(type, level = 1) {
    switch(type) {
        case 'new_weapon':
            return new NewWeapon(level);
        case 'new_potion':
            return new NewPotion();
        // ... existing cases
    }
}
```

### 3. Add to Drop Tables
```javascript
// In enemy classes
getDropTable() {
    return [
        { item: 'new_weapon', chance: 0.05, level: this.level },
        { item: 'health_potion', chance: 0.3 }
        // ... existing drops
    ];
}
```

## Custom Dungeon Themes

### 1. Add Tileset Assets
- Create folder: `/assets/tiles/new_theme/`
- Include: `floor.png`, `wall.png`, `door.png`
- Size: 32x32 pixels per tile

### 2. Register in TileManager
```javascript
// In js/dungeon.js
const TILESETS = {
    new_theme: {
        floor: 'assets/tiles/new_theme/floor.png',
        wall: 'assets/tiles/new_theme/wall.png',
        door: 'assets/tiles/new_theme/door.png'
    }
    // ... existing tilesets
};
```

### 3. Update Theme Selection
```javascript
selectThemeForLevel(level) {
    if (level >= 15) return 'new_theme';
    if (level >= 8) return 'nature';
    if (level >= 4) return 'ruins';
    return 'modern';
}
```

### 4. Theme-Specific Spawning
```javascript
getEnemyTypesForTheme(theme) {
    const themeEnemies = {
        new_theme: ['new_enemy', 'elite_skeleton'],
        nature: ['goblin', 'orc'],
        // ... existing themes
    };
    return themeEnemies[theme] || ['skeleton'];
}
```

## Testing Your Mods

### Unit Testing
```javascript
// Example test structure
describe('NewEnemyType', () => {
    it('should have correct stats', () => {
        const enemy = new NewEnemyType(0, 0, mockAssetLoader);
        expect(enemy.stats.health).toBe(80);
        expect(enemy.type).toBe('new_enemy');
    });
    
    it('should perform custom behavior', () => {
        const enemy = new NewEnemyType(0, 0, mockAssetLoader);
        enemy.customBehavior();
        // Assert expected behavior
    });
});
```

### Integration Testing
```javascript
describe('ItemFactory', () => {
    it('should create new weapon type', () => {
        const weapon = ItemFactory.createItem('new_weapon', 5);
        expect(weapon).toBeInstanceOf(NewWeapon);
        expect(weapon.level).toBe(5);
    });
});
```

## Best Practices

### Code Style
- Follow existing naming conventions
- Use ES6+ features consistently
- Add JSDoc comments for new classes
- Maintain modular architecture

### Performance
- Optimize sprite sizes (use PNG-8 when possible)
- Limit particle effects for new abilities
- Test memory usage with new content
- Profile frame rate impact

### Compatibility
- Test across different browsers
- Ensure mobile compatibility
- Validate save/load with new content
- Check for memory leaks

## Common Pitfalls

### Asset Loading
- **Problem:** New assets not loading
- **Solution:** Check file paths and add to AssetLoader

### Save Compatibility
- **Problem:** Saves break with new content
- **Solution:** Add version checking and migration

### Performance Issues
- **Problem:** New content causes lag
- **Solution:** Profile and optimize rendering

### Mobile Issues
- **Problem:** Touch controls don't work with new UI
- **Solution:** Test touch targets and responsiveness

## Debugging Tools

### Console Commands
```javascript
// Debug new enemy
game.addEnemy(new NewEnemyType(100, 100, game.assetLoader));

// Test new item
const item = ItemFactory.createItem('new_weapon', 10);
game.player.inventory.addItem(item);

// Check performance
game.debugMode = true; // Shows FPS and memory
```

### Browser DevTools
- Use Performance tab to profile new content
- Monitor Network tab for asset loading
- Check Console for errors and warnings
- Use Memory tab to detect leaks

## Publishing Mods

### File Structure
```
my-mod/
├── README.md           # Mod description
├── assets/            # New assets
│   ├── sprites/
│   ├── sounds/
│   └── tiles/
├── js/                # Modified JS files
│   └── mod-enemies.js
└── install.md         # Installation instructions
```

### Documentation
- Describe what your mod adds
- List compatibility requirements
- Provide installation steps
- Include screenshots/videos

### Distribution
- Use GitHub for version control
- Create releases with zip files
- Write clear installation instructions
- Provide support for users

---

For technical details, see [TECHNICAL.md](TECHNICAL.md)
For gameplay features, see [README.md](README.md)