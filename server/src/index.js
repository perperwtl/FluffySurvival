import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { GameRoom } from './rooms/GameRoom.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from client dist (for production)
const clientDistPath = join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Create HTTP server
const httpServer = createServer(app);

// Create Colyseus server
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer
  })
});

// Register game room
gameServer.define('game', GameRoom);

// Start server on all interfaces
const HOST = '0.0.0.0';
httpServer.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║       🎮 Don't Starve Clone - Server Running       ║
╠════════════════════════════════════════════════════╣
║  HTTP Server:  http://0.0.0.0:${PORT}                ║
║  WebSocket:    ws://0.0.0.0:${PORT}                  ║
║  Room Type:    game                                ║
║  Network:      Access via your local IP + port     ║
╚════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  gameServer.gracefullyShutdown();
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  gameServer.gracefullyShutdown();
});
