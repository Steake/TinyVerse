"""
Location API endpoints.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime
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
        location_data = adapter.create_location(location.model_dump())
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
    
    Returns all locations in the simulation.
    """
    try:
        return adapter.list_locations()
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
    location = adapter.get_location(location_id)
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location {location_id} not found"
        )
    return location


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(location_id: str):
    """
    Delete a location.
    
    Removes the location from the simulation.
    """
    if not adapter.delete_location(location_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location {location_id} not found"
        )
    return None
