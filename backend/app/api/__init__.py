"""TinyVerse Backend API."""
from .agents import router as agents_router
from .simulation import router as simulation_router
from .world import router as world_router

__all__ = ["agents_router", "simulation_router", "world_router"]
