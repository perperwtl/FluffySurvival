# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Colyseus 0.16 and Babylon.js 7
- Real-time multiplayer movement synchronization
- Camera-relative WASD controls
- Mobile touch controls (joystick + action button)
- 2.5D camera with locked vertical angle
- Map system with JSON format
- Tiled Map Editor integration
- Procedural map generation with presets
- Collision detection system
- Player spawn system
- Map boundaries

### Technical
- ES Modules throughout
- Vite for client bundling
- Server-authoritative game state
- WebSocket communication via Colyseus
- Spatial collision grid for performance

## [0.1.0] - 2025-01-XX

### Added
- 🎮 Basic multiplayer functionality
- 🗺️ Map loading system
- 🎥 Camera controls
- 📱 Mobile support
- 🌲 Environment objects (trees, rocks, grass, bushes)

---

## Version History

### Versioning Scheme

- **MAJOR** version: Incompatible API changes
- **MINOR** version: New functionality (backwards-compatible)
- **PATCH** version: Bug fixes (backwards-compatible)

### Release Types

- `alpha` - Early development, expect breaking changes
- `beta` - Feature complete, bug fixing phase
- `rc` - Release candidate, final testing
- `stable` - Production ready

---

## How to Update This File

When making changes, add entries under `[Unreleased]` in the appropriate category:

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Vulnerability fixes

When releasing, move `[Unreleased]` content to a new version section with the release date.
