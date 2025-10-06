"""
TinyVerse Backend - FastAPI Application

This is the main entry point for the TinyVerse backend API, which integrates
TinyTroupe for AI agent simulation.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import agents_router, simulation_router
from app.schemas import HealthCheck


# Create FastAPI application
app = FastAPI(
    title="TinyVerse Backend API",
    description="Backend API for TinyVerse using TinyTroupe for agent simulation",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents_router, prefix="/api")
app.include_router(simulation_router, prefix="/api")


@app.get("/", response_model=HealthCheck)
async def health_check():
    """
    Health check endpoint.
    
    Returns the API status and TinyTroupe availability.
    """
    try:
        import tinytroupe
        tinytroupe_available = True
    except ImportError:
        tinytroupe_available = False
    
    return HealthCheck(
        status="healthy",
        version="0.1.0",
        tinytroupe_available=tinytroupe_available,
    )


@app.get("/api/health")
async def api_health():
    """API health check."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
    )
