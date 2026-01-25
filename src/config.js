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
            projectileSpeed: 5,
            cost: 50,
            color: 'blue'
        },
        sniper: {
            width: 35,
            height: 35,
            damage: 50,
            range: 200,
            fireRate: 2000,
            projectileSpeed: 10,
            cost: 100,
            color: 'darkblue'
        },
        rapid: {
            width: 30,
            height: 30,
            damage: 5,
            range: 80,
            fireRate: 200,
            projectileSpeed: 8,
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
            speed: 2,
            damage: 10,
            reward: 10,
            color: 'red'
        },
        fast: {
            width: 20,
            height: 20,
            health: 50,
            speed: 4,
            damage: 5,
            reward: 15,
            color: 'orange'
        },
        tank: {
            width: 40,
            height: 40,
            health: 300,
            speed: 1,
            damage: 20,
            reward: 30,
            color: 'darkred'
        }
    },

    // Projectile defaults
    projectile: {
        width: 5,
        height: 5,
        speed: 8,
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
        waypointThreshold: 5
    },

    // Audio settings
    audio: {
        masterVolume: 1.0,
        sfxVolume: 0.8,
        musicVolume: 0.5
    }
};

export default Config;
