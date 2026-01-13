import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  Vector3,
  Color3,
  Color4,
  MeshBuilder,
  StandardMaterial,
  DynamicTexture,
  ShadowGenerator,
  Mesh,
  VertexData,
  Animation,
  TransformNode
} from '@babylonjs/core';

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.engine = null;
    this.scene = null;
    this.camera = null;
    this.shadowGenerator = null;
    this.playerMeshes = new Map();
    this.worldObjectMeshes = new Map();
    this.dayPhase = 'day';
  }

  async init() {
    console.log('🎮 Initializing Babylon.js engine...');
    
    // Check WebGL support
    if (!this.canvas.getContext('webgl') && !this.canvas.getContext('webgl2')) {
      throw new Error('WebGL is not supported on this device');
    }
    
    // Create Babylon engine with mobile-friendly settings
    this.engine = new Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
      doNotHandleContextLost: false,
      // Mobile-friendly settings
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false
    });
    
    // Handle window resize and orientation change
    const handleResize = () => {
      this.engine.resize();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100);
    });
    
    // Initial resize for mobile
    this.engine.resize();
    
    // Create scene
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.4, 0.6, 0.3, 1);
    
    // Optimize for mobile
    this.scene.autoClear = true;
    this.scene.autoClearDepthAndStencil = true;
    
    // Setup camera (isometric-like view)
    this.setupCamera();
    
    // Setup lighting
    this.setupLighting();
    
    // Create ground
    this.createGround();
    
    console.log('✅ Babylon.js engine initialized');
    return this;
  }

  setupCamera() {
    // ArcRotateCamera for isometric-like view
    this.camera = new ArcRotateCamera(
      'camera',
      Math.PI / 4,      // Alpha (rotation around Y) - initial horizontal angle
      Math.PI / 3,      // Beta (angle from top) - fixed vertical angle
      30,               // Radius (distance from target)
      Vector3.Zero(),
      this.scene
    );
    
    // Lock vertical angle (beta) - only allow horizontal rotation for 2.5D style
    this.camera.lowerBetaLimit = Math.PI / 3;  // Lock to same value
    this.camera.upperBetaLimit = Math.PI / 3;  // Lock to same value
    
    // Allow zoom in/out
    this.camera.lowerRadiusLimit = 15;
    this.camera.upperRadiusLimit = 50;
    
    // Enable camera controls (only horizontal rotation and zoom will work now)
    this.camera.attachControl(this.canvas, true);
    
    // Disable panning
    this.camera.panningSensibility = 0;
  }

  setupLighting() {
    // Ambient hemisphere light
    const hemiLight = new HemisphericLight(
      'hemiLight',
      new Vector3(0, 1, 0),
      this.scene
    );
    hemiLight.intensity = 0.6;
    hemiLight.diffuse = new Color3(1, 0.95, 0.8);
    hemiLight.groundColor = new Color3(0.3, 0.3, 0.4);
    
    // Main directional light for shadows
    this.sunLight = new DirectionalLight(
      'sunLight',
      new Vector3(-1, -2, -1),
      this.scene
    );
    this.sunLight.intensity = 0.8;
    this.sunLight.diffuse = new Color3(1, 0.9, 0.7);
    
    // Shadow generator
    this.shadowGenerator = new ShadowGenerator(1024, this.sunLight);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 32;
    this.shadowGenerator.darkness = 0.4;
  }

  createGround() {
    // Main ground plane
    const ground = MeshBuilder.CreateGround('ground', {
      width: 100,
      height: 100,
      subdivisions: 20
    }, this.scene);
    
    // Ground material with grass-like appearance
    const groundMat = new StandardMaterial('groundMat', this.scene);
    
    // Create procedural grass texture
    const groundTexture = new DynamicTexture('groundTexture', 512, this.scene);
    const ctx = groundTexture.getContext();
    
    // Base grass color
    ctx.fillStyle = '#4a7c45';
    ctx.fillRect(0, 0, 512, 512);
    
    // Add noise/variation
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const shade = Math.random() * 40 - 20;
      ctx.fillStyle = `rgb(${74 + shade}, ${124 + shade}, ${69 + shade})`;
      ctx.fillRect(x, y, 3, 3);
    }
    
    // Add some darker patches
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = 'rgba(30, 60, 30, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 30 + 10, 0, Math.PI * 2);
      ctx.fill();
    }
    
    groundTexture.update();
    
    groundMat.diffuseTexture = groundTexture;
    groundMat.specularColor = new Color3(0.1, 0.1, 0.1);
    ground.material = groundMat;
    ground.receiveShadows = true;
  }

  createPlayer(id, isLocal = false) {
    // Create parent node for player
    const playerNode = new TransformNode(`player_${id}`, this.scene);
    
    // Create billboarded sprite plane for character
    const sprite = MeshBuilder.CreatePlane(`sprite_${id}`, {
      width: 1.5,
      height: 2
    }, this.scene);
    sprite.parent = playerNode;
    sprite.position.y = 1; // Lift above ground
    sprite.billboardMode = Mesh.BILLBOARDMODE_Y; // Always face camera (Y-axis only)
    
    // Create character texture
    const spriteMat = new StandardMaterial(`spriteMat_${id}`, this.scene);
    const spriteTexture = this.createCharacterTexture(isLocal);
    spriteMat.diffuseTexture = spriteTexture;
    spriteMat.diffuseTexture.hasAlpha = true;
    spriteMat.useAlphaFromDiffuseTexture = true;
    spriteMat.backFaceCulling = false;
    spriteMat.emissiveColor = new Color3(0.2, 0.2, 0.2); // Slight glow
    sprite.material = spriteMat;
    
    // Create shadow caster (simple circle on ground)
    const shadowDisc = MeshBuilder.CreateDisc(`shadow_${id}`, {
      radius: 0.5
    }, this.scene);
    shadowDisc.parent = playerNode;
    shadowDisc.rotation.x = Math.PI / 2;
    shadowDisc.position.y = 0.01;
    
    const shadowMat = new StandardMaterial(`shadowMat_${id}`, this.scene);
    shadowMat.diffuseColor = new Color3(0, 0, 0);
    shadowMat.alpha = 0.3;
    shadowMat.disableLighting = true;
    shadowDisc.material = shadowMat;
    
    // Add to shadow generator
    this.shadowGenerator.addShadowCaster(sprite);
    
    // Store reference
    this.playerMeshes.set(id, {
      node: playerNode,
      sprite,
      shadow: shadowDisc,
      material: spriteMat,
      isLocal
    });
    
    return playerNode;
  }

  createCharacterTexture(isLocal) {
    const texture = new DynamicTexture('charTexture', 128, this.scene);
    const ctx = texture.getContext();
    
    // Clear with transparency
    ctx.clearRect(0, 0, 128, 128);
    
    // Character color (green for local, red for others)
    const bodyColor = isLocal ? '#4CAF50' : '#f44336';
    const outlineColor = '#1a1a1a';
    
    // Draw character body (Don't Starve style - elongated, slightly wobbly)
    ctx.save();
    ctx.translate(64, 100);
    
    // Body outline
    ctx.fillStyle = outlineColor;
    ctx.beginPath();
    ctx.ellipse(0, -30, 22, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body fill
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, -30, 18, 31, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head outline
    ctx.fillStyle = outlineColor;
    ctx.beginPath();
    ctx.arc(0, -75, 22, 0, Math.PI * 2);
    ctx.fill();
    
    // Head fill (skin tone)
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(0, -75, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (Don't Starve style - big, round)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-7, -78, 6, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(7, -78, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-6, -77, 3, 0, Math.PI * 2);
    ctx.arc(8, -77, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Hair (messy, Don't Starve style)
    ctx.fillStyle = '#2c2c2c';
    ctx.beginPath();
    ctx.moveTo(-15, -85);
    ctx.quadraticCurveTo(-20, -100, -10, -95);
    ctx.quadraticCurveTo(-5, -105, 0, -95);
    ctx.quadraticCurveTo(5, -105, 10, -95);
    ctx.quadraticCurveTo(20, -100, 15, -85);
    ctx.closePath();
    ctx.fill();
    
    // Legs (simple)
    ctx.fillStyle = outlineColor;
    ctx.fillRect(-12, -5, 8, 15);
    ctx.fillRect(4, -5, 8, 15);
    
    ctx.restore();
    
    texture.update();
    return texture;
  }

  removePlayer(playerNode) {
    const id = playerNode.name.replace('player_', '');
    const playerData = this.playerMeshes.get(id);
    
    if (playerData) {
      playerData.sprite.dispose();
      playerData.shadow.dispose();
      playerData.node.dispose();
      this.playerMeshes.delete(id);
    }
  }

  setPlayerState(playerNode, state) {
    const id = playerNode.name.replace('player_', '');
    const playerData = this.playerMeshes.get(id);
    if (!playerData) return;
    
    // Stop any existing animations first
    this.scene.stopAnimation(playerData.sprite);
    
    if (state === 'walking') {
      // Walking bob animation
      const animation = new Animation(
        'walkBob',
        'position.y',
        30,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE
      );
      
      animation.setKeys([
        { frame: 0, value: 1 },
        { frame: 15, value: 1.15 },
        { frame: 30, value: 1 }
      ]);
      
      playerData.sprite.animations = [animation];
      this.scene.beginAnimation(playerData.sprite, 0, 30, true);
      playerData.walkAnimation = true;
      
    } else if (state === 'action') {
      // Action animation - quick scale/jump effect
      const scaleAnim = new Animation(
        'actionScale',
        'scaling.x',
        60,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      
      scaleAnim.setKeys([
        { frame: 0, value: 1 },
        { frame: 5, value: 1.3 },
        { frame: 15, value: 0.9 },
        { frame: 25, value: 1 }
      ]);
      
      const jumpAnim = new Animation(
        'actionJump',
        'position.y',
        60,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      
      jumpAnim.setKeys([
        { frame: 0, value: 1 },
        { frame: 8, value: 1.5 },
        { frame: 25, value: 1 }
      ]);
      
      playerData.sprite.animations = [scaleAnim, jumpAnim];
      this.scene.beginAnimation(playerData.sprite, 0, 25, false);
      
      // Create action effect particles
      this.createActionEffect(playerNode.position);
      playerData.walkAnimation = false;
      
    } else {
      // Idle - reset
      playerData.sprite.position.y = 1;
      playerData.sprite.scaling.x = 1;
      playerData.walkAnimation = false;
    }
  }

  createActionEffect(position) {
    // Create simple particle burst for action feedback
    for (let i = 0; i < 6; i++) {
      const particle = MeshBuilder.CreatePlane('particle', { size: 0.25 }, this.scene);
      particle.position = position.clone();
      particle.position.y = 0.5;
      particle.billboardMode = Mesh.BILLBOARDMODE_ALL;
      
      const mat = new StandardMaterial('particleMat', this.scene);
      mat.diffuseColor = new Color3(1, 0.9, 0.6);
      mat.emissiveColor = new Color3(0.5, 0.4, 0.2);
      mat.disableLighting = true;
      particle.material = mat;
      
      const angle = (i / 6) * Math.PI * 2;
      const speed = 1.5 + Math.random();
      const vx = Math.cos(angle) * speed;
      const vz = Math.sin(angle) * speed;
      
      let life = 0;
      const maxLife = 15;
      
      const animate = () => {
        life++;
        particle.position.x += vx * 0.025;
        particle.position.z += vz * 0.025;
        particle.position.y += 0.04;
        mat.alpha = 1 - life / maxLife;
        
        if (life < maxLife) {
          requestAnimationFrame(animate);
        } else {
          particle.dispose();
          mat.dispose();
        }
      };
      animate();
    }
  }

  createWorldObject(id, type, x, z, rotation) {
    let mesh;
    
    switch (type) {
      case 'tree':
        mesh = this.createTree(id, x, z, rotation);
        break;
      case 'rock':
        mesh = this.createRock(id, x, z, rotation);
        break;
      case 'grass':
        mesh = this.createGrass(id, x, z, rotation);
        break;
      case 'berry_bush':
        mesh = this.createBerryBush(id, x, z, rotation);
        break;
      default:
        mesh = this.createGenericObject(id, x, z);
    }
    
    this.worldObjectMeshes.set(id, mesh);
    return mesh;
  }

  createTree(id, x, z, rotation) {
    const treeNode = new TransformNode(`tree_${id}`, this.scene);
    treeNode.position = new Vector3(x, 0, z);
    
    // Tree trunk (billboarded)
    const trunk = MeshBuilder.CreatePlane(`trunk_${id}`, {
      width: 2,
      height: 4
    }, this.scene);
    trunk.parent = treeNode;
    trunk.position.y = 2;
    trunk.billboardMode = Mesh.BILLBOARDMODE_Y;
    
    // Trunk texture
    const trunkMat = new StandardMaterial(`trunkMat_${id}`, this.scene);
    const trunkTexture = new DynamicTexture(`trunkTex_${id}`, 64, this.scene);
    const ctx = trunkTexture.getContext();
    
    ctx.clearRect(0, 0, 64, 64);
    
    // Draw trunk
    ctx.fillStyle = '#4a3728';
    ctx.beginPath();
    ctx.moveTo(20, 64);
    ctx.lineTo(24, 0);
    ctx.lineTo(40, 0);
    ctx.lineTo(44, 64);
    ctx.closePath();
    ctx.fill();
    
    // Bark texture
    ctx.strokeStyle = '#3a2718';
    ctx.lineWidth = 2;
    for (let i = 10; i < 60; i += 8) {
      ctx.beginPath();
      ctx.moveTo(22 + Math.random() * 4, i);
      ctx.lineTo(42 - Math.random() * 4, i + 3);
      ctx.stroke();
    }
    
    // Tree canopy
    ctx.fillStyle = '#2d5a27';
    ctx.beginPath();
    ctx.arc(32, 15, 20, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#3d7a37';
    ctx.beginPath();
    ctx.arc(28, 12, 12, 0, Math.PI * 2);
    ctx.arc(36, 18, 10, 0, Math.PI * 2);
    ctx.fill();
    
    trunkTexture.update();
    
    trunkMat.diffuseTexture = trunkTexture;
    trunkMat.diffuseTexture.hasAlpha = true;
    trunkMat.useAlphaFromDiffuseTexture = true;
    trunkMat.backFaceCulling = false;
    trunk.material = trunkMat;
    
    this.shadowGenerator.addShadowCaster(trunk);
    
    return treeNode;
  }

  createRock(id, x, z, rotation) {
    const rockNode = new TransformNode(`rock_${id}`, this.scene);
    rockNode.position = new Vector3(x, 0, z);
    
    const rock = MeshBuilder.CreatePlane(`rockSprite_${id}`, {
      width: 1.5,
      height: 1
    }, this.scene);
    rock.parent = rockNode;
    rock.position.y = 0.5;
    rock.billboardMode = Mesh.BILLBOARDMODE_Y;
    
    const rockMat = new StandardMaterial(`rockMat_${id}`, this.scene);
    const rockTexture = new DynamicTexture(`rockTex_${id}`, 64, this.scene);
    const ctx = rockTexture.getContext();
    
    ctx.clearRect(0, 0, 64, 64);
    
    // Rock shape
    ctx.fillStyle = '#5a5a5a';
    ctx.beginPath();
    ctx.moveTo(10, 50);
    ctx.quadraticCurveTo(5, 30, 15, 15);
    ctx.quadraticCurveTo(32, 5, 50, 15);
    ctx.quadraticCurveTo(60, 30, 55, 50);
    ctx.closePath();
    ctx.fill();
    
    // Highlights
    ctx.fillStyle = '#7a7a7a';
    ctx.beginPath();
    ctx.arc(25, 25, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Shadow
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.ellipse(32, 48, 20, 5, 0, 0, Math.PI);
    ctx.fill();
    
    rockTexture.update();
    
    rockMat.diffuseTexture = rockTexture;
    rockMat.diffuseTexture.hasAlpha = true;
    rockMat.useAlphaFromDiffuseTexture = true;
    rockMat.backFaceCulling = false;
    rock.material = rockMat;
    
    this.shadowGenerator.addShadowCaster(rock);
    
    return rockNode;
  }

  createGrass(id, x, z, rotation) {
    const grassNode = new TransformNode(`grass_${id}`, this.scene);
    grassNode.position = new Vector3(x, 0, z);
    
    const grass = MeshBuilder.CreatePlane(`grassSprite_${id}`, {
      width: 0.8,
      height: 0.6
    }, this.scene);
    grass.parent = grassNode;
    grass.position.y = 0.3;
    grass.billboardMode = Mesh.BILLBOARDMODE_Y;
    
    const grassMat = new StandardMaterial(`grassMat_${id}`, this.scene);
    const grassTexture = new DynamicTexture(`grassTex_${id}`, 32, this.scene);
    const ctx = grassTexture.getContext();
    
    ctx.clearRect(0, 0, 32, 32);
    
    // Grass blades
    ctx.strokeStyle = '#6b8e23';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 5; i++) {
      const baseX = 8 + i * 4;
      ctx.beginPath();
      ctx.moveTo(baseX, 30);
      ctx.quadraticCurveTo(baseX + Math.random() * 4 - 2, 15, baseX + Math.random() * 6 - 3, 5);
      ctx.stroke();
    }
    
    grassTexture.update();
    
    grassMat.diffuseTexture = grassTexture;
    grassMat.diffuseTexture.hasAlpha = true;
    grassMat.useAlphaFromDiffuseTexture = true;
    grassMat.backFaceCulling = false;
    grass.material = grassMat;
    
    return grassNode;
  }

  createBerryBush(id, x, z, rotation) {
    const bushNode = new TransformNode(`bush_${id}`, this.scene);
    bushNode.position = new Vector3(x, 0, z);
    
    const bush = MeshBuilder.CreatePlane(`bushSprite_${id}`, {
      width: 1.2,
      height: 1
    }, this.scene);
    bush.parent = bushNode;
    bush.position.y = 0.5;
    bush.billboardMode = Mesh.BILLBOARDMODE_Y;
    
    const bushMat = new StandardMaterial(`bushMat_${id}`, this.scene);
    const bushTexture = new DynamicTexture(`bushTex_${id}`, 48, this.scene);
    const ctx = bushTexture.getContext();
    
    ctx.clearRect(0, 0, 48, 48);
    
    // Bush foliage
    ctx.fillStyle = '#3d6b35';
    ctx.beginPath();
    ctx.arc(24, 28, 18, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#4d8b45';
    ctx.beginPath();
    ctx.arc(20, 25, 10, 0, Math.PI * 2);
    ctx.arc(30, 30, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Berries
    ctx.fillStyle = '#c41e3a';
    const berryPositions = [[18, 22], [28, 25], [24, 32], [32, 28], [16, 30]];
    berryPositions.forEach(([bx, by]) => {
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    bushTexture.update();
    
    bushMat.diffuseTexture = bushTexture;
    bushMat.diffuseTexture.hasAlpha = true;
    bushMat.useAlphaFromDiffuseTexture = true;
    bushMat.backFaceCulling = false;
    bush.material = bushMat;
    
    this.shadowGenerator.addShadowCaster(bush);
    
    return bushNode;
  }

  createGenericObject(id, x, z) {
    const obj = MeshBuilder.CreateBox(`obj_${id}`, { size: 1 }, this.scene);
    obj.position = new Vector3(x, 0.5, z);
    return obj;
  }

  setCameraTarget(target) {
    this.cameraTarget = target;
  }

  getCameraAlpha() {
    return this.camera ? this.camera.alpha : 0;
  }

  // Get camera forward and right directions for movement calculation
  // Based on official Babylon.js ArcRotateCamera source code:
  // Camera position = target + (radius * cos(alpha) * sin(beta), radius * cos(beta), radius * sin(alpha) * sin(beta))
  // So camera is positioned at angle alpha from target, looking TOWARD target
  // Forward = direction from camera toward target (negated position offset, projected on XZ plane)
  // Right = forward rotated 90 degrees clockwise (when viewed from above)
  getCameraDirections() {
    if (!this.camera) {
      return { forwardX: 0, forwardZ: -1, rightX: 1, rightZ: 0 };
    }
    
    const alpha = this.camera.alpha;
    
    // Forward direction: from camera toward target (on XZ plane)
    // Camera offset X = cos(alpha), Z = sin(alpha), so forward = negative of that
    const forwardX = -Math.cos(alpha);
    const forwardZ = -Math.sin(alpha);
    
    // Right direction: forward rotated 90 degrees clockwise (when viewed from above)
    // Rotation formula: (x, z) rotated 90° CW = (z, -x)
    const rightX = forwardZ;   // = -sin(alpha)
    const rightZ = -forwardX;  // = cos(alpha)
    
    return { forwardX, forwardZ, rightX, rightZ };
  }

  setDayPhase(phase) {
    this.dayPhase = phase;
    
    // Adjust lighting based on time of day
    switch (phase) {
      case 'day':
        this.scene.clearColor = new Color4(0.5, 0.7, 0.9, 1);
        this.sunLight.intensity = 0.8;
        this.sunLight.diffuse = new Color3(1, 0.95, 0.8);
        break;
      case 'dusk':
        this.scene.clearColor = new Color4(0.7, 0.4, 0.3, 1);
        this.sunLight.intensity = 0.5;
        this.sunLight.diffuse = new Color3(1, 0.6, 0.4);
        break;
      case 'night':
        this.scene.clearColor = new Color4(0.1, 0.1, 0.2, 1);
        this.sunLight.intensity = 0.2;
        this.sunLight.diffuse = new Color3(0.4, 0.4, 0.6);
        break;
    }
  }

  startRenderLoop() {
    this.engine.runRenderLoop(() => {
      // Smoothly follow camera target
      if (this.cameraTarget) {
        const targetPos = this.cameraTarget.position;
        this.camera.target.x += (targetPos.x - this.camera.target.x) * 0.1;
        this.camera.target.z += (targetPos.z - this.camera.target.z) * 0.1;
      }
      
      this.scene.render();
    });
  }
}
