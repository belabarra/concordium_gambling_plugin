#!/bin/bash

# Startup script for Concordium Gambling Plugin

echo "🚀 Starting Concordium Gambling Plugin..."
echo "========================================"

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🐳 Docker detected. Starting with Docker Compose..."
    docker-compose up -d
    echo "✅ Services started!"
    echo ""
    echo "📊 Access the application:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8000"
    echo "   API Docs:  http://localhost:8000/docs"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop: docker-compose down"
else
    echo "🔧 Docker not found. Starting services manually..."
    echo ""
    
    # Start PostgreSQL database
    echo "📦 Starting PostgreSQL..."
    if command -v psql &> /dev/null; then
        echo "✅ PostgreSQL found"
    else
        echo "❌ PostgreSQL not found. Please install PostgreSQL first."
        exit 1
    fi
    
    # Start Python backend
    echo ""
    echo "🐍 Starting Python Backend..."
    cd python-backend
    
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    pip install -q -r requirements.txt
    
    # Start backend in background
    uvicorn src.main:app --host 0.0.0.0 --port 8000 &
    PYTHON_PID=$!
    echo "✅ Python backend started (PID: $PYTHON_PID)"
    cd ..
    
    # Start Node.js backend
    echo ""
    echo "📦 Starting Node.js Backend..."
    cd node-backend
    
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    npm run dev &
    NODE_PID=$!
    echo "✅ Node.js backend started (PID: $NODE_PID)"
    cd ..
    
    # Start Frontend
    echo ""
    echo "⚛️  Starting Frontend..."
    cd Frontend
    
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    npm start &
    FRONTEND_PID=$!
    echo "✅ Frontend started (PID: $FRONTEND_PID)"
    cd ..
    
    echo ""
    echo "========================================"
    echo "✅ All services started successfully!"
    echo ""
    echo "📊 Access the application:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8000"
    echo "   API Docs:  http://localhost:8000/docs"
    echo ""
    echo "Process IDs:"
    echo "   Python:    $PYTHON_PID"
    echo "   Node.js:   $NODE_PID"
    echo "   Frontend:  $FRONTEND_PID"
    echo ""
    echo "To stop all services, run:"
    echo "   kill $PYTHON_PID $NODE_PID $FRONTEND_PID"
    echo ""
    
    # Save PIDs to file for easy cleanup
    echo "$PYTHON_PID" > .pids
    echo "$NODE_PID" >> .pids
    echo "$FRONTEND_PID" >> .pids
    
    # Wait for user interrupt
    echo "Press Ctrl+C to stop all services..."
    trap "kill $PYTHON_PID $NODE_PID $FRONTEND_PID 2>/dev/null; echo 'Services stopped.'; exit 0" INT
    wait
fi
