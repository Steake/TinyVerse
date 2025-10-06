"""
Agent API endpoints.
"""
from fastapi import APIRouter, HTTPException, status, File, UploadFile
from fastapi.responses import StreamingResponse
from typing import List
from app.schemas import Agent, AgentCreate, AgentUpdate
from app.services import adapter
from app.api.websocket import broadcast_simulation_event
import json
import io


router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("", response_model=Agent, status_code=status.HTTP_201_CREATED)
async def create_agent(agent: AgentCreate):
    """
    Create a new agent using TinyTroupe.
    
    This endpoint creates a TinyPerson in TinyTroupe with the specified attributes.
    """
    try:
        agent_data = adapter.create_agent(agent.model_dump())
        
        # Broadcast event to WebSocket clients
        await broadcast_simulation_event("agent_created", {
            "agent_id": agent_data["id"],
            "agent_name": agent_data["name"]
        })
        
        return agent_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create agent: {str(e)}"
        )


@router.get("", response_model=List[Agent])
async def list_agents():
    """
    List all agents.
    
    Returns all TinyPerson agents currently in the simulation.
    """
    try:
        agents = adapter.list_agents()
        return agents
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list agents: {str(e)}"
        )


@router.get("/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str):
    """
    Get agent details by ID.
    
    Returns detailed information about a specific agent.
    """
    agent = adapter.get_agent(agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    return agent


@router.patch("/{agent_id}", response_model=Agent)
async def update_agent(agent_id: str, agent: AgentUpdate):
    """
    Update an existing agent.
    
    Updates the specified agent with new values.
    """
    updated_agent = adapter.update_agent(agent_id, agent.model_dump(exclude_unset=True))
    if not updated_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    return updated_agent


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(agent_id: str):
    """
    Delete an agent.
    
    Removes the agent from the simulation.
    """
    if not adapter.delete_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    
    # Broadcast event to WebSocket clients
    await broadcast_simulation_event("agent_deleted", {
        "agent_id": agent_id
    })
    
    return None


@router.post("/import", response_model=List[Agent], status_code=status.HTTP_201_CREATED)
async def bulk_import_agents(file: UploadFile = File(...)):
    """
    Bulk import agents from JSON file.
    
    Accepts a JSON file with an array of agent definitions.
    """
    try:
        content = await file.read()
        agents_data = json.loads(content)
        
        if not isinstance(agents_data, list):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must contain a JSON array of agents"
            )
        
        created_agents = []
        for agent_data in agents_data:
            try:
                agent = adapter.create_agent(agent_data)
                created_agents.append(agent)
            except Exception as e:
                # Log error but continue with other agents
                print(f"Failed to import agent: {str(e)}")
        
        await broadcast_simulation_event("agents_imported", {
            "count": len(created_agents)
        })
        
        return created_agents
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON file"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import agents: {str(e)}"
        )


@router.get("/export")
async def bulk_export_agents():
    """
    Bulk export all agents to JSON file.
    
    Returns a downloadable JSON file with all agents.
    """
    try:
        agents = adapter.list_agents()
        
        # Convert to JSON string
        json_str = json.dumps(agents, indent=2, default=str)
        
        # Create in-memory file
        json_bytes = io.BytesIO(json_str.encode('utf-8'))
        
        return StreamingResponse(
            json_bytes,
            media_type="application/json",
            headers={
                "Content-Disposition": "attachment; filename=agents_export.json"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export agents: {str(e)}"
        )


@router.post("/{agent_id}/relationships", status_code=status.HTTP_201_CREATED)
async def add_relationship(agent_id: str, relationship: dict):
    """
    Add a relationship to an agent.
    
    Creates a relationship between the specified agent and another agent.
    """
    agent = adapter.get_agent(agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    
    try:
        updated_agent = adapter.add_relationship(agent_id, relationship)
        return updated_agent
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add relationship: {str(e)}"
        )


@router.delete("/{agent_id}/relationships/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_relationship(agent_id: str, target_id: str):
    """
    Remove a relationship from an agent.
    
    Removes the relationship between the specified agent and the target agent.
    """
    if not adapter.remove_relationship(agent_id, target_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Relationship not found"
        )
    
    return None
