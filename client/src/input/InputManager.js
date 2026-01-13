export class InputManager {
  constructor() {
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      action: false
    };
    
    this.isMoving = false;
    
    // Camera direction vectors (updated from GameEngine)
    this.forwardX = 0;
    this.forwardZ = -1;
    this.rightX = 1;
    this.rightZ = 0;
    
    // Callbacks
    this.onMove = null;
    this.onStop = null;
    this.onAction = null;
    
    this.setupListeners();
  }

  // Called from Game.update() to sync camera directions
  setCameraDirections(forwardX, forwardZ, rightX, rightZ) {
    this.forwardX = forwardX;
    this.forwardZ = forwardZ;
    this.rightX = rightX;
    this.rightZ = rightZ;
  }

  setupListeners() {
    // Keyboard down
    window.addEventListener('keydown', (e) => {
      if (this.handleKey(e.code, true)) {
        e.preventDefault();
      }
    });
    
    // Keyboard up
    window.addEventListener('keyup', (e) => {
      if (this.handleKey(e.code, false)) {
        e.preventDefault();
      }
    });
    
    // Handle losing focus
    window.addEventListener('blur', () => {
      this.resetKeys();
    });
    
    // Touch controls for mobile
    this.setupTouchControls();
  }

  handleKey(code, isDown) {
    let handled = true;
    
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.up = isDown;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.down = isDown;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = isDown;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = isDown;
        break;
      case 'Space':
        if (isDown && !this.keys.action) {
          this.keys.action = true;
          if (this.onAction) {
            this.onAction();
          }
        } else if (!isDown) {
          this.keys.action = false;
        }
        break;
      default:
        handled = false;
    }
    
    if (handled) {
      this.updateMovement();
    }
    
    return handled;
  }

  updateMovement() {
    // Get input as forward/back and left/right
    let inputForward = 0;  // W/S: +1 = forward (W), -1 = backward (S)
    let inputRight = 0;    // A/D: +1 = right (D), -1 = left (A)
    
    if (this.keys.up) inputForward = 1;     // W = move forward (into screen)
    if (this.keys.down) inputForward = -1;  // S = move backward (out of screen)
    if (this.keys.left) inputRight = -1;    // A = move left
    if (this.keys.right) inputRight = 1;    // D = move right
    
    const isNowMoving = inputForward !== 0 || inputRight !== 0;
    
    if (isNowMoving) {
      // Calculate world movement using camera direction vectors
      // worldMovement = inputForward * forwardDir + inputRight * rightDir
      const worldX = inputForward * this.forwardX + inputRight * this.rightX;
      const worldZ = inputForward * this.forwardZ + inputRight * this.rightZ;
      
      this.isMoving = true;
      if (this.onMove) {
        this.onMove(worldX, worldZ);
      }
    } else if (this.isMoving) {
      this.isMoving = false;
      if (this.onStop) {
        this.onStop();
      }
    }
  }

  resetKeys() {
    this.keys.up = false;
    this.keys.down = false;
    this.keys.left = false;
    this.keys.right = false;
    this.keys.action = false;
    
    if (this.isMoving) {
      this.isMoving = false;
      if (this.onStop) {
        this.onStop();
      }
    }
  }

  setupTouchControls() {
    // Only create touch controls on touch-capable devices
    if (!('ontouchstart' in window) && !navigator.maxTouchPoints) {
      console.log('📱 No touch support detected, skipping touch controls');
      return;
    }
    
    console.log('📱 Setting up touch controls...');
    
    // Create joystick container
    const joystickArea = document.createElement('div');
    joystickArea.id = 'joystick-area';
    joystickArea.style.cssText = `
      position: fixed;
      left: 30px;
      bottom: 100px;
      width: 120px;
      height: 120px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.3);
      touch-action: none;
      z-index: 200;
      user-select: none;
      -webkit-user-select: none;
    `;
    
    const joystickKnob = document.createElement('div');
    joystickKnob.id = 'joystick-knob';
    joystickKnob.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      pointer-events: none;
    `;
    
    joystickArea.appendChild(joystickKnob);
    document.body.appendChild(joystickArea);
    
    // Create action button
    const actionBtn = document.createElement('div');
    actionBtn.id = 'action-btn';
    actionBtn.innerHTML = '⚡';
    actionBtn.style.cssText = `
      position: fixed;
      right: 30px;
      bottom: 120px;
      width: 70px;
      height: 70px;
      background: rgba(255, 100, 100, 0.4);
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      touch-action: none;
      z-index: 200;
      user-select: none;
      -webkit-user-select: none;
    `;
    document.body.appendChild(actionBtn);
    
    // Joystick state
    let joystickActive = false;
    let joystickCenter = { x: 0, y: 0 };
    const maxDistance = 45;
    
    // Joystick touch start
    joystickArea.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.touches[0];
      const rect = joystickArea.getBoundingClientRect();
      joystickCenter.x = rect.left + rect.width / 2;
      joystickCenter.y = rect.top + rect.height / 2;
      joystickActive = true;
      
      this.handleJoystickMove(touch.clientX, touch.clientY, joystickCenter, maxDistance, joystickKnob);
    }, { passive: false });
    
    // Joystick touch move
    joystickArea.addEventListener('touchmove', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!joystickActive) return;
      
      const touch = e.touches[0];
      this.handleJoystickMove(touch.clientX, touch.clientY, joystickCenter, maxDistance, joystickKnob);
    }, { passive: false });
    
    // Joystick touch end
    const resetJoystick = (e) => {
      e.preventDefault();
      joystickActive = false;
      joystickKnob.style.transform = 'translate(-50%, -50%)';
      
      if (this.isMoving) {
        this.isMoving = false;
        if (this.onStop) {
          this.onStop();
        }
      }
    };
    
    joystickArea.addEventListener('touchend', resetJoystick, { passive: false });
    joystickArea.addEventListener('touchcancel', resetJoystick, { passive: false });
    
    // Action button handlers
    actionBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      actionBtn.style.transform = 'scale(0.9)';
      actionBtn.style.background = 'rgba(255, 100, 100, 0.7)';
      
      if (this.onAction) {
        this.onAction();
      }
    }, { passive: false });
    
    actionBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      actionBtn.style.transform = 'scale(1)';
      actionBtn.style.background = 'rgba(255, 100, 100, 0.4)';
    }, { passive: false });
    
    console.log('📱 Touch controls ready');
  }
  
  handleJoystickMove(touchX, touchY, center, maxDistance, knob) {
    const dx = touchX - center.x;
    const dy = touchY - center.y;
    
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
    const angle = Math.atan2(dy, dx);
    
    const knobX = Math.cos(angle) * distance;
    const knobY = Math.sin(angle) * distance;
    
    knob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
    
    // Send movement if past deadzone
    if (distance > 10) {
      // Joystick input:
      // knobX: positive = right, negative = left
      // knobY: positive = down (backward), negative = up (forward)
      const inputRight = knobX / maxDistance;
      const inputForward = -knobY / maxDistance;  // Negative because up on screen = forward
      
      // Calculate world movement using camera direction vectors
      const worldX = inputForward * this.forwardX + inputRight * this.rightX;
      const worldZ = inputForward * this.forwardZ + inputRight * this.rightZ;
      
      this.isMoving = true;
      if (this.onMove) {
        this.onMove(worldX, worldZ);
      }
    } else if (this.isMoving) {
      this.isMoving = false;
      if (this.onStop) {
        this.onStop();
      }
    }
  }
}
