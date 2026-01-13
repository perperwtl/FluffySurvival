import { Schema, MapSchema, defineTypes } from '@colyseus/schema';

export class Vector3 extends Schema {
  constructor() {
    super();
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }
}
defineTypes(Vector3, {
  x: 'number',
  y: 'number',
  z: 'number'
});

export class Player extends Schema {
  constructor() {
    super();
    this.id = '';
    this.name = '';
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.rotation = 0;
    this.state = 'idle';
    this.velocityX = 0;
    this.velocityZ = 0;
    this.health = 100;
    this.hunger = 100;
    this.sanity = 100;
  }
}
defineTypes(Player, {
  id: 'string',
  name: 'string',
  x: 'number',
  y: 'number',
  z: 'number',
  rotation: 'number',
  state: 'string',
  velocityX: 'number',
  velocityZ: 'number',
  health: 'number',
  hunger: 'number',
  sanity: 'number'
});

export class WorldObject extends Schema {
  constructor() {
    super();
    this.id = '';
    this.type = '';
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.rotation = 0;
    this.interactable = true;
  }
}
defineTypes(WorldObject, {
  id: 'string',
  type: 'string',
  x: 'number',
  y: 'number',
  z: 'number',
  rotation: 'number',
  interactable: 'boolean'
});

export class GameState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.worldObjects = new MapSchema();
    this.worldTime = 0;
    this.dayPhase = 'day';
  }
}
defineTypes(GameState, {
  players: { map: Player },
  worldObjects: { map: WorldObject },
  worldTime: 'number',
  dayPhase: 'string'
});
