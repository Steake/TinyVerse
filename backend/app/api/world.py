"""
World API endpoints for locations and connections.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas import Location, LocationCreate, LocationUpdate, Connection, ConnectionCreate
from app.services import adapter


router = APIRouter(prefix="", tags=["world"])


@router.get("/locations", response_model=List[Location])
async def list_locations():
    """
    List all locations.
    
    Returns all locations in the world.
    """
    try:
        locations = adapter.list_locations()
        return locations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list locations: {str(e)}"
        )


@router.post("/locations", response_model=Location, status_code=status.HTTP_201_CREATED)
async def create_location(location: LocationCreate):
    """
    Create a new location.
    
    This endpoint creates a new location in the world.
    """
    try:
        location_data = adapter.create_location(location.model_dump())
        return location_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create location: {str(e)}"
        )


@router.patch("/locations/{location_id}", response_model=Location)
async def update_location(location_id: str, location: LocationUpdate):
    """
    Update an existing location.
    
    Updates the specified location with new values.
    """
    updated_location = adapter.update_location(location_id, location.model_dump(exclude_unset=True))
    if not updated_location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location {location_id} not found"
        )
    return updated_location


@router.delete("/locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(location_id: str):
    """
    Delete a location.
    
    Removes the location from the world.
    """
    if not adapter.delete_location(location_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location {location_id} not found"
        )
    return None


@router.get("/connections", response_model=List[Connection])
async def list_connections():
    """
    List all connections.
    
    Returns all connections between locations.
    """
    try:
        connections = adapter.list_connections()
        return connections
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list connections: {str(e)}"
        )


@router.post("/connections", response_model=Connection, status_code=status.HTTP_201_CREATED)
async def create_connection(connection: ConnectionCreate):
    """
    Create a new connection.
    
    This endpoint creates a new connection between two locations.
    """
    try:
        connection_data = adapter.create_connection(connection.model_dump())
        return connection_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create connection: {str(e)}"
        )


@router.delete("/connections/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connection(connection_id: str):
    """
    Delete a connection.
    
    Removes the connection between locations.
    """
    if not adapter.delete_connection(connection_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Connection {connection_id} not found"
        )
    return None
