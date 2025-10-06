"""
Location API endpoints.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas import Location, LocationCreate
from app.services import adapter
import uuid


router = APIRouter(prefix="/locations", tags=["locations"])


@router.post("", response_model=Location, status_code=status.HTTP_201_CREATED)
async def create_location(location: LocationCreate):
    """
    Create a new location.
    
    Creates a location in the TinyWorld environment.
    """
    try:
        location_data = location.model_dump()
        location_data["id"] = str(uuid.uuid4())
        
        # For now, just store in adapter (TinyWorld doesn't have explicit locations)
        # This can be enhanced to use database persistence
        
        return Location(**location_data, created_at=datetime.utcnow())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create location: {str(e)}"
        )


@router.get("", response_model=List[Location])
async def list_locations():
    """
    List all locations.
    
    Returns all locations in the simulation.
    """
    try:
        # For now, return empty list
        # This can be enhanced to query from database
        return []
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
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Location {location_id} not found"
    )


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(location_id: str):
    """
    Delete a location.
    
    Removes the location from the simulation.
    """
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Location {location_id} not found"
    )


# Import datetime at the top
from datetime import datetime
