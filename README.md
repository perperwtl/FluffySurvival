# 🏕️ Survival Multiplayer Game

A **Don't Starve Together**-inspired multiplayer survival game built with modern web technologies. Explore, gather resources, craft items, and survive together in a procedurally generated wilderness.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Babylon.js](https://img.shields.io/badge/Babylon.js-7.x-orange.svg)
![Colyseus](https://img.shields.io/badge/Colyseus-0.16.x-purple.svg)

<!-- 
TODO: Add screenshots
![Game Screenshot](docs/images/screenshot.png)
-->

## ✨ Features

### Implemented
- [x] **Real-time Multiplayer** - Seamless synchronization using Colyseus
- [x] **3D Rendering** - Beautiful 2.5D graphics with Babylon.js
- [x] **Camera-Relative Movement** - WASD controls that follow camera orientation
- [x] **Mobile Support** - Touch joystick and action buttons
- [x] **Map System** - JSON-based maps with Tiled editor support
- [x] **Procedural Generation** - Generate random maps with customizable presets
- [x] **Collision System** - Server-authoritative with client prediction
- [x] **Cross-Platform** - Works on desktop and mobile browsers

### Planned
- [ ] Resource gathering (trees, rocks, grass)
- [ ] Inventory system
- [ ] Crafting mechanics
- [ ] Day/night cycle
- [ ] Hunger/health/sanity stats
- [ ] Enemy AI (spiders, hounds)
- [ ] Base building
- [ ] Seasons and weather
- [ ] Save/load game state

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Game Server** | [Colyseus](https://colyseus.io/) 0.16 |
| **3D Engine** | [Babylon.js](https://www.babylonjs.com/) 7.x |
| **Build Tool** | [Vite](https://vitejs.dev/) 6.x |
| **Runtime** | Node.js 18+ |
| **Language** | JavaScript (ES Modules) |
| **Map Editor** | [Tiled](https://www.mapeditor.org/) (optional) |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/survival-multiplayer-game.git
cd survival-multiplayer-game

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running the Game

**Terminal 1 - Start the Server:**
```bash
cd server
npm run dev
```
Server runs on `http://localhost:3000`

**Terminal 2 - Start the Client:**
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173`

**Play:**
Open `http://localhost:5173` in your browser. Open multiple tabs/browsers to test multiplayer!

### Production Build

```bash
# Build client
cd client
npm run build

# Start production server
cd ../server
npm start
```

## 📁 Project Structure

```
survival-multiplayer-game/
├── client/                     # Frontend (Babylon.js + Vite)
│   ├── src/
│   │   ├── engine/            # Game engine & rendering
│   │   │   └── GameEngine.js  # Babylon.js setup, camera, scene
│   │   ├── input/             # Input handling
│   │   │   └── InputManager.js # Keyboard, touch, joystick
│   │   ├── network/           # Server communication
│   │   │   └── NetworkManager.js # Colyseus client
│   │   ├── map/               # Map loading & rendering
│   │   │   └── MapLoader.js   # Client-side map renderer
│   │   └── main.js            # Entry point & game loop
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend (Colyseus)
│   ├── src/
│   │   ├── rooms/             # Game rooms
│   │   │   └── GameRoom.js    # Main game logic
│   │   ├── schema/            # State synchronization
│   │   │   └── GameState.js   # Colyseus schemas
│   │   ├── maps/              # Map handling
│   │   │   └── MapLoader.js   # Server-side map loader
│   │   └── index.js           # Server entry point
│   └── package.json
│
├── shared/                     # Shared between client/server
│   └── maps/                  # Map files
│       ├── MAP_FORMAT.md      # Map JSON schema docs
│       ├── TILED_GUIDE.md     # Tiled editor tutorial
│       ├── ProceduralMapGenerator.js
│       ├── generate-map.js    # CLI map generator
│       ├── forest_clearing.json # Default starting map
│       └── dark_forest.json   # Example generated map
│
├── docs/                       # Documentation
│   └── images/                # Screenshots, diagrams
│
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

## 🎮 Controls

### Desktop
| Key | Action |
|-----|--------|
| `W` / `↑` | Move forward (relative to camera) |
| `S` / `↓` | Move backward |
| `A` / `←` | Move left |
| `D` / `→` | Move right |
| `Space` | Action (interact/attack) |
| `Mouse Drag` | Rotate camera |
| `Scroll Wheel` | Zoom in/out |

### Mobile
| Control | Action |
|---------|--------|
| Left Joystick | Movement |
| Red Button | Action |
| Touch Drag | Rotate camera |
| Pinch | Zoom |

## 🗺️ Creating Maps

### Option 1: Tiled Map Editor (Recommended)

1. Download [Tiled](https://www.mapeditor.org/) (free)
2. Read `shared/maps/TILED_GUIDE.md`
3. Create your map with layers:
   - `objects` - Trees, rocks, bushes
   - `collision` - Hitboxes
   - `spawns` - Player/enemy spawn points
4. Export as JSON to `shared/maps/`

### Option 2: Procedural Generation

```bash
cd shared/maps

# Generate with different presets
node generate-map.js my_forest wilderness    # Balanced
node generate-map.js dense_woods denseForest # Many trees
node generate-map.js rocky_area rockyPlains  # Many rocks
node generate-map.js open_field meadow       # Open grassland

# With custom seed for reproducibility
node generate-map.js test_map wilderness 12345
```

### Option 3: Manual JSON

See `shared/maps/MAP_FORMAT.md` for the schema. Example:

```json
{
  "name": "my_map",
  "width": 100,
  "height": 100,
  "objects": [
    { "type": "tree", "x": 10, "y": 5, "variant": "pine", "health": 10 },
    { "type": "rock", "x": -8, "y": 12, "variant": "boulder", "health": 15 }
  ],
  "collision": [
    { "type": "circle", "x": 10, "y": 5, "radius": 0.8 }
  ],
  "spawns": {
    "player": [{ "x": 0, "y": 0, "radius": 3 }]
  }
}
```

## 🏗️ Architecture

### Client-Server Model

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│     Client      │ ◄─────────────────────────►│     Server      │
│   (Babylon.js)  │                            │   (Colyseus)    │
├─────────────────┤                            ├─────────────────┤
│ • Rendering     │    Movement Input          │ • Game State    │
│ • Input         │ ──────────────────────────►│ • Validation    │
│ • Prediction    │                            │ • Collision     │
│ • Interpolation │    State Updates           │ • AI Logic      │
│                 │ ◄──────────────────────────│ • Map Data      │
└─────────────────┘                            └─────────────────┘
```

### State Synchronization

- **Server-Authoritative**: Server validates all actions
- **Client Prediction**: Immediate local feedback for movement
- **State Interpolation**: Smooth other player movements
- **Delta Compression**: Only changed data is sent

### Camera System

Uses Babylon.js `ArcRotateCamera` with:
- Locked vertical angle (beta) for 2.5D perspective
- Free horizontal rotation (alpha)
- Camera-relative movement using direction vectors

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests (when available): `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Areas Needing Help

| Area | Priority | Difficulty |
|------|----------|------------|
| Inventory UI | High | Medium |
| Crafting System | High | Medium |
| Enemy AI | High | Hard |
| Day/Night Cycle | Medium | Easy |
| Sound Effects | Medium | Easy |
| Animations | Medium | Medium |
| Save System | Low | Hard |
| Unit Tests | Low | Medium |

### Code Style

- ES Modules (`import`/`export`)
- Meaningful variable names
- Comments for complex logic
- Keep functions focused and small

## 🐛 Known Issues

- [ ] Occasional desync on high latency connections
- [ ] Mobile touch controls need refinement
- [ ] No reconnection handling yet
- [ ] Memory leak on long sessions (investigating)

## 📋 Roadmap

### Phase 1: Core Gameplay ← *We are here*
- [x] Multiplayer movement
- [x] Map system
- [ ] Resource gathering
- [ ] Basic inventory

### Phase 2: Survival Mechanics
- [ ] Health, hunger, sanity
- [ ] Crafting system
- [ ] Tool durability
- [ ] Day/night cycle

### Phase 3: World Interaction
- [ ] Enemy AI
- [ ] Combat system
- [ ] Base building
- [ ] Structures

### Phase 4: Polish
- [ ] Sound & music
- [ ] Particle effects
- [ ] Animations
- [ ] UI improvements

### Phase 5: Advanced Features
- [ ] Seasons
- [ ] Boss fights
- [ ] Achievements
- [ ] Persistent worlds

## 📄 API Reference

### Server Events

```javascript
// Client → Server
room.send("move", { x: 0.5, z: -0.3 });  // Normalized direction
room.send("stop", {});                     // Stop moving
room.send("action", {});                   // Interact/attack

// Server → Client (via state sync)
room.state.players.onAdd((player, key) => { });
room.state.players.onChange((player, key) => { });
room.state.players.onRemove((player, key) => { });
```

### Map Object Types

| Type | Properties | Collision |
|------|------------|-----------|
| `tree` | variant, health | Circle r=0.8-1.0 |
| `rock` | variant, health | Circle r=0.4-0.7 |
| `grass` | - | None |
| `berry_bush` | hasBerries | None |
| `sapling` | health | None |

## 🙏 Acknowledgments

- **[Don't Starve](https://www.klei.com/games/dont-starve)** by Klei Entertainment - Inspiration
- **[Babylon.js](https://www.babylonjs.com/)** - Amazing 3D engine
- **[Colyseus](https://colyseus.io/)** - Multiplayer framework
- **[Tiled](https://www.mapeditor.org/)** - Map editor

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by contributors like you
  <br>
  <a href="https://github.com/YOUR_USERNAME/survival-multiplayer-game/issues">Report Bug</a>
  ·
  <a href="https://github.com/YOUR_USERNAME/survival-multiplayer-game/issues">Request Feature</a>
</p>
