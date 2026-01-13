import { GameEngine } from './engine/GameEngine.js';
import { NetworkManager } from './network/NetworkManager.js';
import { InputManager } from './input/InputManager.js';
import { UIManager } from './ui/UIManager.js';

class Game {
  constructor() {
    this.engine = null;
    this.network = null;
    this.input = null;
    this.ui = null;
    this.localPlayerId = null;
    this.players = new Map();
    this.worldObjects = new Map();
  }

  async init(updateStatus) {
    updateStatus('Checking device capabilities...');
    
    // Check WebGL support early
    const canvas = document.getElementById('gameCanvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      throw new Error('WebGL not supported. Please use a modern browser.');
    }
    
    updateStatus('Initializing graphics...');
    
    // Initialize UI manager
    this.ui = new UIManager();
    
    // Initialize game engine (Babylon.js)
    this.engine = new GameEngine(canvas);
    await this.engine.init();
    
    updateStatus('Setting up controls...');
    
    // Initialize input manager
    this.input = new InputManager();
    this.input.onMove = (dirX, dirZ) => this.handleMove(dirX, dirZ);
    this.input.onStop = () => this.handleStop();
    this.input.onAction = () => this.handleAction();
    
    updateStatus('Connecting to server...');
    
    // Initialize network manager (Colyseus)
    this.network = new NetworkManager();
    this.network.onConnect = (playerId) => this.handleConnect(playerId);
    this.network.onDisconnect = () => this.handleDisconnect();
    this.network.onPlayerJoin = (id, player) => this.handlePlayerJoin(id, player);
    this.network.onPlayerLeave = (id) => this.handlePlayerLeave(id);
    this.network.onPlayerUpdate = (id, changes) => this.handlePlayerUpdate(id, changes);
    this.network.onWorldObjectAdd = (id, obj) => this.handleWorldObjectAdd(id, obj);
    this.network.onStateChange = (state) => this.handleStateChange(state);
    
    // Connect to server with timeout
    const connectPromise = this.network.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout (10s) - is the server running?')), 10000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    updateStatus('Loading world...');
    
    // Small delay to ensure initial state is received
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Start render loop
    this.engine.startRenderLoop();
    
    console.log('🎮 Game initialized successfully!');
  }

  handleConnect(playerId) {
    console.log('✅ Connected with ID:', playerId);
    this.localPlayerId = playerId;
    this.ui.setConnected(true);
  }

  handleDisconnect() {
    console.log('❌ Disconnected from server');
    this.ui.setConnected(false);
  }

  handlePlayerJoin(id, playerData) {
    console.log('👤 Player joined:', id);
    
    const isLocal = id === this.localPlayerId;
    const playerMesh = this.engine.createPlayer(id, isLocal);
    
    // Set initial position
    playerMesh.position.x = playerData.x;
    playerMesh.position.z = playerData.z;
    
    this.players.set(id, {
      mesh: playerMesh,
      data: playerData,
      targetX: playerData.x,
      targetZ: playerData.z,
      isLocal
    });
    
    // Update camera to follow local player
    if (isLocal) {
      this.engine.setCameraTarget(playerMesh);
    }
    
    this.ui.setPlayerCount(this.players.size);
  }

  handlePlayerLeave(id) {
    console.log('👋 Player left:', id);
    
    const player = this.players.get(id);
    if (player) {
      this.engine.removePlayer(player.mesh);
      this.players.delete(id);
    }
    
    this.ui.setPlayerCount(this.players.size);
  }

  handlePlayerUpdate(id, changes) {
    const player = this.players.get(id);
    if (!player) return;
    
    // Update target position for interpolation
    if (changes.x !== undefined) player.targetX = changes.x;
    if (changes.z !== undefined) player.targetZ = changes.z;
    if (changes.state !== undefined) {
      player.data.state = changes.state;
      this.engine.setPlayerState(player.mesh, changes.state);
    }
    if (changes.rotation !== undefined) {
      player.data.rotation = changes.rotation;
    }
    
    // Update local player stats
    if (player.isLocal) {
      if (changes.health !== undefined) this.ui.setHealth(changes.health);
      if (changes.hunger !== undefined) this.ui.setHunger(changes.hunger);
      if (changes.sanity !== undefined) this.ui.setSanity(changes.sanity);
    }
  }

  handleWorldObjectAdd(id, objData) {
    const mesh = this.engine.createWorldObject(id, objData.type, objData.x, objData.z, objData.rotation);
    this.worldObjects.set(id, { mesh, data: objData });
  }

  handleStateChange(state) {
    this.ui.setDayPhase(state.dayPhase);
    this.engine.setDayPhase(state.dayPhase);
  }

  handleMove(dirX, dirZ) {
    if (!this.network.isConnected()) return;
    // Input already transformed by InputManager based on camera angle
    this.network.sendMove(dirX, dirZ);
  }

  handleStop() {
    if (!this.network.isConnected()) return;
    this.network.sendStop();
  }

  handleAction() {
    if (!this.network.isConnected()) return;
    this.network.sendAction();
    
    // Instant local feedback for action
    const localPlayer = this.players.get(this.localPlayerId);
    if (localPlayer) {
      this.engine.setPlayerState(localPlayer.mesh, 'action');
    }
  }

  update(deltaTime) {
    // Sync camera directions with input manager for camera-relative movement
    if (this.input && this.engine) {
      const dirs = this.engine.getCameraDirections();
      this.input.setCameraDirections(dirs.forwardX, dirs.forwardZ, dirs.rightX, dirs.rightZ);
    }
    
    // Interpolate player positions for smooth movement
    const interpolationSpeed = 0.15;
    
    this.players.forEach((player) => {
      // Smooth position interpolation
      player.mesh.position.x += (player.targetX - player.mesh.position.x) * interpolationSpeed;
      player.mesh.position.z += (player.targetZ - player.mesh.position.z) * interpolationSpeed;
    });
  }
}

// Start the game when DOM is ready
window.addEventListener('DOMContentLoaded', async () => {
  const game = new Game();
  const loadingEl = document.getElementById('loading');
  
  // Helper to update loading status
  const updateStatus = (message) => {
    console.log('📋 ' + message);
    const statusP = loadingEl.querySelector('p');
    if (statusP) statusP.textContent = message;
  };
  
  try {
    await game.init(updateStatus);
    
    // Hide loading screen
    loadingEl.classList.add('hidden');
    
    // Game update loop (separate from render loop)
    let lastTime = performance.now();
    const gameLoop = () => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      game.update(deltaTime);
      requestAnimationFrame(gameLoop);
    };
    gameLoop();
    
  } catch (error) {
    console.error('Failed to initialize game:', error);
    const errorMessage = error.message || 'Unknown error';
    
    loadingEl.innerHTML = `
      <h1 style="font-size: 32px;">⚠️ Error</h1>
      <p style="margin-top: 20px; color: #f44336; max-width: 320px; word-wrap: break-word; padding: 0 20px;">
        ${errorMessage}
      </p>
      <p style="margin-top: 15px; color: #888; font-size: 12px;">
        Open browser console for details
      </p>
      <button onclick="location.reload()" style="
        margin-top: 25px; 
        padding: 14px 28px; 
        cursor: pointer; 
        border: none; 
        background: #4CAF50; 
        color: white; 
        border-radius: 6px; 
        font-size: 16px;
        touch-action: manipulation;
      ">
        Retry
      </button>
    `;
  }
});
