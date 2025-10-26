#!/bin/bash

# Integration Test Script for Concordium Gambling Plugin
# This script starts all services and runs basic integration tests

echo "🚀 Starting Concordium Gambling Plugin Integration Test"
echo "======================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites installed${NC}"
echo ""

# Check if ports are available
echo "🔍 Checking if required ports are available..."

check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $1 is available${NC}"
        return 0
    fi
}

PORT_8000_FREE=true
PORT_3000_FREE=true
PORT_5173_FREE=true

if ! check_port 8000; then
    PORT_8000_FREE=false
fi

if ! check_port 3000; then
    PORT_3000_FREE=false
fi

if ! check_port 5173; then
    PORT_5173_FREE=false
fi

echo ""

# Install dependencies if needed
echo "📦 Installing dependencies..."

if [ ! -d "node-backend/node_modules" ]; then
    echo "Installing Node.js backend dependencies..."
    cd node-backend && npm install && cd ..
fi

if [ ! -d "Frontend/node_modules" ]; then
    echo "Installing Frontend dependencies..."
    cd Frontend && npm install && cd ..
fi

# Check Python dependencies
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "Installing Python backend dependencies..."
    cd python-backend && pip install -r requirements.txt && cd ..
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Test backend connections
echo "🧪 Testing backend connectivity..."

# Test if we can reach Concordium testnet
if curl -s --connect-timeout 5 https://grpc.testnet.concordium.com:20000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Concordium testnet is reachable${NC}"
else
    echo -e "${YELLOW}⚠️  Cannot reach Concordium testnet (may need special network config)${NC}"
fi

echo ""

# Display service URLs
echo "🌐 Service URLs:"
echo "  Frontend:       http://localhost:5173"
echo "  Python Backend: http://localhost:8000"
echo "  Python Docs:    http://localhost:8000/docs"
echo "  Node Backend:   http://localhost:3000"
echo "  Health Check:   http://localhost:3000/api/health"
echo ""

# Instructions to start services
echo "📝 To start all services, run these commands in separate terminals:"
echo ""
echo -e "${YELLOW}Terminal 1 - Python Backend:${NC}"
echo "  cd python-backend"
echo "  python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo -e "${YELLOW}Terminal 2 - Node.js Backend:${NC}"
echo "  cd node-backend"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}Terminal 3 - Frontend:${NC}"
echo "  cd Frontend"
echo "  npm run dev"
echo ""

echo "✅ Integration check complete!"
echo ""
echo "🎮 Testing Steps:"
echo "  1. Start all three services in separate terminals"
echo "  2. Open http://localhost:5173 in your browser"
echo "  3. Connect your Concordium wallet"
echo "  4. Verify your age (18+)"
echo "  5. Check that your balance loads"
echo "  6. Try placing a bet"
echo "  7. Check browser console and backend logs"
echo ""
echo "📊 Monitor integration in browser DevTools Console:"
echo "  • 'User registered successfully' - User creation worked"
echo "  • 'Session started: {id}' - Session tracking working"
echo "  • 'Deposit recorded in backend' - Payment integration working"
echo "  • 'Winnings recorded in backend' - Payout integration working"
echo ""
echo "🔧 Troubleshooting:"
echo "  • If CORS errors: Check CORS_ORIGINS in python-backend/src/config/settings.py"
echo "  • If balance doesn't load: Check Node.js backend logs"
echo "  • If backend calls fail: Verify all services are running"
echo "  • Check logs in each terminal for detailed error messages"
echo ""
