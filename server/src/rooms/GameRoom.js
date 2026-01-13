import { Room } from '@colyseus/core';
import { GameState, Player, WorldObject } from './GameState.js';

const MOVE_SPEED = 5;
const WORLD_SIZE = 50;
const TICK_RATE = 1000 / 60; // 60 FPS

export class GameRoom extends Room {
  maxClients = 50;

  onCreate(options) {
    console.log('🎮 Game room created!');
    
    this.setState(new GameState());
    this.generateWorld();
    
    // Game loop for physics/state updates
    this.setSimulationInterval(() => this.update(), TICK_RATE);
    
    // Handle player movement input
    this.onMessage('move', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      
      const { dirX, dirZ } = data;
      
      // Normalize direction
      const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
      if (length > 0) {
        player.velocityX = (dirX / length) * MOVE_SPEED;
        player.velocityZ = (dirZ / length) * MOVE_SPEED;
        player.state = 'walking';
        
        // Calculate rotation to face movement direction
        player.rotation = Math.atan2(dirX, dirZ);
      }
    });
    
    this.onMessage('stop', (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      
      player.velocityX = 0;
      player.velocityZ = 0;
      player.state = 'idle';
    });
    
    this.onMessage('action', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      
      player.state = 'action';
      
      // Reset to idle after action animation
      setTimeout(() => {
        if (player.state === 'action') {
          player.state = 'idle';
        }
      }, 500);
    });
  }

  onJoin(client, options) {
    console.log(`👤 Player ${client.sessionId} joined!`);
    
    const player = new Player();
    player.id = client.sessionId;
    player.name = options.name || `Player_${client.sessionId.slice(0, 4)}`;
    
    // Spawn at random position within world bounds
    player.x = (Math.random() - 0.5) * WORLD_SIZE * 0.8;
    player.z = (Math.random() - 0.5) * WORLD_SIZE * 0.8;
    player.y = 0;
    
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client, consented) {
    console.log(`👋 Player ${client.sessionId} left!`);
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log('🗑️ Room disposed');
  }

  update() {
    const deltaTime = TICK_RATE / 1000;
    
    // Update all player positions
    this.state.players.forEach((player) => {
      if (player.velocityX !== 0 || player.velocityZ !== 0) {
        // Apply movement
        player.x += player.velocityX * deltaTime;
        player.z += player.velocityZ * deltaTime;
        
        // Clamp to world bounds
        const halfWorld = WORLD_SIZE / 2;
        player.x = Math.max(-halfWorld, Math.min(halfWorld, player.x));
        player.z = Math.max(-halfWorld, Math.min(halfWorld, player.z));
      }
    });
    
    // Update world time
    this.state.worldTime += deltaTime;
    
    // Day/night cycle (1 game day = 8 minutes real time)
    const dayLength = 480;
    const timeOfDay = this.state.worldTime % dayLength;
    
    if (timeOfDay < dayLength * 0.5) {
      this.state.dayPhase = 'day';
    } else if (timeOfDay < dayLength * 0.625) {
      this.state.dayPhase = 'dusk';
    } else {
      this.state.dayPhase = 'night';
    }
  }

  generateWorld() {
    // Generate trees
    for (let i = 0; i < 30; i++) {
      const tree = new WorldObject();
      tree.id = `tree_${i}`;
      tree.type = 'tree';
      tree.x = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
      tree.z = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
      tree.rotation = Math.random() * Math.PI * 2;
      this.state.worldObjects.set(tree.id, tree);
    }
    
    // Generate rocks
    for (let i = 0; i < 15; i++) {
      const rock = new WorldObject();
      rock.id = `rock_${i}`;
      rock.type = 'rock';
      rock.x = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
      rock.z = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
      rock.rotation = Math.random() * Math.PI * 2;
      this.state.worldObjects.set(rock.id, rock);
    }
    
    // Generate grass tufts
    for (let i = 0; i < 40; i++) {
      const grass = new WorldObject();
      grass.id = `grass_${i}`;
      grass.type = 'grass';
      grass.x = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
      grass.z = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
      grass.rotation = Math.random() * Math.PI * 2;
      this.state.worldObjects.set(grass.id, grass);
    }
    
    // Generate berry bushes
    for (let i = 0; i < 10; i++) {
      const bush = new WorldObject();
      bush.id = `bush_${i}`;
      bush.type = 'berry_bush';
      bush.x = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
      bush.z = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
      bush.rotation = Math.random() * Math.PI * 2;
      this.state.worldObjects.set(bush.id, bush);
    }
    
    console.log(`🌍 Generated world with ${this.state.worldObjects.size} objects`);
  }
}
