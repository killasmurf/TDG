// SpatialGrid.js
// A simple uniform spatial grid for 2D point queries.
// The grid covers the game canvas and allows fetching all enemies within a radius.
// It is intentionally lightweight to avoid additional dependencies.

export default class SpatialGrid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.cells = Array.from({ length: this.cols * this.rows }, () => new Set());
    }

    _col(x) { return Math.floor(Math.max(0, Math.min(this.cols - 1, x / this.cellSize))); }
    _row(y) { return Math.floor(Math.max(0, Math.min(this.rows - 1, y / this.cellSize))); }

    _index(col, row) { return row * this.cols + col; }

    // Add or update an entity's position in the grid
    add(entity) {
        entity._cellIndex = this._calculateCellIndex(entity.x, entity.y);
        this.cells[entity._cellIndex].add(entity);
    }

    remove(entity) {
        if (entity._cellIndex !== undefined) {
            this.cells[entity._cellIndex].delete(entity);
            entity._cellIndex = undefined;
        }
    }

    // Should be called after an entity has moved.
    update(entity) {
        const newIndex = this._calculateCellIndex(entity.x, entity.y);
        if (newIndex !== entity._cellIndex) {
            this.remove(entity);
            entity._cellIndex = newIndex;
            this.cells[newIndex].add(entity);
        }
    }

    _calculateCellIndex(x, y) {
        const col = this._col(x);
        const row = this._row(y);
        return this._index(col, row);
    }

    // Returns an array of entities within a radius of (x,y)
    queryRange(x, y, radius) {
        const minCol = this._col(x - radius);
        const maxCol = this._col(x + radius);
        const minRow = this._row(y - radius);
        const maxRow = this._row(y + radius);
        const result = [];
        for (let col = minCol; col <= maxCol; col++) {
            for (let row = minRow; row <= maxRow; row++) {
                const idx = this._index(col, row);
                for (const entity of this.cells[idx]) {
                    const dx = entity.x - x;
                    const dy = entity.y - y;
                    if (dx * dx + dy * dy <= radius * radius) {
                        result.push(entity);
                    }
                }
            }
        }
        return result;
    }
}
