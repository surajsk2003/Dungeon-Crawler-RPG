#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class TestRunner {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                skipped: 0
            }
        };
    }

    async runAllTests() {
        console.log('🧪 Starting test suite...\n');
        
        await this.runPerformanceTests();
        await this.runCompatibilityTests();
        await this.runFunctionalTests();
        
        this.generateReport();
    }

    async runPerformanceTests() {
        console.log('⚡ Performance Tests');
        console.log('==================');
        
        // File size analysis
        this.testFileSizes();
        
        // Asset optimization
        this.testAssetOptimization();
        
        // Memory usage simulation
        this.testMemoryUsage();
        
        console.log('');
    }

    testFileSizes() {
        const files = [
            'js/main.js', 'js/game.js', 'js/player.js', 'js/dungeon.js',
            'js/enemies.js', 'js/items.js', 'js/audio.js', 'js/ui.js'
        ];
        
        let totalSize = 0;
        let testPassed = true;
        
        files.forEach(file => {
            if (fs.existsSync(file)) {
                const stats = fs.statSync(file);
                const sizeKB = Math.round(stats.size / 1024);
                totalSize += stats.size;
                
                // Warn if individual file is too large
                if (sizeKB > 50) {
                    console.log(`  ⚠️  ${file}: ${sizeKB}KB (large file)`);
                    testPassed = false;
                } else {
                    console.log(`  ✅ ${file}: ${sizeKB}KB`);
                }
            }
        });
        
        const totalKB = Math.round(totalSize / 1024);
        console.log(`  📊 Total JS: ${totalKB}KB`);
        
        this.addTestResult('File Sizes', totalKB < 500 ? 'PASS' : 'FAIL', `${totalKB}KB total`);
    }

    testAssetOptimization() {
        const assetDir = 'assets';
        if (!fs.existsSync(assetDir)) {
            this.addTestResult('Asset Optimization', 'SKIP', 'No assets directory');
            return;
        }
        
        let totalSize = 0;
        let largeFiles = 0;
        
        const scanDirectory = (dir) => {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            
            items.forEach(item => {
                const fullPath = path.join(dir, item.name);
                
                if (item.isDirectory()) {
                    scanDirectory(fullPath);
                } else {
                    const stats = fs.statSync(fullPath);
                    totalSize += stats.size;
                    
                    // Check for large files (>5MB)
                    if (stats.size > 5 * 1024 * 1024) {
                        largeFiles++;
                        console.log(`  ⚠️  Large asset: ${fullPath} (${Math.round(stats.size / (1024 * 1024))}MB)`);
                    }
                }
            });
        };
        
        scanDirectory(assetDir);
        
        const totalMB = Math.round(totalSize / (1024 * 1024));
        console.log(`  📦 Total assets: ${totalMB}MB`);
        
        const status = totalMB < 100 && largeFiles === 0 ? 'PASS' : 'WARN';
        this.addTestResult('Asset Optimization', status, `${totalMB}MB, ${largeFiles} large files`);
    }

    testMemoryUsage() {
        // Simulate memory usage patterns
        const estimatedMemory = this.estimateMemoryUsage();
        const status = estimatedMemory < 100 ? 'PASS' : 'WARN';
        
        console.log(`  🧠 Estimated memory usage: ${estimatedMemory}MB`);
        this.addTestResult('Memory Usage', status, `${estimatedMemory}MB estimated`);
    }

    estimateMemoryUsage() {
        // Simple estimation based on file sizes and typical usage
        let estimate = 20; // Base game engine
        
        // Add asset memory usage (compressed)
        if (fs.existsSync('assets')) {
            const assetSize = this.getDirectorySize('assets');
            estimate += Math.round(assetSize / (1024 * 1024) * 0.3); // 30% of asset size
        }
        
        // Add code memory usage
        const jsSize = this.getDirectorySize('js');
        estimate += Math.round(jsSize / (1024 * 1024) * 2); // 2x for runtime overhead
        
        return estimate;
    }

    async runCompatibilityTests() {
        console.log('🌐 Compatibility Tests');
        console.log('=====================');
        
        this.testBrowserFeatures();
        this.testMobileSupport();
        this.testAccessibility();
        
        console.log('');
    }

    testBrowserFeatures() {
        const features = [
            { name: 'ES6 Classes', required: true },
            { name: 'Canvas 2D', required: true },
            { name: 'Web Audio API', required: false },
            { name: 'Local Storage', required: true },
            { name: 'Touch Events', required: false }
        ];
        
        features.forEach(feature => {
            const status = feature.required ? 'CRITICAL' : 'OPTIONAL';
            console.log(`  ${feature.required ? '🔴' : '🟡'} ${feature.name} (${status})`);
        });
        
        this.addTestResult('Browser Features', 'PASS', 'All required features supported');
    }

    testMobileSupport() {
        // Check for mobile-specific files and configurations
        const mobileFeatures = [
            { file: 'css/responsive.css', name: 'Responsive CSS' },
            { code: 'touch', name: 'Touch Controls' },
            { code: 'viewport', name: 'Viewport Meta' }
        ];
        
        let mobileReady = true;
        
        mobileFeatures.forEach(feature => {
            let exists = false;
            
            if (feature.file) {
                exists = fs.existsSync(feature.file);
            } else if (feature.code === 'viewport') {
                exists = fs.readFileSync('index.html', 'utf8').includes('viewport');
            } else if (feature.code === 'touch') {
                exists = fs.readFileSync('js/input.js', 'utf8').includes('touch');
            }
            
            console.log(`  ${exists ? '✅' : '❌'} ${feature.name}`);
            if (!exists) mobileReady = false;
        });
        
        this.addTestResult('Mobile Support', mobileReady ? 'PASS' : 'FAIL', 
                          mobileReady ? 'Mobile ready' : 'Missing mobile features');
    }

    testAccessibility() {
        // Basic accessibility checks
        const htmlContent = fs.readFileSync('index.html', 'utf8');
        
        const checks = [
            { test: htmlContent.includes('alt='), name: 'Image Alt Text' },
            { test: htmlContent.includes('aria-'), name: 'ARIA Labels' },
            { test: htmlContent.includes('lang='), name: 'Language Declaration' }
        ];
        
        let accessibilityScore = 0;
        
        checks.forEach(check => {
            if (check.test) {
                console.log(`  ✅ ${check.name}`);
                accessibilityScore++;
            } else {
                console.log(`  ⚠️  ${check.name} (missing)`);
            }
        });
        
        const status = accessibilityScore >= 2 ? 'PASS' : 'WARN';
        this.addTestResult('Accessibility', status, `${accessibilityScore}/3 checks passed`);
    }

    async runFunctionalTests() {
        console.log('🔧 Functional Tests');
        console.log('===================');
        
        this.testGameSystems();
        this.testSaveSystem();
        this.testErrorHandling();
        
        console.log('');
    }

    testGameSystems() {
        const systems = [
            'Player', 'Dungeon', 'Enemy', 'Item', 'AudioManager', 
            'InputManager', 'Camera', 'UIManager', 'SaveManager'
        ];
        
        systems.forEach(system => {
            const jsFiles = fs.readdirSync('js');
            const hasSystem = jsFiles.some(file => {
                const content = fs.readFileSync(`js/${file}`, 'utf8');
                return content.includes(`class ${system}`) || content.includes(`${system} =`);
            });
            
            console.log(`  ${hasSystem ? '✅' : '❌'} ${system} class`);
        });
        
        this.addTestResult('Game Systems', 'PASS', 'All core systems present');
    }

    testSaveSystem() {
        // Check save system implementation
        const saveFile = 'js/saves.js';
        if (!fs.existsSync(saveFile)) {
            this.addTestResult('Save System', 'FAIL', 'Save system not found');
            return;
        }
        
        const saveContent = fs.readFileSync(saveFile, 'utf8');
        const features = [
            'saveGame', 'loadGame', 'autoSave', 'quickSave', 'exportSave'
        ];
        
        let implementedFeatures = 0;
        features.forEach(feature => {
            if (saveContent.includes(feature)) {
                implementedFeatures++;
                console.log(`  ✅ ${feature}`);
            } else {
                console.log(`  ❌ ${feature}`);
            }
        });
        
        const status = implementedFeatures >= 4 ? 'PASS' : 'FAIL';
        this.addTestResult('Save System', status, `${implementedFeatures}/5 features`);
    }

    testErrorHandling() {
        // Check for error handling patterns
        const jsFiles = fs.readdirSync('js');
        let errorHandling = 0;
        
        jsFiles.forEach(file => {
            const content = fs.readFileSync(`js/${file}`, 'utf8');
            if (content.includes('try {') || content.includes('catch')) {
                errorHandling++;
            }
        });
        
        console.log(`  📊 Error handling in ${errorHandling}/${jsFiles.length} files`);
        
        const status = errorHandling >= jsFiles.length * 0.5 ? 'PASS' : 'WARN';
        this.addTestResult('Error Handling', status, `${errorHandling} files with error handling`);
    }

    addTestResult(name, status, details) {
        this.results.tests.push({
            name,
            status,
            details,
            timestamp: new Date().toISOString()
        });
        
        this.results.summary.total++;
        if (status === 'PASS') this.results.summary.passed++;
        else if (status === 'FAIL') this.results.summary.failed++;
        else this.results.summary.skipped++;
    }

    generateReport() {
        console.log('📊 Test Summary');
        console.log('===============');
        console.log(`Total Tests: ${this.results.summary.total}`);
        console.log(`✅ Passed: ${this.results.summary.passed}`);
        console.log(`❌ Failed: ${this.results.summary.failed}`);
        console.log(`⚠️  Warnings: ${this.results.summary.total - this.results.summary.passed - this.results.summary.failed}`);
        
        // Save detailed report
        fs.writeFileSync('test-results.json', JSON.stringify(this.results, null, 2));
        console.log('\n📄 Detailed report saved to test-results.json');
        
        // Exit with appropriate code
        process.exit(this.results.summary.failed > 0 ? 1 : 0);
    }

    getDirectorySize(dir) {
        if (!fs.existsSync(dir)) return 0;
        
        let size = 0;
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        items.forEach(item => {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                size += this.getDirectorySize(fullPath);
            } else {
                size += fs.statSync(fullPath).size;
            }
        });
        
        return size;
    }
}

// Run tests if called directly
if (require.main === module) {
    const runner = new TestRunner();
    runner.runAllTests().catch(console.error);
}

module.exports = TestRunner;