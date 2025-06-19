#!/bin/bash

# Create directories if they don't exist
mkdir -p assets/sprites
mkdir -p assets/sounds
mkdir -p assets/music

echo "Copying sprite assets from existing asset directory..."

# Player sprite
cp -f "asset/Pixel Crawler - Free Pack/Heroes/Knight/Idle/Idle_0.png" assets/sprites/player.png

# Enemy sprite
cp -f "asset/Pixel Crawler - Free Pack/Enemy/Skeleton Crew/Skeleton - Base/Idle/Idle_0.png" assets/sprites/enemy.png

# Environment sprites
cp -f "asset/Free Sample/Floor_Corner_01.png" assets/sprites/floor.png
cp -f "asset/Free Sample/WallBrick_Tall_01.png" assets/sprites/wall.png

# Item sprites
cp -f "asset/Free Sample/Armor_01.png" assets/sprites/armor.png
cp -f "asset/Free Sample/SmallChest_02.png" assets/sprites/gold.png
cp -f "asset/Pixel Crawler - Free Pack/Weapons/Wood/Wood.png" assets/sprites/weapon.png
cp -f "asset/Pixel Crawler - Free Pack/Icons/Potion/Red Potion.png" assets/sprites/health_potion.png 2>/dev/null || echo "Creating health potion placeholder"
cp -f "asset/Pixel Crawler - Free Pack/Icons/Potion/Blue Potion.png" assets/sprites/mana_potion.png 2>/dev/null || echo "Creating mana potion placeholder"

# Fireball sprite
cp -f "asset/Pixel Crawler - Free Pack/Magic/Flame/Flame.png" assets/sprites/fireball.png 2>/dev/null || echo "Creating fireball placeholder"

# Sound effects
echo "Copying sound assets..."
cp -f "asset/RPG Sound Pack/inventory/bottle.wav" assets/sounds/item.mp3 2>/dev/null || echo "Item sound not found"
cp -f "asset/RPG Sound Pack/battle/sword-unsheathe.wav" assets/sounds/attack.mp3 2>/dev/null || echo "Attack sound not found"
cp -f "asset/RPG Sound Pack/battle/swing.wav" assets/sounds/hit.mp3 2>/dev/null || echo "Hit sound not found"
cp -f "asset/RPG Sound Pack/battle/spell.wav" assets/sounds/fireball.mp3 2>/dev/null || echo "Fireball sound not found"
cp -f "asset/RPG Sound Pack/inventory/coin.wav" assets/sounds/levelup.mp3 2>/dev/null || echo "Level up sound not found"
cp -f "asset/RPG Sound Pack/battle/game-over.wav" assets/sounds/gameover.mp3 2>/dev/null || echo "Game over sound not found"

# Background music
echo "Copying music assets..."
cp -f "asset/dark-fantasy-ambient-dungeon-synth-248213.mp3" assets/music/dungeon.mp3 2>/dev/null || echo "Background music not found"

echo "Asset setup complete!"