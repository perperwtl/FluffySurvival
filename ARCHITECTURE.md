# Architecture Overview

This document describes the technical architecture of the Survival Multiplayer Game.

## Table of Contents

- [System Overview](#system-overview)
- [Client Architecture](#client-architecture)
- [Server Architecture](#server-architecture)
- [Network Protocol](#network-protocol)
- [State Management](#state-management)
- [Map System](#map-system)
- [Collision System](#collision-system)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         GAME CLIENTS                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Browser 1  │  │  Browser 2  │  │  Mobile App │             │
│  │  Babylon.js │  │  Babylon.js │  │  Babylon.js │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          │                                      │
│                    WebSocket                                    │
│                          │                                      │
│         ┌────────────────┴────────────────┐                     │
│         │          GAME SERVER            │                     │
│         │          Colyseus               │                     │
│         │  ┌─────────────────────────┐    │                     │
│         │  │       Game Room         │    │                     │
│         │  │  • State Management     │    │                     │
│         │  │  • Movement Validation  │    │                     │
│         │  │  • Collision Detection  │    │                     │
│         │  │  • Map Loading          │    │                     │
│         │  └─────────────────────────┘    │                     │
│         └─────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Client Architecture

### Module Structure

```
client/src/
├── main.js              # Entry point, game loop
├── engine/
│   └── GameEngine.js    # Babylon.js setup, rendering
├── input/
│   └── InputManager.js  # Keyboard, touch, joystick
├── network/
│   └── NetworkManager.js # Colyseus client
└── map/
    └── MapLoader.js     # Map rendering
```

### GameEngine (Babylon.js)

Responsibilities:
- Scene initialization
- Camera setup (ArcRotateCamera)
- Lighting configuration
- Player mesh management
- Ground and environment rendering

Key Methods:
```javascript
class GameEngine {
  initialize()           // Setup scene, camera, lights
  setupCamera()          // Configure 2.5D camera
  createPlayer(id, data) // Create player mesh
  updatePlayer(id, data) // Update player position
  removePlayer(id)       // Remove player mesh
  getCameraDirections()  // Get movement vectors
}
```

### InputManager

Handles all input sources:
- Keyboard (WASD, Arrow keys, Space)
- Mouse (camera rotation, zoom)
- Touch (joystick, action button)

Movement Flow:
```
User Input → InputManager → Camera-Relative Transform → NetworkManager
```

### NetworkManager (Colyseus Client)

Manages server connection and state synchronization:

```javascript
class NetworkManager {
  connect(url)           // Connect to server
  joinRoom(roomName)     // Join game room
  sendMovement(x, z)     // Send movement input
  sendAction()           // Send action input
  onStateChange(cb)      // Handle state updates
}
```

---

## Server Architecture

### Module Structure

```
server/src/
├── index.js            # Server entry point
├── rooms/
│   └── GameRoom.js     # Main game room logic
├── schema/
│   └── GameState.js    # Colyseus state schemas
└── maps/
    └── MapLoader.js    # Map loading and collision
```

### GameRoom (Colyseus Room)

The central game logic handler:

```javascript
class GameRoom extends Room {
  onCreate(options)      // Room initialization
  onJoin(client)         // Player joins
  onLeave(client)        // Player leaves
  onMessage(client, msg) // Handle client messages
  update(deltaTime)      // Game tick (60 FPS)
}
```

### State Schema

```javascript
class Player extends Schema {
  @type("string") id
  @type("number") x
  @type("number") z
  @type("number") rotation
  @type("number") velocityX
  @type("number") velocityZ
  @type("string") state
}

class GameState extends Schema {
  @type({ map: Player }) players
  @type("string") currentMap
  @type("number") time
}
```

---

## Network Protocol

### Client → Server Messages

| Message | Payload | Description |
|---------|---------|-------------|
| `move` | `{ x: number, z: number }` | Normalized movement direction |
| `stop` | `{}` | Stop moving |
| `action` | `{}` | Perform action |
| `interact` | `{ targetId: string }` | Interact with object |

### Server → Client (State Sync)

Colyseus automatically synchronizes state changes:

```javascript
// Client receives state updates
room.state.players.onAdd((player, key) => {
  // New player joined
});

room.state.players.onChange((player, key) => {
  // Player state updated
});

room.state.players.onRemove((player, key) => {
  // Player left
});
```

### Update Rate

- Server tick rate: 60 FPS (16.67ms)
- State broadcast: Every tick (with delta compression)
- Client render: 60 FPS (requestAnimationFrame)

---

## State Management

### Server-Authoritative Model

```
┌─────────────┐     Input      ┌─────────────┐
│   Client    │ ─────────────► │   Server    │
│             │                │             │
│  Predicted  │   Authority    │  True State │
│    State    │ ◄───────────── │             │
└─────────────┘                └─────────────┘
```

1. **Client sends input** (direction vector)
2. **Client predicts** (immediate feedback)
3. **Server validates** (collision, bounds)
4. **Server broadcasts** (authoritative state)
5. **Client reconciles** (correct if needed)

### Movement Validation

Server-side checks:
- Speed limits
- Collision detection
- Map boundaries
- Anti-cheat (teleport detection)

```javascript
// Server validation
const speed = Math.sqrt(vx * vx + vz * vz);
if (speed > MAX_SPEED * 1.1) {
  // Reject or correct
}
```

---

## Map System

### Map Format

```json
{
  "name": "forest_clearing",
  "width": 100,
  "height": 100,
  "bounds": { "minX": -50, "maxX": 50, "minZ": -50, "maxZ": 50 },
  "objects": [...],
  "collision": [...],
  "spawns": { "player": [...], "enemies": [...] },
  "portals": [...]
}
```

### Loading Flow

```
Server Start
     │
     ▼
MapLoader.loadAllMaps()
     │
     ▼
Parse JSON files in shared/maps/
     │
     ▼
Convert Tiled format (if needed)
     │
     ▼
Build collision grid
     │
     ▼
Maps ready for game rooms
```

### Client Map Loading

```
Join Room
     │
     ▼
Receive currentMap from state
     │
     ▼
Fetch map JSON (or receive embedded)
     │
     ▼
MapLoader.loadMap()
     │
     ▼
Create meshes for all objects
     │
     ▼
Store collision for prediction
```

---

## Collision System

### Collision Types

| Type | Shape | Use Case |
|------|-------|----------|
| Circle | `{ x, y, radius }` | Trees, rocks, players |
| Rectangle | `{ x, y, width, height }` | Walls, buildings |

### Spatial Grid

For efficient collision queries:

```javascript
// Grid cell size: 5 units
// Each cell contains list of colliders

getCellKey(x, z) = `${floor(x/5)},${floor(z/5)}`

// Query nearby cells
getNearbyColliders(x, z, range) {
  // Check 3x3 grid of cells
}
```

### Collision Response

```javascript
// Server movement update
const newX = player.x + vx * deltaTime;
const newZ = player.z + vz * deltaTime;

if (!mapLoader.checkCollision(newX, newZ, PLAYER_RADIUS)) {
  player.x = newX;
  player.z = newZ;
}
// If collision, position unchanged
```

---

## Performance Considerations

### Client-Side
- Object pooling for particles
- LOD for distant objects (future)
- Instanced rendering for repeated objects
- Texture atlases for materials

### Server-Side
- Spatial partitioning for collision
- Delta state compression
- Room-based player grouping
- Efficient schema updates

### Network
- Binary protocol (Colyseus)
- Delta updates only
- Movement prediction
- Interpolation for smooth movement

---

## Future Architecture Plans

### Planned Systems

1. **Inventory System**
   - Item schema
   - Inventory state per player
   - Item interactions

2. **Crafting System**
   - Recipe definitions
   - Crafting validation
   - Resource consumption

3. **AI System**
   - Behavior trees
   - Pathfinding (A*)
   - Spawn management

4. **Persistence**
   - Database integration
   - Save/load game state
   - Player profiles

---

## Diagrams

### Player Movement Sequence

```
Client                    Server
  │                         │
  │  move { x: 0.5, z: 1 }  │
  ├────────────────────────►│
  │                         │
  │  [Predict locally]      │ [Validate]
  │                         │ [Apply if valid]
  │                         │ [Update state]
  │                         │
  │   state.players[id]     │
  │◄────────────────────────┤
  │                         │
  │  [Reconcile position]   │
  │                         │
```

### Game Loop

```
┌──────────────────────────────────────────┐
│              GAME LOOP (60 FPS)          │
├──────────────────────────────────────────┤
│                                          │
│  1. Process Input                        │
│     └─► InputManager.update()            │
│                                          │
│  2. Send to Server                       │
│     └─► NetworkManager.sendMovement()    │
│                                          │
│  3. Update Game State                    │
│     └─► Apply server state               │
│     └─► Interpolate other players        │
│                                          │
│  4. Render                               │
│     └─► scene.render()                   │
│                                          │
│  5. requestAnimationFrame                │
│                                          │
└──────────────────────────────────────────┘
```
