# Dungeon Crawler RPG

A simple browser-based dungeon crawler game built with HTML5, CSS, and JavaScript.

## Features

- Procedurally generated dungeons with rooms and corridors
- Player movement and combat system
- Enemy AI with pathfinding
- Item collection and inventory system
- Character progression with leveling
- Multiple dungeon floors with increasing difficulty
- Sprite-based graphics
- Sound effects for game actions
- Background music

## How to Play

1. Open `index.html` in a modern web browser
2. Use WASD or arrow keys to move your character
3. Press Space to attack nearby enemies
4. Collect items by walking over them
5. Use E to consume health potions and R to consume mana potions
6. Cast Fireball with F key (costs 15 MP)
7. Defeat all enemies on a floor to proceed to the next floor (press Enter)
8. Level up by gaining XP from defeating enemies

## Controls

- WASD / Arrow Keys: Move
- Space: Attack
- F: Cast Fireball (area damage spell, costs 15 MP)
- E: Use Health Potion
- R: Use Mana Potion
- M: Toggle Sound On/Off
- Enter: Next Floor (when all enemies are defeated)
- Click Items in Inventory: Use/Equip

### Debug Controls
- ` (Backtick): Toggle Debug Mode
- F1: Toggle Hitboxes (when in debug mode)
- F2: Toggle FPS Display (when in debug mode)

## Items

- Health Potion: Restores 30 HP
- Mana Potion: Restores 20 MP
- Weapon: Increases Attack
- Armor: Increases Defense
- Gold: Collectible treasure

## Development

This game is built using vanilla JavaScript with HTML5 Canvas for rendering. The game features:

- Object-oriented design for game entities
- Procedural dungeon generation algorithm
- Simple collision detection system
- Basic enemy AI
- UI with stats, inventory, and message log
- Sprite-based rendering system with fallback placeholders
- Audio system with sound effects
- Background music system

## Asset Credits

The game uses assets from:
- Pixel Crawler - Free Pack
- Free Sample dungeon assets
- RPG Sound Pack
- DungeonCrawlGameSounds
- Dark Fantasy Ambient Dungeon Synth music
- CraftPix GUI for Cyberpunk Pixel Art