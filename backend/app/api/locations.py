"""
Location API endpoints.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas import Location, LocationCreate


router = APIRouter(prefix="/locations", tags=["locations"])


# In-memory storage for locations (for now)
# In a full implementation, this would be handled by the TinyTroupe adapter
locations_storage = {}


@router.post("", response_model=Location, status_code=status.HTTP_201_CREATED)
async def create_location(location: LocationCreate):
    """
    Create a new location.
    
    Locations represent places in the TinyWorld where agents can interact.
    """
    try:
        import uuid
        from datetime import datetime
        
        location_id = str(uuid.uuid4())
        location_data = {
            "id": location_id,
            **location.model_dump(),
            "created_at": datetime.utcnow(),
        }
        locations_storage[location_id] = location_data
        
        return location_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create location: {str(e)}"
        )


@router.get("", response_model=List[Location])
async def list_locations():
    """
    List all locations.
    
    Returns all locations currently in the simulation world.
    """
    try:
        return list(locations_storage.values())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list locations: {str(e)}"
        )


@router.get("/{location_id}", response_model=Location)
async def get_location(location_id: str):
    """
    Get location details by ID.
    
    Returns detailed information about a specific location.
    """
    if location_id not in locations_storage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location {location_id} not found"
        )
    return locations_storage[location_id]


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(location_id: str):
    """
    Delete a location.
    
    Removes the location from the simulation world.
    """
    if location_id not in locations_storage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location {location_id} not found"
        )
    del locations_storage[location_id]
    return None
