export class UIManager {
  constructor() {
    this.elements = {
      connectionStatus: document.getElementById('connection-status'),
      statusText: document.getElementById('status-text'),
      playerCount: document.getElementById('count'),
      dayIndicator: document.getElementById('day-indicator'),
      dayText: document.getElementById('day-text'),
      healthBar: document.getElementById('health-bar'),
      hungerBar: document.getElementById('hunger-bar'),
      sanityBar: document.getElementById('sanity-bar')
    };
  }

  setConnected(connected) {
    if (connected) {
      this.elements.connectionStatus.classList.add('connected');
      this.elements.statusText.textContent = 'Connected';
    } else {
      this.elements.connectionStatus.classList.remove('connected');
      this.elements.statusText.textContent = 'Disconnected';
    }
  }

  setPlayerCount(count) {
    this.elements.playerCount.textContent = count;
  }

  setDayPhase(phase) {
    const indicator = this.elements.dayIndicator;
    const text = this.elements.dayText;
    
    // Remove all phase classes
    indicator.classList.remove('day-phase-day', 'day-phase-dusk', 'day-phase-night');
    
    switch (phase) {
      case 'day':
        indicator.classList.add('day-phase-day');
        text.textContent = '☀️ Day';
        break;
      case 'dusk':
        indicator.classList.add('day-phase-dusk');
        text.textContent = '🌅 Dusk';
        break;
      case 'night':
        indicator.classList.add('day-phase-night');
        text.textContent = '🌙 Night';
        break;
    }
  }

  setHealth(value) {
    this.elements.healthBar.style.width = `${value}%`;
  }

  setHunger(value) {
    this.elements.hungerBar.style.width = `${value}%`;
  }

  setSanity(value) {
    this.elements.sanityBar.style.width = `${value}%`;
  }

  showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'game-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      padding: 10px 20px;
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000;
      animation: fadeInOut ${duration}ms ease-in-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, duration);
  }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    15% { opacity: 1; transform: translateX(-50%) translateY(0); }
    85% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
  }
`;
document.head.appendChild(style);
