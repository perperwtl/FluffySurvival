# Contributing to Survival Multiplayer Game

First off, thank you for considering contributing! 🎉

This document provides guidelines and information for contributors. Following these guidelines helps communicate that you respect the time of the developers managing and developing this open source project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

**Expected behavior:**
- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

**Unacceptable behavior:**
- Harassment, trolling, or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- A code editor (VS Code recommended)
- Basic knowledge of JavaScript, Babylon.js, or game development

### Setting Up Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/survival-multiplayer-game.git
   cd survival-multiplayer-game
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/survival-multiplayer-game.git
   ```

4. **Install dependencies:**
   ```bash
   # Server
   cd server && npm install
   
   # Client
   cd ../client && npm install
   ```

5. **Start development servers:**
   ```bash
   # Terminal 1 - Server
   cd server && npm run dev
   
   # Terminal 2 - Client
   cd client && npm run dev
   ```

6. **Open in browser:** `http://localhost:5173`

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**Great bug reports include:**
- A clear, descriptive title
- Steps to reproduce the behavior
- Expected vs actual behavior
- Screenshots or videos if applicable
- Browser/OS information
- Console errors (if any)

**Template:**
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]
```

### 💡 Suggesting Features

Feature suggestions are welcome! Please provide:

- A clear use case
- How it fits with the game's vision
- Any implementation ideas (optional)

### 🔧 Code Contributions

#### Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers:
- Documentation improvements
- Simple bug fixes
- Small UI tweaks
- Adding comments or tests

#### Priority Areas

| Area | Description | Skills Needed |
|------|-------------|---------------|
| **Inventory System** | UI and logic for items | Babylon.js GUI, state management |
| **Crafting** | Recipe system and UI | JavaScript, game design |
| **Enemy AI** | Spider behavior, pathfinding | AI/behavior trees, game math |
| **Resource Gathering** | Chopping trees, mining | Animation, game mechanics |
| **Day/Night Cycle** | Lighting changes, time | Babylon.js lighting |
| **Sound System** | SFX and music | Audio APIs |
| **Save/Load** | Persistence | Database, serialization |

## Development Workflow

### Branch Naming

```
feature/short-description    # New features
fix/issue-description        # Bug fixes
docs/what-changed           # Documentation
refactor/what-changed       # Code refactoring
test/what-tested            # Adding tests
```

### Development Process

1. **Sync with upstream:**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

3. **Make changes** - Keep commits small and focused

4. **Test your changes:**
   - Run the game and test manually
   - Check for console errors
   - Test on multiple browsers if possible
   - Test multiplayer scenarios (open 2+ tabs)

5. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: add inventory UI"
   git push origin feature/my-feature
   ```

6. **Open a Pull Request**

## Style Guidelines

### JavaScript Style

```javascript
// ✅ Good
export class PlayerManager {
  constructor(scene) {
    this.scene = scene;
    this.players = new Map();
  }

  addPlayer(id, data) {
    const player = this.createPlayerMesh(data);
    this.players.set(id, player);
    return player;
  }

  // Private methods prefixed with underscore
  _calculatePosition(x, z) {
    return new Vector3(x, 0, z);
  }
}

// ❌ Avoid
export class playerManager {
  constructor(s) {
    this.s = s;
    this.p = new Map();
  }
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `GameEngine`, `MapLoader` |
| Functions/Methods | camelCase | `updatePlayer`, `loadMap` |
| Constants | UPPER_SNAKE | `MAX_PLAYERS`, `TILE_SIZE` |
| Files (classes) | PascalCase.js | `GameEngine.js` |
| Files (utilities) | camelCase.js | `mathUtils.js` |
| CSS classes | kebab-case | `player-health-bar` |

### File Organization

```javascript
// 1. Imports (external first, then internal)
import { Vector3, MeshBuilder } from '@babylonjs/core';
import { NetworkManager } from '../network/NetworkManager.js';

// 2. Constants
const MAX_SPEED = 5;
const DEFAULT_HEALTH = 100;

// 3. Class definition
export class Player {
  // 3a. Constructor
  constructor(scene, id) {
    this.scene = scene;
    this.id = id;
  }

  // 3b. Public methods
  move(direction) { }
  
  takeDamage(amount) { }

  // 3c. Private methods
  _updateAnimation() { }
}

// 4. Helper functions (if any)
function calculateDistance(a, b) { }
```

### Comments

```javascript
// ✅ Good - Explains WHY, not WHAT
// Offset by 0.5 to center on tile grid
const x = tileX + 0.5;

// Use client prediction for responsive movement,
// server will correct if needed
this.localPlayer.position = predictedPosition;

// ❌ Avoid - States the obvious
// Add 1 to x
x = x + 1;

// Set position
player.position = pos;
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Examples

```bash
feat(inventory): add item stacking functionality

fix(movement): resolve camera-relative direction bug

docs(readme): update installation instructions

refactor(server): extract map loading into separate module

perf(render): reduce draw calls for distant objects
```

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Added comments for complex logic
- [ ] Updated documentation if needed
- [ ] No console errors or warnings
- [ ] Tested multiplayer scenarios
- [ ] Tested on mobile (if UI changes)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe your testing process

## Screenshots (if applicable)

## Checklist
- [ ] My code follows the project style
- [ ] I have self-reviewed my code
- [ ] I have commented complex code
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
```

### Review Process

1. **Automated checks** must pass
2. **At least one maintainer** must approve
3. **Address feedback** - make requested changes
4. **Squash and merge** - keep history clean

### After Merge

- Delete your feature branch
- Sync your fork with upstream
- Celebrate! 🎉

## Questions?

- **Discord:** [Coming Soon]
- **Issues:** Use the `question` label
- **Discussions:** GitHub Discussions tab

---

Thank you for contributing! Every contribution, no matter how small, helps make this project better. 🙏
