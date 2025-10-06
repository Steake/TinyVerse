"""
World API endpoints for locations and connections.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas import (
    Location,
    LocationCreate,
    LocationUpdate,
    Connection,
    ConnectionCreate,
)
from app.services import adapter


router = APIRouter(prefix="/locations", tags=["world"])


@router.get("", response_model=List[Location])
async def list_locations():
    """
    Retrieve all locations.
    
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


@router.post("", response_model=Location, status_code=status.HTTP_201_CREATED)
async def create_location(location: LocationCreate):
    """
    Create a new location.
    
    Creates a new location in the world.
    """
    try:
        location_data = adapter.create_location(location.model_dump())
        return location_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create location: {str(e)}"
        )


@router.patch("/{location_id}", response_model=Location)
async def update_location(location_id: str, location_update: LocationUpdate):
    """
    Update an existing location.
    
    Updates location attributes. Only provided fields will be updated.
    """
    try:
        updated_location = adapter.update_location(
            location_id, 
            location_update.model_dump(exclude_unset=True)
        )
        if not updated_location:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Location {location_id} not found"
            )
        return updated_location
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update location: {str(e)}"
        )


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
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


# Connection endpoints
connections_router = APIRouter(prefix="/connections", tags=["world"])


@connections_router.get("", response_model=List[Connection])
async def list_connections():
    """
    Retrieve all connections between locations.
    
    Returns all connections in the world.
    """
    try:
        connections = adapter.list_connections()
        return connections
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list connections: {str(e)}"
        )


@connections_router.post("", response_model=Connection, status_code=status.HTTP_201_CREATED)
async def create_connection(connection: ConnectionCreate):
    """
    Create a new connection between locations.
    
    Creates a connection linking two locations.
    """
    try:
        connection_data = adapter.create_connection(connection.model_dump())
        return connection_data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create connection: {str(e)}"
        )


@connections_router.delete("/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
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
