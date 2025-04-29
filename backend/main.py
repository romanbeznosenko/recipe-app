from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.setup_models import init_models

from routers.user_router import router as user_router

init_models()

app = FastAPI(
    title="Recipe App API",
    description="API for managing recipes and users",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)


@app.get("/")
def read_root():
    """
    Root endpoint to confirm API is running
    """
    return {"message": "Welcome to Recipe App API"}


@app.get("/health")
def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
