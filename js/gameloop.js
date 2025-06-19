// Game Loop Foundation
const gameLoop = {
    isRunning: false,
    isPaused: false,
    lastTime: 0,
    deltaTime: 0,
    targetFPS: 60,
    frameId: null,
    
    init: function() {
        this.lastTime = performance.now();
    },
    
    start: function() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.lastTime = performance.now();
            this.loop();
        }
    },
    
    stop: function() {
        this.isRunning = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    },
    
    pause: function() {
        this.isPaused = true;
    },
    
    resume: function() {
        if (this.isPaused) {
            this.isPaused = false;
            this.lastTime = performance.now(); // Reset time to avoid large delta
        }
    },
    
    toggle: function() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    },
    
    loop: function(currentTime = performance.now()) {
        if (!this.isRunning) return;
        
        // Calculate delta time in seconds
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent large jumps
        if (this.deltaTime > 1/30) {
            this.deltaTime = 1/30;
        }
        
        if (!this.isPaused) {
            // Update game logic
            this.update(this.deltaTime);
            
            // Render game
            this.render(this.deltaTime);
        }
        
        // Schedule next frame
        this.frameId = requestAnimationFrame((time) => this.loop(time));
    },
    
    update: function(deltaTime) {
        // Call state manager update
        if (typeof stateManager !== 'undefined') {
            stateManager.update(deltaTime);
        }
    },
    
    render: function(deltaTime) {
        // Call state manager render
        if (typeof stateManager !== 'undefined') {
            stateManager.render(deltaTime);
        }
    },
    
    getDeltaTime: function() {
        return this.deltaTime;
    },
    
    getFPS: function() {
        return this.deltaTime > 0 ? Math.round(1 / this.deltaTime) : 0;
    }
};