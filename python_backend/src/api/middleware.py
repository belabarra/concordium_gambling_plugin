from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import logging
import time

# Set up logging
logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all requests"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url.path}")
        
        try:
            response = await call_next(request)
            
            # Log response time
            process_time = time.time() - start_time
            logger.info(f"Completed: {request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
            
            return response
        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")
            raise

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware to handle errors globally"""
    
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            logger.error(f"Unhandled error: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": "An internal error occurred"}
            )

def validate_token(token: str) -> bool:
    """Validate authentication token"""
    # TODO: Implement actual token validation logic
    # For now, accept any non-empty token
    return bool(token)

# Example of how to add middleware to FastAPI app:
# from fastapi import FastAPI
# app = FastAPI()
# app.add_middleware(LoggingMiddleware)
# app.add_middleware(ErrorHandlingMiddleware)