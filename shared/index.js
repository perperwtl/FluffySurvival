// Shared constants and types for client-server communication

export const GAME_CONFIG = {
  WORLD_SIZE: 50,
  MOVE_SPEED: 5,
  TICK_RATE: 60,
  INTERPOLATION_SPEED: 0.15
};

export const MESSAGE_TYPES = {
  MOVE: 'move',
  STOP: 'stop',
  ACTION: 'action'
};

export const PLAYER_STATES = {
  IDLE: 'idle',
  WALKING: 'walking',
  RUNNING: 'running',
  ACTION: 'action'
};

export const DIRECTIONS = {
  UP: { x: 0, z: -1 },
  DOWN: { x: 0, z: 1 },
  LEFT: { x: -1, z: 0 },
  RIGHT: { x: 1, z: 0 }
};
