#!/bin/bash

# Installation Verification Script
# Checks if all components are properly installed and configured

echo "🔍 Verifying Concordium Gambling Plugin Installation..."
echo "=========================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Function to check command
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $2 found: $(command -v $1)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $2 not found"
        ((FAILED++))
        return 1
    fi
}

# Function to check file
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2 exists"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $2 missing"
        ((FAILED++))
        return 1
    fi
}

# Function to check directory
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2 exists"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $2 missing"
        ((FAILED++))
        return 1
    fi
}

# Check Prerequisites
echo "📋 Checking Prerequisites..."
echo ""
check_command "node" "Node.js"
check_command "npm" "npm"
check_command "python3" "Python 3"
check_command "pip3" "pip"
check_command "psql" "PostgreSQL"

echo ""
echo "📦 Checking Project Structure..."
echo ""

# Check Python Backend
echo "Checking Python Backend..."
check_dir "python_backend" "Python backend directory"
check_file "python_backend/requirements.txt" "Python requirements file"
check_file "python_backend/src/main.py" "Python main application"
check_file "python_backend/.env" "Python environment file"

# Check Node Backend
check_dir "node_backend" "Node.js backend directory"
check_file "node_backend/package.json" "Node.js package.json"
check_file "node_backend/src/server.ts" "Node.js server file"

# Check Frontend
check_dir "frontend_main" "frontend directory"
check_file "frontend_main/package.json" "frontend package.json"
check_file "frontend_main/src/App.tsx" "frontend App component"
check_file "frontend_main/.env" "frontend environment file"

# Check Contracts
check_dir "contracts" "Contracts directory"
check_file "contracts/Cargo.toml" "Rust Cargo.toml"
check_file "contracts/src/lib.rs" "Smart contract source"

# Check Integration Files
echo ""
echo "🔗 Checking Integration Files..."
echo ""
check_file "frontend_main/src/services/api.ts" "API service"
check_file "frontend_main/src/context/PaymentContext.tsx" "Payment context"
check_file "frontend_main/src/context/ResponsibleGamblingContext.tsx" "RG context"
check_file "frontend_main/src/context/WalletContext.tsx" "Wallet context"

# Check Python Services
check_file "python_backend/src/services/payment_service.py" "Payment service"
check_file "python_backend/src/services/wallet_service.py" "Wallet service"
check_file "python_backend/src/services/blockchain_integration_service.py" "Blockchain service"

# Check API Routes
check_file "python_backend/src/api/routes.py" "Main API routes"
check_file "python_backend/src/api/payment_routes.py" "Payment routes"

# Check Configuration Files
echo ""
echo "⚙️  Checking Configuration Files..."
echo ""
check_file "docker-compose.yml" "Docker Compose file"
check_file "start.sh" "Startup script"
check_file "QUICKSTART.md" "Quick start guide"
check_file "INTEGRATION_GUIDE.md" "Integration guide"

# Check if dependencies are installed
echo ""
echo "📚 Checking Dependencies..."
echo ""

if [ -d "python_backend/venv" ]; then
    echo -e "${GREEN}✓${NC} Python virtual environment found"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Python virtual environment not found (run: cd python_backend && python -m venv venv)"
fi

if [ -d "node_backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Node.js backend dependencies installed"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Node.js backend dependencies not installed (run: cd node_backend && npm install)"
fi

if [ -d "frontend_main/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Frontend dependencies not installed (run: cd frontend_main && npm install)"
fi

# Check if services are running
echo ""
echo "🚀 Checking Running Services..."
echo ""

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Python backend is running on port 8000"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Python backend not running (expected on port 8000)"
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 || lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Node.js backend is running"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Node.js backend not running (expected on port 3000 or 3001)"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend is running on port 3000"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Frontend not running (expected on port 3000)"
fi

# Summary
echo ""
echo "=========================================================="
echo "📊 Verification Summary"
echo "=========================================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "🎉 Your installation is complete and ready to use!"
    echo ""
    echo "Next steps:"
    echo "1. Install dependencies if not already done:"
    echo "   cd python_backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    echo "   cd node_backend && npm install"
    echo "   cd Frontend && npm install"
    echo ""
    echo "2. Start the services:"
    echo "   ./start.sh"
    echo ""
    echo "3. Access the application:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8000"
    echo "   API Docs:  http://localhost:8000/docs"
else
    echo -e "${RED}✗ Some checks failed${NC}"
    echo ""
    echo "Please review the errors above and:"
    echo "1. Install missing prerequisites"
    echo "2. Run setup commands for missing components"
    echo "3. Check the QUICKSTART.md for detailed instructions"
fi

echo ""
