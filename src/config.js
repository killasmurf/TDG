/**
 * Game Configuration
 * Central configuration for all game constants and settings
 */

const Config = {
    // Canvas settings
    canvas: {
        width: 800,
        height: 600,
        id: 'gameCanvas'
    },

    // Game settings
    game: {
        fps: 60,
        startingLives: 20,
        startingMoney: 100
    },

    // Tower defaults
    tower: {
        basic: {
            width: 40,
            height: 40,
            damage: 10,
            range: 100,
            fireRate: 1000,
            projectileSpeed: 300, // pixels per second
            cost: 50,
            color: 'blue'
        },
        sniper: {
            width: 35,
            height: 35,
            damage: 50,
            range: 200,
            fireRate: 2000,
            projectileSpeed: 500, // pixels per second
            cost: 100,
            color: 'darkblue'
        },
        rapid: {
            width: 30,
            height: 30,
            damage: 5,
            range: 80,
            fireRate: 200,
            projectileSpeed: 400, // pixels per second
            cost: 75,
            color: 'cyan'
        }
    },

    // Enemy defaults
    enemy: {
        basic: {
            width: 30,
            height: 30,
            health: 100,
            speed: 100, // pixels per second
            damage: 10,
            reward: 10,
            color: 'red'
        },
        fast: {
            width: 20,
            height: 20,
            health: 50,
            speed: 150, // pixels per second
            damage: 5,
            reward: 15,
            color: 'orange'
        },
        tank: {
            width: 40,
            height: 40,
            health: 300,
            speed: 60, // pixels per second
            damage: 20,
            reward: 30,
            color: 'darkred'
        }
    },

    // Projectile defaults
    projectile: {
        width: 5,
        height: 5,
        speed: 300, // pixels per second (default, overridden by tower)
        damage: 10, // Default damage, overridden by tower damage
        hitThreshold: 10,
        color: 'yellow'
    },

    // UI settings
    ui: {
        healthBar: {
            height: 5,
            yOffset: 10,
            backgroundColor: 'gray',
            foregroundColor: 'green'
        },
        rangeIndicator: {
            color: 'rgba(0, 0, 255, 0.3)',
            lineWidth: 1
        },
        fontSize: 16,
        fontFamily: 'Arial'
    },

    // Path settings
    path: {
        waypointThreshold: 10 // Distance to waypoint to consider "reached"
    },

    // Audio settings
    audio: {
        masterVolume: 1.0,
        sfxVolume: 0.8,
        musicVolume: 0.5
    }
};

export default Config;
