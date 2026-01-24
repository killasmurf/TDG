# Tower Defense Game

A cross-platform tower defense game built for Windows, Android tablets, and Android phones.

## Project Structure

```
tower-defense-game/
├── src/
│   ├── core/           # Core game systems
│   │   ├── game.js     # Main game loop and logic
│   │   ├── input.js    # Input handling system
│   │   ├── renderer.js # Rendering system
│   │   └── audio.js    # Audio management
│   ├── game/           # Game-specific logic
│   │   └── level.js    # Level management
│   ├── entities/       # Game entities
│   │   └── projectile.js # Projectile system
│   ├── towers/         # Tower types
│   │   └── tower.js    # Base tower class
│   ├── enemies/        # Enemy types
│   │   └── enemy.js    # Base enemy class
│   ├── ui/             # User interface
│   ├── audio/          # Audio assets and managers
│   └── utils/          # Utility functions
├── assets/
│   ├── sprites/        # Game sprites
│   ├── sounds/         # Sound effects
│   ├── music/          # Background music
│   ├── fonts/          # Typography assets
│   └── levels/         # Level design files
├── docs/               # Documentation
├── tests/              # Test files
└── third-party/        # Third-party libraries
```

## Features

- Cross-platform support (Windows, Android tablets, Android phones)
- Tower placement and upgrading system
- Enemy waves with different behaviors
- Projectile mechanics
- Audio system
- Level management
- User interface components

## Development

### Getting Started

1. Clone the repository
2. Install dependencies
3. Run the game

### Code Structure

The game follows a modular structure with clear separation of concerns:
- **Core systems** handle rendering, input, and audio
- **Game logic** manages levels, towers, and enemies
- **Assets** contain all visual and audio resources
- **UI** components handle user interaction
- **Utils** contain helper functions and common utilities

## Contributing

This is a placeholder for contribution guidelines.
