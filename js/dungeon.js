class Dungeon {
    constructor(width, height, assetLoader) {
        this.width = width;
        this.height = height;
        this.assetLoader = assetLoader;
        this.currentLevel = 1;
        this.currentTheme = 'modern';
        this.seed = Math.random();
        
        // Tile types
        this.TILES = {
            FLOOR: 0,
            WALL: 1,
            DOOR: 2,
            STAIRS_UP: 3,
            STAIRS_DOWN: 4
        };
        
        // Initialize grid
        this.grid = [];
        for (let y = 0; y < height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < width; x++) {
                this.grid[y][x] = this.TILES.WALL;
            }
        }
    }

    generateLevel(level) {
        this.currentLevel = level;
        
        // Simple room generation
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (Math.random() > 0.3) {
                    this.grid[y][x] = this.TILES.FLOOR;
                }
            }
        }
        
        // Add stairs
        this.grid[this.height - 2][this.width - 2] = this.TILES.STAIRS_DOWN;
    }

    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return this.TILES.WALL;
        }
        return this.grid[y][x];
    }

    isWalkable(x, y) {
        const tile = this.getTile(x, y);
        return tile === this.TILES.FLOOR || tile === this.TILES.STAIRS_DOWN;
    }

    getSpawnPoint() {
        // Find first floor tile
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.getTile(x, y) === this.TILES.FLOOR) {
                    return { x, y };
                }
            }
        }
        return { x: 1, y: 1 };
    }

    render(ctx, camera) {
        const tileSize = 32;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.getTile(x, y);
                const drawX = x * tileSize;
                const drawY = y * tileSize;
                
                // Only render visible tiles
                if (camera && !camera.isVisible(drawX, drawY, tileSize, tileSize)) {
                    continue;
                }
                
                switch (tile) {
                    case this.TILES.FLOOR:
                        ctx.fillStyle = '#666666';
                        break;
                    case this.TILES.WALL:
                        ctx.fillStyle = '#333333';
                        break;
                    case this.TILES.STAIRS_DOWN:
                        ctx.fillStyle = '#ff0000';
                        break;
                    default:
                        ctx.fillStyle = '#000000';
                }
                
                ctx.fillRect(drawX, drawY, tileSize, tileSize);
            }
        }
    }
}

window.Dungeon = Dungeon;