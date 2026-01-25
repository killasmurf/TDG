/**
 * Path Manager
 * Handles enemy path management for the tower defense game
 */

class PathManager {
    constructor() {
        this.waypoints = [];
    }

    addWaypoint(x, y) {
        this.waypoints.push({ x, y });
    }

    removeWaypoint(index) {
        if (index >= 0 && index < this.waypoints.length) {
            this.waypoints.splice(index, 1);
        }
    }

    clearWaypoints() {
        this.waypoints = [];
    }

    getWaypoints() {
        return this.waypoints;
    }

    getWaypoint(index) {
        if (index >= 0 && index < this.waypoints.length) {
            return this.waypoints[index];
        }
        return null;
    }

    getWaypointCount() {
        return this.waypoints.length;
    }

    createPath() {
        // Return the waypoints as a path for enemies to follow
        return [...this.waypoints];
    }

    /**
     * Calculate the total length of the path
     * @returns {number}
     */
    getPathLength() {
        if (this.waypoints.length < 2) return 0;

        let totalLength = 0;

        for (let i = 0; i < this.waypoints.length - 1; i++) {
            const dx = this.waypoints[i + 1].x - this.waypoints[i].x;
            const dy = this.waypoints[i + 1].y - this.waypoints[i].y;
            totalLength += Math.sqrt(dx * dx + dy * dy);
        }

        return totalLength;
    }

    /**
     * Get a point along the path at a specific progress (0-1)
     * @param {number} progress - Progress along the path (0 = start, 1 = end)
     * @returns {{x: number, y: number}}
     */
    getPointAtProgress(progress) {
        if (this.waypoints.length === 0) return { x: 0, y: 0 };
        if (this.waypoints.length === 1) return { ...this.waypoints[0] };

        const totalLength = this.getPathLength();
        let targetDistance = progress * totalLength;
        let currentDistance = 0;

        for (let i = 0; i < this.waypoints.length - 1; i++) {
            const dx = this.waypoints[i + 1].x - this.waypoints[i].x;
            const dy = this.waypoints[i + 1].y - this.waypoints[i].y;
            const segmentLength = Math.sqrt(dx * dx + dy * dy);

            if (currentDistance + segmentLength >= targetDistance) {
                // Target is within this segment
                const segmentProgress = (targetDistance - currentDistance) / segmentLength;
                return {
                    x: this.waypoints[i].x + dx * segmentProgress,
                    y: this.waypoints[i].y + dy * segmentProgress
                };
            }

            currentDistance += segmentLength;
        }

        // Return last waypoint if progress >= 1
        return { ...this.waypoints[this.waypoints.length - 1] };
    }

    /**
     * Get the minimum distance from a point to the path
     * @param {number} px
     * @param {number} py
     * @returns {number}
     */
    getDistanceToPath(px, py) {
        if (this.waypoints.length < 2) {
            if (this.waypoints.length === 1) {
                const dx = px - this.waypoints[0].x;
                const dy = py - this.waypoints[0].y;
                return Math.sqrt(dx * dx + dy * dy);
            }
            return Infinity;
        }

        let minDistance = Infinity;

        for (let i = 0; i < this.waypoints.length - 1; i++) {
            const dist = this.pointToLineDistance(
                px, py,
                this.waypoints[i].x, this.waypoints[i].y,
                this.waypoints[i + 1].x, this.waypoints[i + 1].y
            );
            minDistance = Math.min(minDistance, dist);
        }

        return minDistance;
    }

    /**
     * Calculate distance from a point to a line segment
     * @private
     */
    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Check if a point is too close to the path
     * @param {number} px
     * @param {number} py
     * @param {number} threshold
     * @returns {boolean}
     */
    isNearPath(px, py, threshold = 50) {
        return this.getDistanceToPath(px, py) < threshold;
    }

    /**
     * Get the starting point of the path
     * @returns {{x: number, y: number}|null}
     */
    getStart() {
        return this.waypoints.length > 0 ? { ...this.waypoints[0] } : null;
    }

    /**
     * Get the ending point of the path
     * @returns {{x: number, y: number}|null}
     */
    getEnd() {
        return this.waypoints.length > 0
            ? { ...this.waypoints[this.waypoints.length - 1] }
            : null;
    }
}

export default PathManager;
