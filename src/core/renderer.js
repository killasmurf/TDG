/**
 * Renderer
 * Handles drawing of game objects to the canvas
 */
import { GameEvents } from './EventEmitter.js';

class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawSprite(image, x, y, width, height) {
        this.ctx.drawImage(image, x, y, width, height);
    }

    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    drawText(text, x, y, fontSize, color) {
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.fillText(text, x, y);
    }

    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawCircleOutline(x, y, radius, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawLine(x1, y1, x2, y2, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    /**
     * Wave UI rendering helper
     * Adds a method to Renderer that displays the wave progress
     */
    renderWaveInfo(waveNumber, totalWaves, enemiesRemaining, totalEnemies) {
        const text = `Wave ${waveNumber} / ${totalWaves} - Enemies: ${enemiesRemaining} / ${totalEnemies}`;
        this.drawText(text, 10, 20, 16, '#fff');
    }
}

export default Renderer;
