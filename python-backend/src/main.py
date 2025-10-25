from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import uvicorn

from src.api.routes import api_router
from src.api.middleware import LoggingMiddleware, ErrorHandlingMiddleware
from src.config.settings import settings
from src.config.database import init_db

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup"""
    logger.info("Starting Responsible Gambling Tool and Services...")
    
    # Initialize database
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
    
    # Log configuration
    logger.info(f"Server running on {settings.HOST}:{settings.PORT}")
    logger.info(f"Concordium service URL: {settings.CONCORDIUM_SERVICE_URL}")
    logger.info(f"Database: {settings.DATABASE_URL}")
    
    yield
    
    # Cleanup on shutdown
    logger.info("Shutting down Responsible Gambling Tool and Services...")

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(ErrorHandlingMiddleware)

# Include the API routes
app.include_router(api_router)

@app.get("/")
def read_root():
    """Root endpoint with service information"""
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running",
        "documentation": "/docs",
        "health_check": "/api/v1/health",
        "concordium_service": settings.CONCORDIUM_SERVICE_URL
    }

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )