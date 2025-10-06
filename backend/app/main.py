"""
TinyVerse Backend - FastAPI Application

This is the main entry point for the TinyVerse backend API, which integrates
TinyTroupe for AI agent simulation.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import agents_router, simulation_router, locations_router, websocket_router
from app.api.config import router as config_router
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
app.include_router(locations_router, prefix="/api")
app.include_router(websocket_router)  # WebSocket doesn't need /api prefix
app.include_router(config_router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    """Initialize custom OpenAI client on startup."""
    try:
        from app.services.custom_openai_client import setup_custom_openai_client
        
        # Setup custom OpenAI client with base URL if configured
        base_url = settings.openai_api_base_url if settings.openai_api_base_url else None
        setup_custom_openai_client(base_url=base_url)
        print(f"Custom OpenAI client initialized with base_url: {base_url or 'default'}")
    except Exception as e:
        print(f"Warning: Could not initialize custom OpenAI client: {e}")
        print("TinyTroupe will use default OpenAI client configuration")


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
