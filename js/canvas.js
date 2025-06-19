// HTML5 Canvas Setup
const canvas = {
    element: null,
    ctx: null,
    width: 800,
    height: 600,
    scale: 1,
    
    init: function() {
        this.element = document.getElementById('gameCanvas');
        this.ctx = this.element.getContext('2d');
        
        this.setupResponsive();
        this.setupViewportScaling();
        this.setupInputListeners();
        
        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();
    },
    
    setupResponsive: function() {
        // Set canvas to fill container
        const container = this.element.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.element.width = this.width;
        this.element.height = this.height;
        
        // CSS will handle visual scaling
        this.element.style.width = '100%';
        this.element.style.height = '100%';
    },
    
    setupViewportScaling: function() {
        // Calculate scale based on container size
        const container = this.element.parentElement;
        const rect = container.getBoundingClientRect();
        
        const scaleX = rect.width / this.width;
        const scaleY = rect.height / this.height;
        this.scale = Math.min(scaleX, scaleY);
        
        // Apply scaling to context
        this.ctx.imageSmoothingEnabled = false; // Pixel-perfect scaling
    },
    
    setupInputListeners: function() {
        // Mouse events
        this.element.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.element.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.element.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Touch events for mobile
        this.element.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.element.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.element.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        
        // Keyboard events (global)
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Prevent context menu
        this.element.addEventListener('contextmenu', (e) => e.preventDefault());
    },
    
    handleResize: function() {
        const container = this.element.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Update scale
        const scaleX = rect.width / this.width;
        const scaleY = rect.height / this.height;
        this.scale = Math.min(scaleX, scaleY);
        
        // Maintain aspect ratio
        const scaledWidth = this.width * this.scale;
        const scaledHeight = this.height * this.scale;
        
        this.element.style.width = scaledWidth + 'px';
        this.element.style.height = scaledHeight + 'px';
    },
    
    getMousePos: function(e) {
        const rect = this.element.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / this.scale,
            y: (e.clientY - rect.top) / this.scale
        };
    },
    
    getTouchPos: function(e) {
        const rect = this.element.getBoundingClientRect();
        const touch = e.touches[0] || e.changedTouches[0];
        return {
            x: (touch.clientX - rect.left) / this.scale,
            y: (touch.clientY - rect.top) / this.scale
        };
    },
    
    // Input event handlers
    handleMouseDown: function(e) {
        const pos = this.getMousePos(e);
        if (typeof game !== 'undefined' && game.handleMouseDown) {
            game.handleMouseDown(pos.x, pos.y, e.button);
        }
    },
    
    handleMouseUp: function(e) {
        const pos = this.getMousePos(e);
        if (typeof game !== 'undefined' && game.handleMouseUp) {
            game.handleMouseUp(pos.x, pos.y, e.button);
        }
    },
    
    handleMouseMove: function(e) {
        const pos = this.getMousePos(e);
        if (typeof game !== 'undefined' && game.handleMouseMove) {
            game.handleMouseMove(pos.x, pos.y);
        }
    },
    
    handleTouchStart: function(e) {
        e.preventDefault();
        const pos = this.getTouchPos(e);
        if (typeof game !== 'undefined' && game.handleTouchStart) {
            game.handleTouchStart(pos.x, pos.y);
        }
    },
    
    handleTouchEnd: function(e) {
        e.preventDefault();
        const pos = this.getTouchPos(e);
        if (typeof game !== 'undefined' && game.handleTouchEnd) {
            game.handleTouchEnd(pos.x, pos.y);
        }
    },
    
    handleTouchMove: function(e) {
        e.preventDefault();
        const pos = this.getTouchPos(e);
        if (typeof game !== 'undefined' && game.handleTouchMove) {
            game.handleTouchMove(pos.x, pos.y);
        }
    },
    
    handleKeyDown: function(e) {
        if (typeof stateManager !== 'undefined') {
            stateManager.handleInput(e.key, 'keydown');
        }
    },
    
    handleKeyUp: function(e) {
        if (typeof stateManager !== 'undefined') {
            stateManager.handleInput(e.key, 'keyup');
        }
    }
};