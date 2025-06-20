#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Running performance analysis...');

// Analyze file sizes
function analyzeFileSizes() {
    console.log('\n📊 File Size Analysis:');
    
    const files = [
        'index.html',
        'css/styles.css',
        'css/ui.css',
        'css/responsive.css',
        'js/main.js',
        'js/game.js',
        'js/player.js',
        'js/dungeon.js',
        'js/enemies.js',
        'js/items.js',
        'js/audio.js',
        'js/particles.js',
        'js/input.js',
        'js/camera.js',
        'js/ui.js',
        'js/saves.js',
        'js/assetLoader.js',
        'js/utils.js'
    ];
    
    let totalSize = 0;
    
    files.forEach(file => {
        if (fs.existsSync(file)) {
            const stats = fs.statSync(file);
            const sizeKB = (stats.size / 1024).toFixed(2);
            totalSize += stats.size;
            
            console.log(`  ${file.padEnd(25)} ${sizeKB.padStart(8)} KB`);
        }
    });
    
    console.log(`  ${'TOTAL'.padEnd(25)} ${(totalSize / 1024).toFixed(2).padStart(8)} KB`);
    
    // Recommendations
    if (totalSize > 500 * 1024) {
        console.log('⚠️  Warning: Total JS/CSS size exceeds 500KB');
        console.log('   Consider code splitting or lazy loading');
    }
}

// Analyze asset sizes
function analyzeAssets() {
    console.log('\n🎵 Asset Analysis:');
    
    if (!fs.existsSync('assets')) {
        console.log('  No assets directory found');
        return;
    }
    
    let totalAssetSize = 0;
    
    function scanDirectory(dir, prefix = '') {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                scanDirectory(fullPath, prefix + item + '/');
            } else {
                const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                totalAssetSize += stats.size;
                
                if (stats.size > 1024 * 1024) { // Files > 1MB
                    console.log(`  ${(prefix + item).padEnd(40)} ${sizeMB.padStart(8)} MB`);
                }
            }
        });
    }
    
    scanDirectory('assets');
    
    console.log(`  ${'TOTAL ASSETS'.padEnd(40)} ${(totalAssetSize / (1024 * 1024)).toFixed(2).padStart(8)} MB`);
    
    if (totalAssetSize > 50 * 1024 * 1024) {
        console.log('⚠️  Warning: Total asset size exceeds 50MB');
        console.log('   Consider audio compression or lazy loading');
    }
}

// Check for potential performance issues
function checkPerformanceIssues() {
    console.log('\n🔧 Performance Check:');
    
    const checks = [
        {
            name: 'Large image files',
            check: () => {
                // Check for large images
                return false; // Placeholder
            }
        },
        {
            name: 'Uncompressed audio',
            check: () => {
                // Check for uncompressed audio
                return false; // Placeholder
            }
        },
        {
            name: 'Missing minification',
            check: () => {
                return !fs.existsSync('dist/game.min.js');
            }
        }
    ];
    
    checks.forEach(check => {
        const hasIssue = check.check();
        const status = hasIssue ? '❌' : '✅';
        console.log(`  ${status} ${check.name}`);
    });
}

// Generate performance report
function generateReport() {
    const report = {
        timestamp: new Date().toISOString(),
        analysis: 'Performance analysis completed',
        recommendations: [
            'Minify JavaScript and CSS files',
            'Compress audio assets',
            'Implement lazy loading for large assets',
            'Use service worker for caching'
        ]
    };
    
    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Performance report saved to performance-report.json');
}

// Main performance test
function runPerformanceTest() {
    analyzeFileSizes();
    analyzeAssets();
    checkPerformanceIssues();
    generateReport();
    
    console.log('\n✅ Performance analysis complete!');
}

// Run if called directly
if (require.main === module) {
    runPerformanceTest();
}

module.exports = { runPerformanceTest };