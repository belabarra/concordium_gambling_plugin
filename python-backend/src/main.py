from fastapi import FastAPI
from src.api.routes import api_router
from src.config.settings import settings

app = FastAPI(title="Responsible Gambling Tool and Services")

# Include the API routes
app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Responsible Gambling Tool and Services API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)