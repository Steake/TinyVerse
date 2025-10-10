"""TinyVerse Backend API."""
from .agents import router as agents_router
from .simulation import router as simulation_router
from .locations import router as locations_router
from .websocket import router as websocket_router
from .world import router as world_router
from .autofill import router as autofill_router
from .admin import router as admin_router

__all__ = [
	"agents_router",
	"simulation_router",
	"locations_router",
	"websocket_router",
	"world_router",
	"autofill_router",
	"admin_router",
]
