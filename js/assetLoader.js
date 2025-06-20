class AssetLoader {
    constructor() {
        this.assets = {
            sprites: new Map(),
            sounds: new Map(),
            music: new Map()
        };
        this.loaded = 0;
        this.total = 0;
        this.loadingCallbacks = [];
    }

    onProgress(callback) {
        this.loadingCallbacks.push(callback);
    }

    updateProgress() {
        this.loaded++;
        const progress = (this.loaded / this.total) * 100;
        this.loadingCallbacks.forEach(callback => callback(progress, this.loaded, this.total));
    }

    async loadAllAssets() {
        // Only load assets that actually exist
        const assets = [
            { path: 'assets/dark-fantasy-ambient-dungeon-synth-248213.mp3', type: 'music', key: 'ambient' },
            { path: 'assets/466_Drow_Slave_Camp.mp3', type: 'music', key: 'combat' }
        ];

        this.total = assets.length;

        // Load each asset
        for (const asset of assets) {
            try {
                if (asset.type === 'music') {
                    await this.loadAudio(asset.path, asset.key);
                }
            } catch (error) {
                console.warn(`Failed to load ${asset.path}:`, error);
                this.updateProgress(); // Still count as loaded to prevent hanging
            }
        }

        // Complete loading immediately
        this.loaded = this.total;
        this.updateProgress();
    }

    async loadAudio(path, key) {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.assets.music.set(key, audio);
                this.updateProgress();
                resolve(audio);
            };
            audio.onerror = () => {
                console.warn(`Failed to load audio: ${path}`);
                this.updateProgress();
                resolve(null); // Resolve anyway to prevent hanging
            };
            audio.src = path;
        });
    }

    getSprite(key) {
        return this.assets.sprites.get(key) || this.createFallbackSprite();
    }

    getSound(key) {
        return this.assets.sounds.get(key);
    }

    getMusic(key) {
        return this.assets.music.get(key);
    }

    createFallbackSprite() {
        // Create a simple colored rectangle as fallback
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(0, 0, 32, 32);
        return canvas;
    }
}

window.AssetLoader = AssetLoader;