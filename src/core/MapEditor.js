// src/core/MapEditor.js
// Minimal custom map editor for TDG

import Config from '../config.js';

class MapEditor {
    constructor(game) {
        this.game = game; // reference to Game instance
        this.waypoints = [];
        this.isOpen = false;

        // Container overlay
        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.background = 'rgba(0,0,0,0.9)';
        this.container.style.display = 'none';
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        document.body.appendChild(this.container);
        this.buildLayout();
    }

    buildLayout() {
        const header = document.createElement('h2');
        header.style.color = '#fff';
        header.innerText = 'Map Editor';
        this.container.appendChild(header);

        // Preview canvas – same size as game canvas
        this.preview = document.createElement('canvas');
        this.preview.width = Config.canvas.width;
        this.preview.height = Config.canvas.height;
        this.preview.style.border = '1px solid #fff';
        this.container.appendChild(this.preview);
        this.previewCtx = this.preview.getContext('2d');

        // Buttons area
        const btnArea = document.createElement('div');
        btnArea.style.marginTop = '10px';

        const btnUpload = document.createElement('button');
        btnUpload.innerText = 'Load Map JSON';
        btnUpload.onclick = () => this.uploadFile();
        btnArea.appendChild(btnUpload);

        const btnSave = document.createElement('button');
        btnSave.innerText = 'Save Map to File';
        btnSave.onclick = () => this.saveMap();
        btnArea.appendChild(btnSave);

        const btnClose = document.createElement('button');
        btnClose.innerText = 'Close Editor';
        btnClose.onclick = () => this.close();
        btnArea.appendChild(btnClose);

        this.container.appendChild(btnArea);
    }

    open(defaultWaypoints = []) {
        this.waypoints = [...defaultWaypoints];
        this.game.pathManager.waypoints = [...defaultWaypoints];
        this.isOpen = true;
        this.container.style.display = 'flex';
        this.drawPreview();
        this.enableInteraction();
    }

    close() {
        this.isOpen = false;
        this.container.style.display = 'none';
        this.preview.removeEventListener('click', this.onClick);
    }

    uploadFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = ev => {
                try {
                    const data = JSON.parse(ev.target.result);
                    this.waypoints = data.waypoints || [];
                    this.game.pathManager.waypoints = [...this.waypoints];
                    this.drawPreview();
                } catch (err) {
                    alert('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    saveMap() {
        const map = {
            name: prompt('Map Name', 'Custom Map'),
            description: prompt('Description', ''),
            waypoints: this.waypoints,
            settings: {
                startingLives: this.game.lives,
                startingMoney: this.game.money
            }
        };
        const json = JSON.stringify(map, null, 2);
        const { dialog, app } = require('electron').remote;
        const path = require('path');
        const fs = require('fs');
        const saveDir = path.join(app.getPath('userData'), 'maps');
        if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, {recursive:true});
        dialog.showSaveDialog({
            title: 'Save Map',
            defaultPath: path.join(saveDir, `${map.name}.json`),
            filters: [{ name: 'JSON', extensions: ['json'] }]
        }).then(result => {
            if (!result.canceled) {
                fs.writeFileSync(result.filePath, json, 'utf-8');
                alert('Map saved!');
            }
        });
    }

    drawPreview() {
        const ctx = this.previewCtx;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw path
        ctx.strokeStyle = '#8b7355';
        ctx.lineWidth = 40;
        ctx.beginPath();
        this.waypoints.forEach((wp, i) => {
            ctx[i === 0 ? 'moveTo' : 'lineTo'](wp.x, wp.y);
        });
        ctx.stroke();

        // Draw waypoints
        this.waypoints.forEach(wp => {
            ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.arc(wp.x, wp.y, 6, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    enableInteraction() {
        // --- Drag‑and‑drop mode -------------------------------------
        // Determine index of a waypoint that is clicked on
        this.dragInfo = {moving: false, index: -1, offsetX:0, offsetY:0};
        this.onMouseDown = e => {
            const rect = this.preview.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // left button initiates move if close to a waypoint
            const idx = this.waypoints.findIndex(w => Math.hypot(w.x-x, w.y-y) < 10);
            if (idx !== -1) {
                this.dragInfo = {moving:true, index:idx, offsetX:x-this.waypoints[idx].x, offsetY:y-this.waypoints[idx].y};
                e.preventDefault();
            } else if (e.button === 0) {
                // add a new waypoint
                this.waypoints.push({x, y});
                this.game.pathManager.waypoints = [...this.waypoints];
                this.drawPreview();
            }
        };
        this.onMouseMove = e => {
            if (!this.dragInfo.moving) return;
            const rect = this.preview.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const idx = this.dragInfo.index;
            this.waypoints[idx] = {x: x - this.dragInfo.offsetX, y: y - this.dragInfo.offsetY};
            this.game.pathManager.waypoints = [...this.waypoints];
            this.drawPreview();
        };
        this.onMouseUp = e => {
            this.dragInfo.moving = false;
        };
        this.preview.addEventListener('mousedown', this.onMouseDown);
        this.preview.addEventListener('mousemove', this.onMouseMove);
        this.preview.addEventListener('mouseup', this.onMouseUp);
        this.preview.addEventListener('mouseleave', this.onMouseUp);
        this.preview.addEventListener('contextmenu', ev => ev.preventDefault());
    }
... (rest of file remains unchanged)
    }
}

export default MapEditor;
