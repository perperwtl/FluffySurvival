import { Client } from 'colyseus.js';

export class NetworkManager {
  constructor() {
    this.client = null;
    this.room = null;
    this.connected = false;
    this.trackedPlayers = new Set();
    this.trackedObjects = new Set();
    
    // Callbacks
    this.onConnect = null;
    this.onDisconnect = null;
    this.onPlayerJoin = null;
    this.onPlayerLeave = null;
    this.onPlayerUpdate = null;
    this.onWorldObjectAdd = null;
    this.onStateChange = null;
  }

  async connect() {
    // Determine WebSocket URL based on how the page was accessed
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.hostname;
    
    // If accessing via Vite dev server (port 5173), connect to game server on port 3000
    // Otherwise, assume same port (for production where server serves client)
    let port;
    if (window.location.port === '5173' || window.location.port === '') {
      port = 3000;
    } else {
      port = window.location.port;
    }
    
    const wsUrl = `${protocol}://${host}:${port}`;
    
    console.log('🔌 Connecting to:', wsUrl);
    console.log('   Protocol:', protocol);
    console.log('   Host:', host);
    console.log('   Port:', port);
    console.log('   User Agent:', navigator.userAgent);
    
    this.client = new Client(wsUrl);
    
    try {
      console.log('📡 Attempting to join room...');
      
      // Join or create the game room
      this.room = await this.client.joinOrCreate('game', {
        name: `Player_${Math.random().toString(36).slice(2, 6)}`
      });
      
      console.log('✅ Joined room:', this.room.id);
      console.log('   Session ID:', this.room.sessionId);
      this.connected = true;
      
      // Notify connection
      if (this.onConnect) {
        this.onConnect(this.room.sessionId);
      }
      
      // Setup state listeners
      this.setupStateListeners();
      
      return this.room;
      
    } catch (error) {
      console.error('❌ Failed to connect:', error);
      console.error('   Error name:', error.name);
      console.error('   Error message:', error.message);
      console.error('   Attempted URL:', wsUrl);
      this.connected = false;
      throw error;
    }
  }

  setupStateListeners() {
    console.log('📡 Setting up state listeners...');
    
    // Use onStateChange to track all state changes
    // This works reliably in Colyseus 0.16
    this.room.onStateChange((state) => {
      this.processState(state);
    });
    
    // Handle disconnection
    this.room.onLeave((code) => {
      console.log('🚪 Left room with code:', code);
      this.connected = false;
      
      if (this.onDisconnect) {
        this.onDisconnect();
      }
    });
    
    // Handle errors
    this.room.onError((code, message) => {
      console.error('❌ Room error:', code, message);
    });
  }
  
  processState(state) {
    // Process players - detect additions and removals
    const currentPlayerIds = new Set();
    
    // Iterate through players (state.players is a Map-like object)
    state.players.forEach((player, sessionId) => {
      currentPlayerIds.add(sessionId);
      
      // Check if this is a new player
      if (!this.trackedPlayers.has(sessionId)) {
        this.trackedPlayers.add(sessionId);
        console.log('👤 Player joined:', sessionId);
        
        if (this.onPlayerJoin) {
          this.onPlayerJoin(sessionId, {
            id: player.id,
            name: player.name,
            x: player.x,
            y: player.y,
            z: player.z,
            rotation: player.rotation,
            state: player.state,
            health: player.health,
            hunger: player.hunger,
            sanity: player.sanity
          });
        }
      }
      
      // Always send updates for position, state, etc.
      if (this.onPlayerUpdate) {
        this.onPlayerUpdate(sessionId, {
          x: player.x,
          y: player.y,
          z: player.z,
          rotation: player.rotation,
          state: player.state,
          health: player.health,
          hunger: player.hunger,
          sanity: player.sanity
        });
      }
    });
    
    // Detect removed players
    for (const sessionId of this.trackedPlayers) {
      if (!currentPlayerIds.has(sessionId)) {
        this.trackedPlayers.delete(sessionId);
        console.log('👋 Player left:', sessionId);
        
        if (this.onPlayerLeave) {
          this.onPlayerLeave(sessionId);
        }
      }
    }
    
    // Process world objects
    state.worldObjects.forEach((obj, id) => {
      if (!this.trackedObjects.has(id)) {
        this.trackedObjects.add(id);
        
        if (this.onWorldObjectAdd) {
          this.onWorldObjectAdd(id, {
            id: obj.id,
            type: obj.type,
            x: obj.x,
            y: obj.y,
            z: obj.z,
            rotation: obj.rotation
          });
        }
      }
    });
    
    // Notify state change for day/night cycle
    if (this.onStateChange) {
      this.onStateChange({
        worldTime: state.worldTime,
        dayPhase: state.dayPhase
      });
    }
  }

  sendMove(dirX, dirZ) {
    if (!this.room) return;
    this.room.send('move', { dirX, dirZ });
  }

  sendStop() {
    if (!this.room) return;
    this.room.send('stop');
  }

  sendAction() {
    if (!this.room) return;
    this.room.send('action');
  }

  isConnected() {
    return this.connected && this.room;
  }

  disconnect() {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
    this.connected = false;
  }
}
