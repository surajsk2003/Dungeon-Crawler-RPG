class InputManager {
    constructor() {
        this.keys = new Map();
        this.mouse = { x: 0, y: 0, buttons: new Set() };
        this.touch = { active: false, x: 0, y: 0 };
        this.keyBindings = new Map();
        
        this.setupDefaultBindings();
        this.setupEventListeners();
    }

    setupDefaultBindings() {
        // Movement
        this.keyBindings.set('KeyW', 'move_up');
        this.keyBindings.set('KeyA', 'move_left');
        this.keyBindings.set('KeyS', 'move_down');
        this.keyBindings.set('KeyD', 'move_right');
        this.keyBindings.set('ArrowUp', 'move_up');
        this.keyBindings.set('ArrowLeft', 'move_left');
        this.keyBindings.set('ArrowDown', 'move_down');
        this.keyBindings.set('ArrowRight', 'move_right');
        
        // Actions
        this.keyBindings.set('Space', 'attack');
        this.keyBindings.set('KeyE', 'interact');
        
        // UI
        this.keyBindings.set('KeyI', 'inventory');
        this.keyBindings.set('KeyC', 'character');
        this.keyBindings.set('Escape', 'menu');
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys.set(e.code, true);
        });

        document.addEventListener('keyup', (e) => {
            this.keys.set(e.code, false);
        });

        // Mouse events
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        document.addEventListener('mousedown', (e) => {
            this.mouse.buttons.add(e.button);
        });

        document.addEventListener('mouseup', (e) => {
            this.mouse.buttons.delete(e.button);
        });

        // Touch events for mobile
        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touch.active = true;
            this.touch.x = touch.clientX;
            this.touch.y = touch.clientY;
        });

        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.touch.active) {
                const touch = e.touches[0];
                this.touch.x = touch.clientX;
                this.touch.y = touch.clientY;
            }
        });

        document.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touch.active = false;
        });
    }

    isKeyPressed(action) {
        for (const [key, boundAction] of this.keyBindings) {
            if (boundAction === action && this.keys.get(key)) {
                return true;
            }
        }
        return false;
    }

    isKeyDown(keyCode) {
        return this.keys.get(keyCode) || false;
    }

    isMouseButtonPressed(button) {
        return this.mouse.buttons.has(button);
    }

    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }

    getTouchPosition() {
        return { x: this.touch.x, y: this.touch.y, active: this.touch.active };
    }

    setKeyBinding(key, action) {
        this.keyBindings.set(key, action);
    }

    update() {
        // Update input state if needed
    }
}

window.InputManager = InputManager;