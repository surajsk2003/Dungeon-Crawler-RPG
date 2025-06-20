class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.targetX = 0;
        this.targetY = 0;
        this.followSpeed = 0.1;
        this.bounds = null;
    }

    setTarget(x, y) {
        this.targetX = x - this.width / 2;
        this.targetY = y - this.height / 2;
    }

    centerOn(x, y) {
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.targetX = this.x;
        this.targetY = this.y;
    }

    setBounds(minX, minY, maxX, maxY) {
        this.bounds = { minX, minY, maxX, maxY };
    }

    update(deltaTime) {
        // Smooth following
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        
        this.x += dx * this.followSpeed;
        this.y += dy * this.followSpeed;
        
        // Apply bounds if set
        if (this.bounds) {
            this.x = Math.max(this.bounds.minX, Math.min(this.x, this.bounds.maxX - this.width));
            this.y = Math.max(this.bounds.minY, Math.min(this.y, this.bounds.maxY - this.height));
        }
    }

    isVisible(x, y, width, height) {
        return !(x + width < this.x || 
                x > this.x + this.width || 
                y + height < this.y || 
                y > this.y + this.height);
    }

    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }

    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }
}

window.Camera = Camera;