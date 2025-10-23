#!/bin/bash

# 🧪 Quick Test Runner Script for Project Manager App
# Run this script to quickly start both backend and frontend for testing

echo "🚀 Starting Project Manager App Testing Environment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}Warning: Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

# Function to start backend
start_backend() {
    echo -e "${GREEN}Starting Backend Server...${NC}"
    cd backend

    # Check if .env exists
    if [ ! -f .env ]; then
        echo -e "${RED}Error: .env file not found in backend directory${NC}"
        echo "Please create .env file with required variables"
        exit 1
    fi

    # Install dependencies if needed
    if [ ! -d node_modules ]; then
        echo "Installing backend dependencies..."
        npm install
    fi

    # Check port 8000
    check_port 8000

    # Start backend in background
    echo "Backend starting on http://localhost:8000"
    npm start &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid

    # Wait for backend to start
    sleep 3

    # Check if backend started successfully
    if curl -s http://localhost:8000 > /dev/null; then
        echo -e "${GREEN}✅ Backend started successfully${NC}"
    else
        echo -e "${RED}❌ Backend failed to start${NC}"
        exit 1
    fi

    cd ..
}

# Function to start frontend
start_frontend() {
    echo -e "${GREEN}Starting Frontend Development Server...${NC}"
    cd frontend

    # Install dependencies if needed
    if [ ! -d node_modules ]; then
        echo "Installing frontend dependencies..."
        npm install
    fi

    # Check port 5173
    check_port 5173

    # Start frontend in background
    echo "Frontend starting on http://localhost:5173"
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid

    # Wait for frontend to start
    sleep 5

    # Check if frontend started successfully
    if curl -s http://localhost:5173 > /dev/null; then
        echo -e "${GREEN}✅ Frontend started successfully${NC}"
    else
        echo -e "${RED}❌ Frontend failed to start${NC}"
        exit 1
    fi

    cd ..
}

# Function to show testing URLs
show_urls() {
    echo ""
    echo "🎯 Testing URLs:"
    echo "================================"
    echo "Frontend: http://localhost:5173"
    echo "Backend:  http://localhost:8000"
    echo "Backend Health: http://localhost:8000/api/health"
    echo ""
    echo "📋 Testing Checklist: TESTING_CHECKLIST.md"
    echo ""
}

# Function to cleanup processes
cleanup() {
    echo -e "${YELLOW}Stopping servers...${NC}"

    if [ -f backend.pid ]; then
        kill $(cat backend.pid) 2>/dev/null
        rm backend.pid
    fi

    if [ -f frontend.pid ]; then
        kill $(cat frontend.pid) 2>/dev/null
        rm frontend.pid
    fi

    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Trap cleanup on script exit
trap cleanup EXIT

# Main execution
echo "🔍 Checking prerequisites..."

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Start servers
start_backend
start_frontend
show_urls

echo "🧪 Ready for testing! Follow the checklist in TESTING_CHECKLIST.md"
echo ""
echo "Press Ctrl+C to stop both servers and exit"

# Keep script running
while true; do
    sleep 1
done
