@echo off
echo Starting Concordium Gambling Plugin...
echo ========================================

REM Check if Docker is available
where docker >nul 2>nul
if %errorlevel% == 0 (
    echo Docker detected. Starting with Docker Compose...
    docker-compose up -d
    echo Services started!
    echo.
    echo Access the application:
    echo    Frontend:  http://localhost:3000
    echo    Backend:   http://localhost:8000
    echo    API Docs:  http://localhost:8000/docs
    echo.
    echo To view logs: docker-compose logs -f
    echo To stop: docker-compose down
) else (
    echo Docker not found. Starting services manually...
    echo.
    
    REM Start Python backend
    echo Starting Python Backend...
    cd python-backend
    
    if not exist venv (
        echo Creating virtual environment...
        python -m venv venv
    )
    
    call venv\Scripts\activate.bat
    pip install -q -r requirements.txt
    start "Python Backend" cmd /k uvicorn src.main:app --host 0.0.0.0 --port 8000
    cd ..
    
    REM Start Node.js backend
    echo.
    echo Starting Node.js Backend...
    cd node-backend
    
    if not exist node_modules (
        echo Installing dependencies...
        npm install
    )
    
    start "Node.js Backend" cmd /k npm run dev
    cd ..
    
    REM Start Frontend
    echo.
    echo Starting Frontend...
    cd Frontend
    
    if not exist node_modules (
        echo Installing dependencies...
        npm install
    )
    
    start "Frontend" cmd /k npm start
    cd ..
    
    echo.
    echo ========================================
    echo All services started successfully!
    echo.
    echo Access the application:
    echo    Frontend:  http://localhost:3000
    echo    Backend:   http://localhost:8000
    echo    API Docs:  http://localhost:8000/docs
    echo.
    echo Close the terminal windows to stop the services
)
