const fs = require('fs');
const path = require('path');

class BuildTool {
    constructor() {
        this.distDir = 'dist';
        this.sourceDir = '.';
    }

    async build() {
        console.log('🚀 Starting production build...');
        
        // Create dist directory
        this.createDistDirectory();
        
        // Copy and process HTML
        this.processHTML();
        
        // Process CSS
        this.processCSS();
        
        // Process JavaScript
        this.processJavaScript();
        
        // Copy assets
        this.copyAssets();
        
        // Generate service worker for offline play
        this.generateServiceWorker();
        
        // Create manifest for PWA
        this.createManifest();
        
        console.log('✅ Production build complete!');
    }

    createDistDirectory() {
        if (fs.existsSync(this.distDir)) {
            fs.rmSync(this.distDir, { recursive: true });
        }
        fs.mkdirSync(this.distDir, { recursive: true });
    }

    processHTML() {
        console.log('📄 Processing HTML...');
        
        let html = fs.readFileSync('index.html', 'utf8');
        
        // Replace individual script tags with minified bundle
        const scriptRegex = /<script src="js\/.*?"><\/script>/g;
        html = html.replace(scriptRegex, '');
        html = html.replace('</body>', 
            '    <script src="game.min.js"></script>\n</body>');
        
        // Replace CSS links with minified bundle
        const cssRegex = /<link rel="stylesheet" href="css\/.*?">/g;
        html = html.replace(cssRegex, '<link rel="stylesheet" href="styles.min.css">');
        
        // Add PWA meta tags
        const pwaMetaTags = `
    <meta name="theme-color" content="#0a0a0a">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="manifest" href="manifest.json">
    <link rel="icon" type="image/png" sizes="192x192" href="assets/icon-192.png">
    <link rel="apple-touch-icon" href="assets/icon-192.png">`;
        
        html = html.replace('</head>', pwaMetaTags + '\n</head>');
        
        fs.writeFileSync(path.join(this.distDir, 'index.html'), html);
    }

    processCSS() {
        console.log('🎨 Processing CSS...');
        
        const cssFiles = ['css/styles.css', 'css/ui.css', 'css/responsive.css'];
        let combinedCSS = '';
        
        cssFiles.forEach(file => {
            if (fs.existsSync(file)) {
                combinedCSS += fs.readFileSync(file, 'utf8') + '\n';
            }
        });
        
        // Basic minification
        combinedCSS = combinedCSS
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
            .trim();
        
        fs.writeFileSync(path.join(this.distDir, 'styles.min.css'), combinedCSS);
    }

    processJavaScript() {
        console.log('⚡ Processing JavaScript...');
        
        const jsFiles = [
            'js/utils.js',
            'js/assetLoader.js',
            'js/audio.js',
            'js/input.js',
            'js/camera.js',
            'js/particles.js',
            'js/player.js',
            'js/enemies.js',
            'js/items.js',
            'js/combat.js',
            'js/dungeon.js',
            'js/ui.js',
            'js/saves.js',
            'js/game.js',
            'js/main.js'
        ];
        
        let combinedJS = '';
        
        jsFiles.forEach(file => {
            if (fs.existsSync(file)) {
                combinedJS += fs.readFileSync(file, 'utf8') + '\n';
            }
        });
        
        // Basic minification (for production, use proper tools like Terser)
        combinedJS = combinedJS
            .replace(/\/\/.*$/gm, '') // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .trim();
        
        fs.writeFileSync(path.join(this.distDir, 'game.min.js'), combinedJS);
    }

    copyAssets() {
        console.log('📦 Copying assets...');
        
        const assetsDir = path.join(this.distDir, 'assets');
        fs.mkdirSync(assetsDir, { recursive: true });
        
        // Copy asset directories
        this.copyDirectory('assets', assetsDir);
        
        // Create optimized icon for PWA
        this.createIcons();
    }

    copyDirectory(src, dest) {
        if (!fs.existsSync(src)) return;
        
        fs.mkdirSync(dest, { recursive: true });
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    createIcons() {
        // Simple icon generation (in production, use proper image processing)
        const iconSVG = `
<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
    <rect width="192" height="192" fill="#0a0a0a"/>
    <rect x="48" y="48" width="96" height="96" fill="#00ff00" stroke="#00aa00" stroke-width="4"/>
    <text x="96" y="110" text-anchor="middle" fill="#000" font-family="monospace" font-size="24">RPG</text>
</svg>`;
        
        fs.writeFileSync(path.join(this.distDir, 'assets', 'icon.svg'), iconSVG);
    }

    generateServiceWorker() {
        console.log('⚙️ Generating service worker...');
        
        const swContent = `
const CACHE_NAME = 'dungeon-crawler-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.min.css',
    '/game.min.js',
    '/manifest.json',
    '/assets/icon.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});
`;
        
        fs.writeFileSync(path.join(this.distDir, 'sw.js'), swContent);
    }

    createManifest() {
        console.log('📱 Creating PWA manifest...');
        
        const manifest = {
            name: "Dungeon Crawler RPG",
            short_name: "DungeonRPG",
            description: "A browser-based procedural dungeon crawler RPG",
            start_url: "/",
            display: "fullscreen",
            orientation: "landscape",
            theme_color: "#0a0a0a",
            background_color: "#000000",
            icons: [
                {
                    src: "assets/icon.svg",
                    sizes: "192x192",
                    type: "image/svg+xml"
                }
            ]
        };
        
        fs.writeFileSync(
            path.join(this.distDir, 'manifest.json'), 
            JSON.stringify(manifest, null, 2)
        );
    }
}

// Run build if called directly
if (require.main === module) {
    const builder = new BuildTool();
    builder.build().catch(console.error);
}

module.exports = BuildTool;