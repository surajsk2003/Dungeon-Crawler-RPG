# 🔧 Technical Documentation

## Architecture Overview

The Dungeon Crawler RPG is built using a modular architecture with separate systems for different game aspects:

### Core Systems

```
Game Engine
├── AssetLoader - Manages all game assets
├── AudioManager - Handles music and sound effects
├── InputManager - Processes keyboard, mouse, and touch input
├── Camera - Viewport and visual effects
├── UIManager - User interface and HUD
├── SaveManager - Game state persistence
└── ParticleSystem - Visual effects and animations
```

### Game Objects

```
Game World
├── Player - Character stats, movement, inventory
├── Dungeon - Procedural generation and collision
├── Enemies - AI, pathfinding, combat
├── Items - Equipment, consumables, loot
└── Particles - Visual feedback effects
```

## File Structure

```
/dungeon-crawler/
├── index.html              # Main HTML file
├── css/                    # Stylesheets
│   ├── styles.css          # Core game styles
│   ├── ui.css              # UI component styles
│   └── responsive.css      # Mobile adaptations
├── js/                     # JavaScript modules
│   ├── main.js             # Game initialization
│   ├── game.js             # Core game loop
│   ├── assetLoader.js      # Asset management
│   ├── audio.js            # Audio system
│   ├── input.js            # Input handling
│   ├── camera.js           # Camera system
│   ├── particles.js        # Particle effects
│   ├── player.js           # Player character
│   ├── enemies.js          # Enemy AI
│   ├── items.js            # Item system
│   ├── combat.js           # Combat mechanics
│   ├── dungeon.js          # Procedural generation
│   ├── ui.js               # User interface
│   ├── saves.js            # Save/load system
│   └── utils.js            # Utility functions
├── assets/                 # Game assets
│   ├── sprites/            # Character and object sprites
│   ├── sounds/             # Sound effects
│   ├── music/              # Background music
│   └── ui/                 # UI elements
├── scripts/                # Build and deployment
└── docs/                   # Documentation
```

## Performance Optimization

### Rendering Optimizations

1. **Viewport Culling** - Only render objects visible on screen
2. **Asset Caching** - Preload and cache frequently used sprites
3. **Canvas Optimization** - Disable image smoothing for pixel art
4. **Particle Limiting** - Cap particle count to maintain 60fps

### Memory Management

1. **Object Pooling** - Reuse particle and effect objects
2. **Asset Unloading** - Remove unused textures and audio
3. **Garbage Collection** - Minimize object creation in game loop
4. **Save Compression** - Compress save data for storage efficiency

### Mobile Optimizations

1. **Touch Controls** - Virtual joystick and buttons
2. **Responsive Design** - Scalable UI for different screen sizes
3. **Battery Optimization** - Reduce update frequency when backgrounded
4. **Memory Limits** - Lower asset quality on mobile devices

## Browser Compatibility

### Supported Browsers

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 80+ | Recommended for best performance |
| Firefox | 75+ | Full feature support |
| Safari | 13+ | Limited audio format support |
| Edge | 80+ | Chromium-based, same as Chrome |

### Fallback Features

- **Web Audio API** - Falls back to HTML5 Audio if unavailable
- **Canvas Support** - Required, no fallback available
- **Local Storage** - Save system requires local storage
- **Touch Events** - Desktop mouse events used as fallback

## API Reference

### Game Class

```javascript
class Game {
    constructor()           // Initialize game systems
    init()                 // Async initialization
    setState(state)        // Change game state
    startNewGame()         // Begin new game session
    update(deltaTime)      // Update game logic
    render()              // Render frame
    addEnemy(enemy)       // Add enemy to world
    removeEnemy(enemy)    // Remove enemy from world
    addItem(item)         // Add item to world
    removeItem(item)      // Remove item from world
    addParticle(particle) // Add visual effect
}
```

### Player Class

```javascript
class Player {
    constructor(x, y, assetLoader)
    update(deltaTime, inputManager, dungeon)
    render(ctx)
    setPosition(x, y)     // Move to position
    attack()              // Perform attack
    takeDamage(amount)    // Receive damage
    heal(amount)          // Restore health
    gainExperience(xp)    // Add experience points
    levelUp()             // Level up character
    serialize()           // Convert to save data
}
```

### Dungeon Class

```javascript
class Dungeon {
    constructor(width, height, assetLoader)
    generateLevel(level)   // Create new level
    isWalkable(x, y)      // Check tile collision
    getTile(x, y)         // Get tile type
    render(ctx, camera)   // Draw dungeon
    serialize()           // Convert to save data
}
```

## Build System

### Development Commands

```bash
npm start              # Start development server
npm run build          # Build for production
npm run cleanup        # Remove unused assets
npm run test           # Run performance tests
npm run deploy         # Deploy to GitHub Pages
```

### Build Process

1. **Asset Optimization** - Compress images and audio
2. **Code Minification** - Reduce JavaScript and CSS size
3. **Bundle Creation** - Combine files for faster loading
4. **PWA Generation** - Create service worker and manifest

### Deployment

The game can be deployed to:
- **GitHub Pages** - Free static hosting
- **Netlify** - Continuous deployment
- **Vercel** - Edge network deployment
- **Any web server** - Static file hosting

## Testing

### Performance Testing

```bash
npm run test-performance
```

Analyzes:
- File sizes and loading times
- Memory usage patterns
- Frame rate consistency
- Asset optimization opportunities

### Browser Testing

```bash
npm run test-compatibility
```

Checks:
- JavaScript feature support
- Audio/video codec compatibility
- Touch event handling
- Local storage functionality

## Security Considerations

### Client-Side Security

- **Input Validation** - Sanitize all user inputs
- **Save Data Integrity** - Validate save file structure
- **XSS Prevention** - Escape dynamic content
- **HTTPS Only** - Secure asset loading

### Privacy

- **Local Storage Only** - No server-side data collection
- **No Tracking** - No analytics or user tracking
- **Offline Capable** - Works without internet connection

## Contributing

### Development Setup

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Start development server: `npm start`
5. Make changes and test thoroughly
6. Submit pull request

### Code Style

- Use ES6+ features
- Follow consistent naming conventions
- Add comments for complex logic
- Maintain modular architecture
- Write performance-conscious code

### Testing Requirements

- Test on multiple browsers
- Verify mobile compatibility
- Check performance impact
- Validate save/load functionality
- Ensure accessibility compliance

---

For more information, see the [README.md](README.md) for player documentation.