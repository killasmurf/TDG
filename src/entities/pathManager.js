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

    getWaypoints() {
        return this.waypoints;
    }

    createPath() {
        // Return the waypoints as a path for enemies to follow
        return this.waypoints;
    }
}

export default PathManager;
