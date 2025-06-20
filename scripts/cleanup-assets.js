#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up unused assets...');

// Essential assets that the game actually uses
const essentialAssets = [
    // Music
    'dark-fantasy-ambient-dungeon-synth-248213.mp3',
    '466_Drow_Slave_Camp.mp3',
    
    // Basic sprites (if they exist)
    'sprites/player.png',
    'sprites/enemy.png',
    'sprites/wall.png',
    'sprites/floor.png',
    'sprites/weapon.png',
    'sprites/armor.png',
    'sprites/health_potion.png',
    'sprites/mana_potion.png',
    'sprites/gold.png',
    'sprites/fireball.png',
    
    // Essential sounds
    'sounds/attack.wav',
    'sounds/attack.mp3',
    'sounds/hit.wav',
    'sounds/hit.mp3',
    'sounds/item.wav',
    'sounds/item.mp3',
    'sounds/levelup.wav',
    'sounds/levelup.mp3',
    'sounds/fireball.wav',
    'sounds/fireball.mp3',
    'sounds/gameover.wav',
    'sounds/gameover.mp3',
    
    // Credits
    'CREDITS.TXT'
];

// Large unnecessary directories to remove
const unnecessaryDirs = [
    'craftpix-net-385863-free-top-down-trees-pixel-art',
    'craftpix-net-894687-free-gui-for-cyberpunk-pixel-art',
    'craftpix-net-934618-free-top-down-ruins-pixel-art',
    'DungonCrawlGameSounds',
    '(DEMO) Lords Of Pain - Old School Isometric Assets',
    'Free Sample',
    'Modern tiles_Free',
    'Pixel Crawler - Free Pack'
];

// Files to definitely remove (large PSD files, etc.)
const unnecessaryFiles = [
    'Trees.psd',
    'Ruins.psd',
    'Windows.psd',
    'Rocks.psd'
];

function removeDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
        const stats = fs.statSync(dirPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`  ✓ Removed directory: ${path.basename(dirPath)}`);
        return true;
    }
    return false;
}

function removeFile(filePath) {
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        fs.unlinkSync(filePath);
        console.log(`  ✓ Removed file: ${path.basename(filePath)} (${sizeMB}MB)`);
        return true;
    }
    return false;
}

function scanAndRemoveUnused(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relativePath = path.relative('assets', fullPath);
        
        if (item.isDirectory()) {
            // Remove unnecessary directories
            if (unnecessaryDirs.includes(item.name)) {
                removeDirectory(fullPath);
                continue;
            }
            
            // Recursively scan subdirectories
            scanAndRemoveUnused(fullPath);
            
            // Remove empty directories
            try {
                const contents = fs.readdirSync(fullPath);
                if (contents.length === 0) {
                    fs.rmdirSync(fullPath);
                    console.log(`  ✓ Removed empty directory: ${item.name}`);
                }
            } catch (e) {
                // Directory not empty or doesn't exist
            }
        } else {
            // Remove unnecessary files
            if (unnecessaryFiles.some(pattern => item.name.includes(pattern))) {
                removeFile(fullPath);
                continue;
            }
            
            // Remove large files that aren't essential
            const stats = fs.statSync(fullPath);
            const sizeMB = stats.size / (1024 * 1024);
            
            if (sizeMB > 10 && !essentialAssets.some(asset => relativePath.includes(asset))) {
                console.log(`  ? Large file found: ${relativePath} (${sizeMB.toFixed(2)}MB)`);
                // Uncomment to remove: removeFile(fullPath);
            }
        }
    }
}

function createMinimalAssets() {
    console.log('\n📁 Creating minimal asset structure...');
    
    // Ensure essential directories exist
    const dirs = ['sprites', 'sounds', 'music'];
    dirs.forEach(dir => {
        const dirPath = path.join('assets', dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`  ✓ Created directory: ${dir}`);
        }
    });
    
    // Create placeholder sprites if they don't exist
    const placeholderSprites = [
        'player.png', 'enemy.png', 'wall.png', 'floor.png',
        'weapon.png', 'armor.png', 'health_potion.png', 'mana_potion.png',
        'gold.png', 'fireball.png'
    ];
    
    placeholderSprites.forEach(sprite => {
        const spritePath = path.join('assets/sprites', sprite);
        if (!fs.existsSync(spritePath)) {
            // Create a simple 32x32 colored square as placeholder
            console.log(`  ℹ Missing sprite: ${sprite} (game will use fallback rendering)`);
        }
    });
}

function showSizeComparison() {
    console.log('\n📊 Asset size analysis:');
    
    // Get current size
    const { execSync } = require('child_process');
    try {
        const currentSize = execSync('du -sh assets/', { encoding: 'utf8' }).trim();
        console.log(`  Current size: ${currentSize.split('\t')[0]}`);
    } catch (e) {
        console.log('  Could not calculate current size');
    }
}

// Main cleanup process
async function cleanup() {
    console.log('Starting asset cleanup...\n');
    
    showSizeComparison();
    
    console.log('\n🗑️ Removing unnecessary assets...');
    scanAndRemoveUnused('assets');
    
    createMinimalAssets();
    
    console.log('\n📊 After cleanup:');
    showSizeComparison();
    
    console.log('\n✅ Asset cleanup complete!');
    console.log('\n💡 Recommendations:');
    console.log('  - Game will use fallback rendering for missing sprites');
    console.log('  - Essential audio files preserved');
    console.log('  - Large unused asset packs removed');
    console.log('  - Run "npm run build" to update production build');
}

// Run cleanup if called directly
if (require.main === module) {
    cleanup().catch(console.error);
}

module.exports = { cleanup };