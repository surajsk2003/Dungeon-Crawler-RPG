class Camera {
    constructor(viewportWidth, viewportHeight) {
        this.x = 0;
        this.y = 0;
        this.width = viewportWidth;
        this.height = viewportHeight;
        
        // Target following
        this.targetX = 0;
        this.targetY = 0;
        this.followSpeed = 8;
        this.deadZone = 64; // Pixels of movement before camera follows
        
        // Zoom
        this.zoom = 1;
        this.targetZoom = 1;
        this.minZoom = 0.5;
        this.maxZoom = 2;
        this.zoomSpeed = 5;
        
        // Bounds
        this.bounds = null;
        this.boundsPadding = 100;
        
        // Shake effect
        this.shake = {
            intensity: 0,
            duration: 0,
            time: 0,
            offsetX: 0,
            offsetY: 0
        };
        
        // Smooth transitions
        this.isTransitioning = false;
        this.transitionDuration = 1000;
        this.transitionTime = 0;
        this.transitionStartX = 0;
        this.transitionStartY = 0;
        this.transitionEndX = 0;
        this.transitionEndY = 0;
        
        // Look-ahead (for platformers)
        this.lookAhead = {
            enabled: false,
            distance: 100,
            speed: 3
        };
    }

    setTarget(target) {
        this.target = target;
    }

    setBounds(minX, minY, maxX, maxY) {
        this.bounds = { minX, minY, maxX, maxY };
    }

    followTarget(targetX, targetY) {
        if (!this.target) return;
        
        // Calculate desired camera position (center target on screen)
        this.targetX = targetX - this.width / 2;
        this.targetY = targetY - this.height / 2;
        
        // Add look ahead based on target movement
        if (this.target.vx !== undefined && this.target.vy !== undefined) {
            this.lookAhead.x += (this.target.vx * this.lookAhead.strength - this.lookAhead.x) * this.lookAhead.smoothing;
            this.lookAhead.y += (this.target.vy * this.lookAhead.strength - this.lookAhead.y) * this.lookAhead.smoothing;
            
            this.targetX += this.lookAhead.x;
            this.targetY += this.lookAhead.y;
        }
    }

    update(deltaTime) {
        this.updateShake(deltaTime);
        this.updateZoom(deltaTime);
        this.updateTransition(deltaTime);
        this.updatePosition(deltaTime);
        this.applyBounds();
    }

    updateShake(deltaTime) {
        if (this.shake.duration > 0) {
            this.shake.time += deltaTime;
            
            if (this.shake.time >= this.shake.duration) {
                this.shake.duration = 0;
                this.shake.offsetX = 0;
                this.shake.offsetY = 0;
            } else {
                const progress = this.shake.time / this.shake.duration;
                const intensity = this.shake.intensity * (1 - progress);
                
                this.shake.offsetX = (Math.random() - 0.5) * intensity * 2;
                this.shake.offsetY = (Math.random() - 0.5) * intensity * 2;
            }
        }
    }

    updateZoom(deltaTime) {
        if (Math.abs(this.zoom - this.targetZoom) > 0.01) {
            const zoomDiff = this.targetZoom - this.zoom;
            this.zoom += zoomDiff * this.zoomSpeed * (deltaTime / 1000);
        }
    }

    updateTransition(deltaTime) {
        if (this.isTransitioning) {
            this.transitionTime += deltaTime;
            const progress = Math.min(this.transitionTime / this.transitionDuration, 1);
            
            // Smooth easing function
            const easedProgress = this.easeInOutCubic(progress);
            
            this.x = this.lerp(this.transitionStartX, this.transitionEndX, easedProgress);
            this.y = this.lerp(this.transitionStartY, this.transitionEndY, easedProgress);
            
            if (progress >= 1) {
                this.isTransitioning = false;
            }
        }
    }

    updatePosition(deltaTime) {
        if (this.isTransitioning) return;
        
        // Calculate desired position
        let desiredX = this.targetX - this.width / 2;
        let desiredY = this.targetY - this.height / 2;
        
        // Apply look-ahead if enabled
        if (this.lookAhead.enabled && game.player) {
            const player = game.player;
            if (player.isMoving) {
                const moveDirection = {
                    x: player.targetX - player.x,
                    y: player.targetY - player.y
                };
                
                const length = Math.sqrt(moveDirection.x ** 2 + moveDirection.y ** 2);
                if (length > 0) {
                    moveDirection.x /= length;
                    moveDirection.y /= length;
                    
                    desiredX += moveDirection.x * this.lookAhead.distance;
                    desiredY += moveDirection.y * this.lookAhead.distance;
                }
            }
        }
        
        // Dead zone check
        const currentCenterX = this.x + this.width / 2;
        const currentCenterY = this.y + this.height / 2;
        
        const distanceX = Math.abs(this.targetX - currentCenterX);
        const distanceY = Math.abs(this.targetY - currentCenterY);
        
        // Only move camera if target is outside dead zone
        if (distanceX > this.deadZone || distanceY > this.deadZone) {
            const moveX = (desiredX - this.x) * this.followSpeed * (deltaTime / 1000);
            const moveY = (desiredY - this.y) * this.followSpeed * (deltaTime / 1000);
            
            this.x += moveX;
            this.y += moveY;
        }
    }

    applyBounds() {
        if (this.bounds) {
            this.x = Utils.clamp(this.x, 
                this.bounds.minX - this.boundsPadding, 
                this.bounds.maxX - this.width + this.boundsPadding);
            this.y = Utils.clamp(this.y, 
                this.bounds.minY - this.boundsPadding, 
                this.bounds.maxY - this.height + this.boundsPadding);
        }
    }

    startShake(intensity, duration) {
        this.shake.intensity = Math.max(this.shake.intensity, intensity);
        this.shake.duration = Math.max(this.shake.duration, duration);
        this.shake.time = 0;
    }

    // Utility functions
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Transition to specific position
    transitionTo(x, y, duration = 1000) {
        this.isTransitioning = true;
        this.transitionTime = 0;
        this.transitionDuration = duration;
        this.transitionStartX = this.x;
        this.transitionStartY = this.y;
        this.transitionEndX = x - this.width / 2;
        this.transitionEndY = y - this.height / 2;
    }

    // Set target for camera to follow
    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    // Enable/disable look-ahead
    setLookAhead(enabled, distance = 100, speed = 3) {
        this.lookAhead.enabled = enabled;
        this.lookAhead.distance = distance;
        this.lookAhead.speed = speed;
    }

    setZoom(zoom) {
        this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    }

    zoomIn(amount = 0.1) {
        this.setZoom(this.targetZoom + amount);
    }

    zoomOut(amount = 0.1) {
        this.setZoom(this.targetZoom - amount);
    }

    // Transform world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.x + this.shakeX) * this.zoom,
            y: (worldY - this.y + this.shakeY) * this.zoom
        };
    }

    // Transform screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX / this.zoom) + this.x - this.shakeX,
            y: (screenY / this.zoom) + this.y - this.shakeY
        };
    }

    // Check if a rectangle is visible on screen
    isVisible(x, y, width, height) {
        const margin = 50; // Add margin for objects just off-screen
        
        return !(x + width < this.x - margin ||
                x > this.x + this.width + margin ||
                y + height < this.y - margin ||
                y > this.y + this.height + margin);
    }

    // Get camera bounds for culling
    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    // Apply camera transform to context
    apply(ctx) {
        ctx.save();
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.x + this.shake.offsetX, -this.y + this.shake.offsetY);
    }

    // Restore context after camera transform
    restore(ctx) {
        ctx.restore();
    }

    // Center camera on position immediately (no smoothing)
    centerOn(x, y) {
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.targetX = this.x;
        this.targetY = this.y;
        
        if (this.bounds) {
            this.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX - this.width, this.x));
            this.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY - this.height, this.y));
            this.targetX = this.x;
            this.targetY = this.y;
        }
    }

    // Move camera by offset
    move(dx, dy) {
        this.targetX += dx;
        this.targetY += dy;
    }

    // Get center point of camera view
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    // Resize camera viewport
    resize(width, height) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        this.width = width;
        this.height = height;
        
        // Maintain center position
        this.x = centerX - width / 2;
        this.y = centerY - height / 2;
        this.targetX = this.x;
        this.targetY = this.y;
        
        // Update dead zone
        this.deadZone.x = width * 0.2;
        this.deadZone.y = height * 0.2;
    }

    // Smooth transition to target position
    panTo(x, y, duration = 1000) {
        const startX = this.x;
        const startY = this.y;
        const targetX = x - this.width / 2;
        const targetY = y - this.height / 2;
        
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.x = startX + (targetX - startX) * easeOut;
            this.y = startY + (targetY - startY) * easeOut;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.targetX = this.x;
                this.targetY = this.y;
            }
        };
        
        animate();
    }
}

window.Camera = Camera;