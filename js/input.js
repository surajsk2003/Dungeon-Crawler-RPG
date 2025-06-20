class InputManager {
    constructor() {
        this.keys = new Map();
        this.previousKeys = new Map();
        this.mouse = {
            x: 0,
            y: 0,
            leftButton: false,
            rightButton: false,
            middleButton: false,
            wheel: 0
        };
        this.previousMouse = { ...this.mouse };
        
        // Touch support
        this.touches = new Map();
        this.virtualJoystick = null;
        
        // Input mapping
        this.keyBindings = new Map([
            ['KeyW', 'move_up'],
            ['KeyA', 'move_left'], 
            ['KeyS', 'move_down'],
            ['KeyD', 'move_right'],
            ['ArrowUp', 'move_up'],
            ['ArrowLeft', 'move_left'],
            ['ArrowDown', 'move_down'],
            ['ArrowRight', 'move_right'],
            ['Space', 'attack'],
            ['KeyE', 'interact'],
            ['KeyI', 'inventory'],
            ['KeyC', 'character'],
            ['KeyM', 'map'],
            ['Escape', 'menu'],
            ['Enter', 'confirm'],
            ['Digit1', 'hotkey_1'],
            ['Digit2', 'hotkey_2'],
            ['Digit3', 'hotkey_3'],
            ['Digit4', 'hotkey_4']
        ]);
        
        this.setupEventListeners();
        this.detectInputMethod();
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys.set(e.code, true);
            e.preventDefault();
        });

        document.addEventListener('keyup', (e) => {
            this.keys.set(e.code, false);
            e.preventDefault();
        });

        // Mouse events
        document.addEventListener('mousemove', (e) => {
            const rect = game?.canvas?.getBoundingClientRect();
            if (rect) {
                this.mouse.x = (e.clientX - rect.left) * (game.canvas.width / rect.width);
                this.mouse.y = (e.clientY - rect.top) * (game.canvas.height / rect.height);
            }
        });

        document.addEventListener('mousedown', (e) => {
            switch(e.button) {
                case 0: this.mouse.leftButton = true; break;
                case 1: this.mouse.middleButton = true; break;
                case 2: this.mouse.rightButton = true; break;
            }
            e.preventDefault();
        });

        document.addEventListener('mouseup', (e) => {
            switch(e.button) {
                case 0: this.mouse.leftButton = false; break;
                case 1: this.mouse.middleButton = false; break;
                case 2: this.mouse.rightButton = false; break;
            }
            e.preventDefault();
        });

        document.addEventListener('wheel', (e) => {
            this.mouse.wheel = e.deltaY;
            e.preventDefault();
        });

        // Touch events for mobile
        document.addEventListener('touchstart', (e) => {
            Array.from(e.changedTouches).forEach(touch => {
                this.touches.set(touch.identifier, {
                    x: touch.clientX,
                    y: touch.clientY,
                    startX: touch.clientX,
                    startY: touch.clientY,
                    startTime: Date.now()
                });
            });
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            Array.from(e.changedTouches).forEach(touch => {
                if (this.touches.has(touch.identifier)) {
                    const touchData = this.touches.get(touch.identifier);
                    touchData.x = touch.clientX;
                    touchData.y = touch.clientY;
                }
            });
            e.preventDefault();
        });

        document.addEventListener('touchend', (e) => {
            Array.from(e.changedTouches).forEach(touch => {
                this.touches.delete(touch.identifier);
            });
            e.preventDefault();
        });

        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    detectInputMethod() {
        // Detect if device has touch capabilities
        this.hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (this.hasTouch) {
            this.createVirtualControls();
        }
    }

    createVirtualControls() {
        // Create virtual joystick for mobile
        const joystickContainer = document.createElement('div');
        joystickContainer.id = 'virtualJoystick';
        joystickContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 100px;
            height: 100px;
            border: 2px solid #00ff00;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.3);
            z-index: 1000;
        `;

        const joystickKnob = document.createElement('div');
        joystickKnob.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 30px;
            height: 30px;
            background: #00ff00;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: all 0.1s;
        `;

        joystickContainer.appendChild(joystickKnob);
        document.body.appendChild(joystickContainer);

        this.virtualJoystick = {
            container: joystickContainer,
            knob: joystickKnob,
            active: false,
            centerX: 0,
            centerY: 0,
            inputX: 0,
            inputY: 0
        };

        this.setupVirtualJoystick();
        
        // Create action buttons
        this.createActionButtons();
    }

    setupVirtualJoystick() {
        const joystick = this.virtualJoystick;
        
        joystick.container.addEventListener('touchstart', (e) => {
            joystick.active = true;
            const rect = joystick.container.getBoundingClientRect();
            joystick.centerX = rect.left + rect.width / 2;
            joystick.centerY = rect.top + rect.height / 2;
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (!joystick.active) return;
            
            const touch = e.touches[0];
            const dx = touch.clientX - joystick.centerX;
            const dy = touch.clientY - joystick.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 35;
            
            if (distance <= maxDistance) {
                joystick.knob.style.transform = `translate(${dx - 15}px, ${dy - 15}px)`;
                joystick.inputX = dx / maxDistance;
                joystick.inputY = dy / maxDistance;
            } else {
                const angle = Math.atan2(dy, dx);
                const x = Math.cos(angle) * maxDistance;
                const y = Math.sin(angle) * maxDistance;
                joystick.knob.style.transform = `translate(${x - 15}px, ${y - 15}px)`;
                joystick.inputX = Math.cos(angle);
                joystick.inputY = Math.sin(angle);
            }
            
            e.preventDefault();
        });

        document.addEventListener('touchend', () => {
            joystick.active = false;
            joystick.knob.style.transform = 'translate(-50%, -50%)';
            joystick.inputX = 0;
            joystick.inputY = 0;
        });
    }

    createActionButtons() {
        const buttonData = [
            { id: 'attackBtn', text: 'ATK', action: 'attack', bottom: '120px', right: '20px' },
            { id: 'inventoryBtn', text: 'INV', action: 'inventory', bottom: '70px', right: '80px' },
            { id: 'interactBtn', text: 'USE', action: 'interact', bottom: '170px', right: '80px' }
        ];

        buttonData.forEach(btn => {
            const button = document.createElement('div');
            button.id = btn.id;
            button.textContent = btn.text;
            button.style.cssText = `
                position: fixed;
                bottom: ${btn.bottom};
                right: ${btn.right};
                width: 50px;
                height: 50px;
                background: rgba(0, 255, 0, 0.3);
                border: 2px solid #00ff00;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #00ff00;
                font-family: monospace;
                font-weight: bold;
                font-size: 10px;
                z-index: 1000;
                user-select: none;
            `;

            button.addEventListener('touchstart', (e) => {
                this.keys.set(btn.action, true);
                button.style.background = 'rgba(0, 255, 0, 0.6)';
                e.preventDefault();
            });

            button.addEventListener('touchend', (e) => {
                this.keys.set(btn.action, false);
                button.style.background = 'rgba(0, 255, 0, 0.3)';
                e.preventDefault();
            });

            document.body.appendChild(button);
        });
    }

    update() {
        // Store previous state
        this.previousKeys = new Map(this.keys);
        this.previousMouse = { ...this.mouse };
        
        // Process virtual joystick input
        if (this.virtualJoystick && this.virtualJoystick.active) {
            const threshold = 0.3;
            
            if (Math.abs(this.virtualJoystick.inputX) > threshold) {
                this.keys.set('move_left', this.virtualJoystick.inputX < -threshold);
                this.keys.set('move_right', this.virtualJoystick.inputX > threshold);
            }
            
            if (Math.abs(this.virtualJoystick.inputY) > threshold) {
                this.keys.set('move_up', this.virtualJoystick.inputY < -threshold);
                this.keys.set('move_down', this.virtualJoystick.inputY > threshold);
            }
        }
        
        // Reset wheel delta
        this.mouse.wheel = 0;
    }

    isKeyPressed(keyCode) {
        const action = this.keyBindings.get(keyCode) || keyCode;
        return this.keys.get(action) || false;
    }

    isKeyJustPressed(keyCode) {
        const action = this.keyBindings.get(keyCode) || keyCode;
        return (this.keys.get(action) || false) && !(this.previousKeys.get(action) || false);
    }

    isKeyJustReleased(keyCode) {
        const action = this.keyBindings.get(keyCode) || keyCode;
        return !(this.keys.get(action) || false) && (this.previousKeys.get(action) || false);
    }

    isMouseButtonPressed(button) {
        switch(button) {
            case 0: return this.mouse.leftButton;
            case 1: return this.mouse.middleButton;
            case 2: return this.mouse.rightButton;
            default: return false;
        }
    }

    isMouseButtonJustPressed(button) {
        const current = this.isMouseButtonPressed(button);
        const previous = this.previousMouse.leftButton || this.previousMouse.middleButton || this.previousMouse.rightButton;
        return current && !previous;
    }

    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }

    getWorldMousePosition(camera) {
        return {
            x: this.mouse.x + camera.x,
            y: this.mouse.y + camera.y
        };
    }

    setKeyBinding(key, action) {
        this.keyBindings.set(key, action);
    }

    getKeyBinding(action) {
        for (const [key, boundAction] of this.keyBindings) {
            if (boundAction === action) {
                return key;
            }
        }
        return null;
    }
}

window.InputManager = InputManager;