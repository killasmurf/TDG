// src/editor/MapEditor.js
export default class MapEditor {
  constructor(canvas, entityManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.entityManager = entityManager;

    // Load existing path or fall back to the default (empty)
    const stored = localStorage.getItem('tdg-path');
    this.waypoints = stored ? JSON.parse(stored) : [];
    this.isDrawing = false;
    this._bind();
  }

  /** Enable the editor – pauses the game loop and starts listening to mouse events */
  enable() {
    this.isDrawing = true;
    this.canvas.style.cursor = 'crosshair';
    this.redraw();         // Show existing path first
    this.startListening();
  }

  /** Disable – stops listening and resumes the game */
  disable() {
    this.isDrawing = false;
    this.canvas.style.cursor = 'default';
    this.stopListening();
    this.redraw();          // Just keep the path drawn
  }

  /** Draw everything (path & waypoints) */
  redraw() {
    this.clear();
    this._drawPath();
    this._drawWaypoints();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  _drawPath() {
    if (this.waypoints.length < 2) return;
    this.ctx.strokeStyle = '#FFF';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.waypoints[0].x, this.waypoints[0].y);
    for (let i = 1; i < this.waypoints.length; i++) {
      this.ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
    }
    this.ctx.stroke();
  }

  _drawWaypoints() {
    this.waypoints.forEach(p => {
      this.ctx.fillStyle = '#0F0';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  /** Save the current path to localStorage and to the EntityManager. */
  save() {
    localStorage.setItem('tdg-path', JSON.stringify(this.waypoints));
    // Tell the manager that the path has changed
    this.entityManager.path = [...this.waypoints];
  }

  // ---- Events ----
  _bind() {
    this.onMouseDown = this._handleMouseDown.bind(this);
    this.onMouseMove = this._handleMouseMove.bind(this);
    this.onMouseUp = this._handleMouseUp.bind(this);
    this.onKey = this._handleKeyPress.bind(this);
  }

  startListening() {
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('keydown', this.onKey);
  }

  stopListening() {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('keydown', this.onKey);
  }

  _handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.waypoints.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    this.redraw();
  }

  _handleMouseMove(e) {
    // Optional: preview the next segment while dragging
    if (!this.isDrawing) return;
    this.redraw();
  }

  _handleMouseUp(e) {
    // Do nothing for now – only click to add waypoints
  }

  _handleKeyPress(e) {
    switch (e.key) {
      case 's': // Save path
        this.save();
        alert('Path saved!');
        break;
      case 'r': // Reset whole path
        this.waypoints = [];
        this.redraw();
        break;
      case 'Escape': // Exit editor
        this.disable();
        document.getElementById('toggle-editor').innerText = 'Edit Map';
        break;
      default:
        break;
    }
  }
}
