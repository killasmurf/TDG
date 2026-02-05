/**
 * Input Handler
 * Manages user input for the tower defense game
 */

class InputHandler {
    constructor() {
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Mouse events
        document.addEventListener('mousemove', (e) => {
            this.updateMousePosition(e);
        });

        document.addEventListener('mousedown', (e) => {
            this.updateMousePosition(e);
            this.mouse.isDown = true;
        });

        document.addEventListener('mouseup', (e) => {
            this.mouse.isDown = false;
        });

        // Also track on click to ensure position is updated
        document.addEventListener('click', (e) => {
            this.updateMousePosition(e);
        });
    }

    updateMousePosition(e) {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        } else {
            console.error('[InputHandler] Canvas not found!');
        }
    }

    isKeyPressed(key) {
        return this.keys[key];
    }

    isMousePressed() {
        return this.mouse.isDown;
    }

    getMousePosition() {
        return this.mouse;
    }
}

export default InputHandler;
