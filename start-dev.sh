#!/bin/bash

# Don't Starve Clone - Development Startup Script

echo "🎮 Fluffy Survival - Starting Development Environment"
echo "========================================================"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from the project root directory"
    exit 1
fi

# Start the game server
echo "🖥️  Starting game server on port 3000..."
cd server && node src/index.js &
SERVER_PID=$!
cd ..

# Wait for server to start
sleep 2

# Start the Vite dev server
echo "🌐 Starting Vite dev server on port 5173..."
cd client && npm run dev &
CLIENT_PID=$!
cd ..

echo ""
echo "✅ Development servers started!"
echo ""
echo "📌 Access Points:"
echo "   • Game Client:  http://localhost:5173"
echo "   • Game Server:  http://localhost:3000"
echo ""
echo "🎮 How to Play:"
echo "   1. Open http://localhost:5173 in your browser"
echo "   2. Open another tab/window to test multiplayer"
echo "   3. Use WASD or Arrow Keys to move"
echo "   4. Press Space for actions"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for both processes
wait
