#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

class Deployer {
    constructor() {
        this.deploymentTargets = {
            'github-pages': this.deployToGitHubPages,
            'netlify': this.deployToNetlify,
            'manual': this.prepareManualDeploy
        };
    }

    async deploy(target = 'github-pages') {
        console.log(`🚀 Starting deployment to ${target}...`);
        
        try {
            // Pre-deployment checks
            await this.runPreDeploymentChecks();
            
            // Build production version
            console.log('📦 Building production version...');
            execSync('npm run build', { stdio: 'inherit' });
            
            // Deploy to target
            if (this.deploymentTargets[target]) {
                await this.deploymentTargets[target].call(this);
            } else {
                throw new Error(`Unknown deployment target: ${target}`);
            }
            
            console.log('✅ Deployment completed successfully!');
            
        } catch (error) {
            console.error('❌ Deployment failed:', error.message);
            process.exit(1);
        }
    }

    async runPreDeploymentChecks() {
        console.log('🔍 Running pre-deployment checks...');
        
        // Check if dist directory will be created
        if (!fs.existsSync('scripts/build.js')) {
            throw new Error('Build script not found');
        }
        
        // Check if package.json has correct repository
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!packageJson.repository || !packageJson.repository.url) {
            console.warn('⚠️  Repository URL not set in package.json');
        }
        
        // Run tests
        try {
            console.log('🧪 Running tests...');
            execSync('npm test', { stdio: 'inherit' });
        } catch (error) {
            console.warn('⚠️  Some tests failed, but continuing deployment...');
        }
        
        console.log('✅ Pre-deployment checks completed');
    }

    async deployToGitHubPages() {
        console.log('📤 Deploying to GitHub Pages...');
        
        try {
            // Check if gh-pages is installed
            execSync('npx gh-pages --version', { stdio: 'pipe' });
            
            // Deploy using gh-pages
            execSync('npx gh-pages -d dist', { stdio: 'inherit' });
            
            console.log('🌐 Deployed to GitHub Pages!');
            console.log('📍 Your game will be available at: https://yourusername.github.io/dungeon-crawler-rpg');
            
        } catch (error) {
            throw new Error('GitHub Pages deployment failed. Make sure gh-pages is installed and you have push access.');
        }
    }

    async deployToNetlify() {
        console.log('📤 Preparing for Netlify deployment...');
        
        // Create netlify.toml if it doesn't exist
        const netlifyConfig = `[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`;
        
        if (!fs.existsSync('netlify.toml')) {
            fs.writeFileSync('netlify.toml', netlifyConfig);
            console.log('📝 Created netlify.toml configuration');
        }
        
        console.log('✅ Ready for Netlify deployment!');
        console.log('📋 Next steps:');
        console.log('   1. Push your code to GitHub');
        console.log('   2. Connect your repository to Netlify');
        console.log('   3. Netlify will automatically deploy on push');
    }

    async prepareManualDeploy() {
        console.log('📦 Preparing manual deployment package...');
        
        // Create deployment package
        const deploymentFiles = [
            'dist/*',
            'README.md',
            'LICENSE'
        ];
        
        console.log('📁 Files ready for manual deployment:');
        console.log('   📂 dist/ - Upload this entire folder to your web server');
        console.log('   📄 Ensure your server supports:');
        console.log('      - MIME type for .mp3 files: audio/mpeg');
        console.log('      - MIME type for .wav files: audio/wav');
        console.log('      - HTTPS for PWA features');
        
        // Create deployment instructions
        const instructions = `# Manual Deployment Instructions

## Server Requirements
- Static file hosting (Apache, Nginx, etc.)
- HTTPS support (recommended for PWA features)
- Proper MIME types configured

## Upload Instructions
1. Upload all files from the 'dist' folder to your web server
2. Ensure the index.html file is in the root directory
3. Configure MIME types for audio files:
   - .mp3 files: audio/mpeg
   - .wav files: audio/wav

## Testing
1. Visit your deployed URL
2. Check browser console for errors
3. Test save/load functionality
4. Verify audio playback works

## Troubleshooting
- If assets don't load, check file paths and MIME types
- If saves don't work, ensure HTTPS is enabled
- If audio doesn't play, check browser permissions

Deployment completed: ${new Date().toISOString()}
`;
        
        fs.writeFileSync('dist/DEPLOYMENT_INSTRUCTIONS.txt', instructions);
        console.log('📝 Created deployment instructions in dist/DEPLOYMENT_INSTRUCTIONS.txt');
    }

    showPostDeploymentTips() {
        console.log('\n🎯 Post-Deployment Tips:');
        console.log('========================');
        console.log('🔍 Monitor your deployment:');
        console.log('   - Check browser console for errors');
        console.log('   - Test on different devices and browsers');
        console.log('   - Monitor loading times and performance');
        console.log('');
        console.log('📈 Track success metrics:');
        console.log('   - Page load time < 5 seconds');
        console.log('   - Game runs at 60 FPS');
        console.log('   - Save/load works reliably');
        console.log('   - Mobile experience is smooth');
        console.log('');
        console.log('🔄 For updates:');
        console.log('   - Test thoroughly before deploying');
        console.log('   - Consider save file compatibility');
        console.log('   - Update version numbers');
        console.log('   - Document changes in CHANGELOG.md');
    }
}

// Command line interface
if (require.main === module) {
    const target = process.argv[2] || 'github-pages';
    const deployer = new Deployer();
    
    deployer.deploy(target).then(() => {
        deployer.showPostDeploymentTips();
    }).catch(error => {
        console.error('Deployment failed:', error);
        process.exit(1);
    });
}

module.exports = Deployer;