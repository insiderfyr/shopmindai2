#!/bin/bash

# ShopMindAI Development Startup Script
# This script starts both the mock server and the frontend development server

echo "🚀 Starting ShopMindAI Development Environment"
echo "=========================================="

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    kill $MOCK_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start mock server
echo "📡 Starting mock server on port 3080..."
node mock-server.js &
MOCK_PID=$!

# Wait a moment for mock server to start
sleep 2

# Check if mock server started successfully
if ! curl -s http://localhost:3080/api/health > /dev/null; then
    echo "❌ Failed to start mock server"
    exit 1
fi

echo "✅ Mock server started successfully"

# Start frontend development server
echo "🌐 Starting frontend development server on port 3090..."
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 3

echo ""
echo "🎉 Development environment is ready!"
echo "=========================================="
echo "📡 Mock Server: http://localhost:3080"
echo "🌐 Frontend:   http://localhost:3090"
echo ""
echo "🔧 Demo credentials:"
echo "   Email:    demo@shopmindai.com"
echo "   Password: demo123"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
