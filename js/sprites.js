// Sprite management system
const sprites = {
    loaded: false,
    images: {},
    
    // Load all sprites
    load: function(callback) {
        const imagesToLoad = [
            { name: 'player', src: 'asset/Pixel Crawler - Free Pack/Entities/Npc\'s/Knight/Idle/Idle_0.png' },
            { name: 'enemy', src: 'asset/Pixel Crawler - Free Pack/Entities/Mobs/Skeleton Crew/Skeleton - Base/Idle/Idle_0.png' },
            { name: 'floor', src: 'asset/Free Sample/Floor_Corner_01.png' },
            { name: 'wall', src: 'asset/Free Sample/WallBrick_Tall_01.png' },
            { name: 'health_potion', src: 'asset/sprites/health_potion.png' },
            { name: 'mana_potion', src: 'asset/sprites/mana_potion.png' },
            { name: 'weapon', src: 'asset/Pixel Crawler - Free Pack/Weapons/Wood/Wood.png' },
            { name: 'armor', src: 'asset/Free Sample/Armor_01.png' },
            { name: 'gold', src: 'asset/Free Sample/SmallChest_02.png' },
            { name: 'fireball', src: 'asset/sprites/fireball.png' }
        ];
        
        let loadedCount = 0;
        const totalImages = imagesToLoad.length;
        
        // Create placeholder images if assets aren't available
        const createPlaceholder = (name) => {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            
            // Different colors for different placeholder types
            switch(name) {
                case 'player':
                    ctx.fillStyle = '#2ecc71';
                    break;
                case 'enemy':
                    ctx.fillStyle = '#e74c3c';
                    break;
                case 'floor':
                    ctx.fillStyle = '#2a2a2a';
                    break;
                case 'wall':
                    ctx.fillStyle = '#555';
                    break;
                case 'health_potion':
                    ctx.fillStyle = '#e74c3c';
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillRect(4, 4, 24, 24);
                    ctx.fillStyle = '#fff';
                    ctx.fillText('♥', 16, 16);
                    break;
                case 'mana_potion':
                    ctx.fillStyle = '#3498db';
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillRect(4, 4, 24, 24);
                    ctx.fillStyle = '#fff';
                    ctx.fillText('♦', 16, 16);
                    break;
                case 'weapon':
                    ctx.fillStyle = '#f39c12';
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillRect(4, 4, 24, 24);
                    ctx.fillStyle = '#fff';
                    ctx.fillText('†', 16, 16);
                    break;
                case 'armor':
                    ctx.fillStyle = '#95a5a6';
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillRect(4, 4, 24, 24);
                    ctx.fillStyle = '#fff';
                    ctx.fillText('▦', 16, 16);
                    break;
                case 'gold':
                    ctx.fillStyle = '#f1c40f';
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillRect(4, 4, 24, 24);
                    ctx.fillStyle = '#fff';
                    ctx.fillText('$', 16, 16);
                    break;
                case 'fireball':
                    ctx.fillStyle = 'orange';
                    ctx.beginPath();
                    ctx.arc(16, 16, 12, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                default:
                    ctx.fillStyle = '#999';
                    ctx.fillRect(4, 4, 24, 24);
            }
            
            return canvas;
        };
        
        // Load each image
        imagesToLoad.forEach(imageInfo => {
            const img = new Image();
            
            img.onload = () => {
                sprites.images[imageInfo.name] = img;
                loadedCount++;
                if (loadedCount === totalImages) {
                    sprites.loaded = true;
                    if (callback) callback();
                }
            };
            
            img.onerror = () => {
                console.warn(`Failed to load sprite: ${imageInfo.name}. Using placeholder.`);
                sprites.images[imageInfo.name] = createPlaceholder(imageInfo.name);
                
                loadedCount++;
                if (loadedCount === totalImages) {
                    sprites.loaded = true;
                    if (callback) callback();
                }
            };
            
            // Try to load the image
            img.src = imageInfo.src;
        });
    },
    
    // Draw a sprite
    draw: function(ctx, name, x, y, width, height) {
        if (!this.loaded) return;
        
        const sprite = this.images[name];
        if (sprite) {
            ctx.drawImage(sprite, x, y, width, height);
        }
    }
};