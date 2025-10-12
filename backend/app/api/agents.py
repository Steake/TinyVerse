"""
Agent API endpoints.
"""
from fastapi import APIRouter, HTTPException, status, File, UploadFile
from fastapi.responses import StreamingResponse
from typing import Any, Dict, List, Optional
from app.schemas import (
    Agent,
    AgentCreate,
    AgentUpdate,
    MentalFacultyDefinition,
    MentalFacultyInstance,
    MentalFacultyAssignRequest,
    MentalFacultyUpdateRequest,
    ToolDefinition,
    ToolInstance,
    ToolAssignRequest,
    ToolUpdateRequest,
    MemoryEntry,
    MemoryQuery,
    MemorySummaryRequest,
    MemoryClearRequest,
    MemoryIngestRequest,
)
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
    except ValueError as e:
        # Handle validation errors (e.g., duplicate names)
        error_msg = str(e)
        if "already in use" in error_msg.lower() or "duplicate" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Failed to create agent: {error_msg}"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid agent data: {error_msg}"
        )
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


@router.patch("/{agent_id}/location", response_model=Agent)
async def update_agent_location(agent_id: str, location_data: Dict[str, Any]):
    """
    Update agent's current location.
    
    Moves the agent to a specified location and broadcasts the update.
    Expects: { "location_id": "location-123" }
    """
    location_id = location_data.get("location_id")
    
    if not location_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="location_id is required"
        )
    
    # Verify location exists
    from app.database import SessionLocal
    from app.models import Location
    
    db = SessionLocal()
    try:
        location = db.query(Location).filter(Location.id == location_id).first()
        if not location:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Location {location_id} not found"
            )
        
        # Update agent location
        updated_agent = adapter.update_agent(agent_id, {"current_location": location_id})
        if not updated_agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent {agent_id} not found"
            )
        
        # Broadcast movement event with location coordinates
        await broadcast_simulation_event("agent_moved", {
            "agent_id": agent_id,
            "location_id": location_id,
            "position": {"x": location.x, "y": location.y}
        })
        
        return updated_agent
    finally:
        db.close()


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


@router.get("/faculties/definitions", response_model=List[MentalFacultyDefinition])
async def get_faculty_definitions():
    """List all available mental faculty definitions."""
    try:
        return adapter.list_faculty_definitions()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list faculty definitions: {str(e)}"
        )


@router.get("/{agent_id}/faculties", response_model=List[MentalFacultyInstance])
async def list_agent_faculties(agent_id: str):
    """List faculties assigned to an agent."""
    if not adapter.get_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    try:
        return adapter.list_agent_faculties(agent_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list mental faculties: {str(e)}"
        )


@router.post(
    "/{agent_id}/faculties",
    response_model=MentalFacultyInstance,
    status_code=status.HTTP_201_CREATED,
)
async def assign_mental_faculty(agent_id: str, request: MentalFacultyAssignRequest):
    """Assign a mental faculty to an agent."""
    if not adapter.get_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    try:
        return adapter.add_mental_faculty(
            agent_id,
            key=request.key,
            parameters=request.parameters,
            activate=request.activate,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign mental faculty: {str(e)}"
        )


@router.patch(
    "/{agent_id}/faculties/{faculty_id}",
    response_model=MentalFacultyInstance,
)
async def update_mental_faculty(
    agent_id: str,
    faculty_id: str,
    request: MentalFacultyUpdateRequest,
):
    """Update an assigned mental faculty."""
    if not adapter.get_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    try:
        return adapter.update_mental_faculty(
            agent_id,
            faculty_id,
            parameters=request.parameters,
            activate=request.activate,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update mental faculty: {str(e)}"
        )


@router.delete("/{agent_id}/faculties/{faculty_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mental_faculty(agent_id: str, faculty_id: str):
    """Remove an assigned mental faculty."""
    if not adapter.get_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    try:
        removed = adapter.remove_mental_faculty(agent_id, faculty_id)
        if not removed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Faculty {faculty_id} not found for agent {agent_id}",
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete mental faculty: {str(e)}"
        )
    return None


@router.get("/tools/definitions", response_model=List[ToolDefinition])
async def get_tool_definitions():
    """List available cognitive tools."""
    try:
        return adapter.list_tool_definitions()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list tool definitions: {str(e)}"
        )


@router.get("/{agent_id}/tools", response_model=List[ToolInstance])
async def list_agent_tools(agent_id: str):
    """List tools assigned to an agent."""
    if not adapter.get_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    try:
        return adapter.list_agent_tools(agent_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list tools: {str(e)}"
        )


@router.post(
    "/{agent_id}/tools",
    response_model=ToolInstance,
    status_code=status.HTTP_201_CREATED,
)
async def assign_tool(agent_id: str, request: ToolAssignRequest):
    """Assign a tool to an agent."""
    if not adapter.get_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    try:
        return adapter.assign_tool(
            agent_id,
            key=request.key,
            parameters=request.parameters,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign tool: {str(e)}"
        )


@router.patch(
    "/{agent_id}/tools/{tool_id}",
    response_model=ToolInstance,
)
async def update_tool(agent_id: str, tool_id: str, request: ToolUpdateRequest):
    """Update a tool assignment."""
    if not adapter.get_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    try:
        return adapter.update_tool(
            agent_id,
            tool_id,
            parameters=request.parameters,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update tool: {str(e)}"
        )


@router.delete("/{agent_id}/tools/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tool(agent_id: str, tool_id: str):
    """Remove a tool from an agent."""
    if not adapter.get_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    try:
        removed = adapter.remove_tool(agent_id, tool_id)
        if not removed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tool {tool_id} not found for agent {agent_id}",
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete tool: {str(e)}"
        )
    return None


@router.get("/{agent_id}/memory/episodic", response_model=List[MemoryEntry])
async def get_episodic_memory(
    agent_id: str,
    first_n: Optional[int] = None,
    last_n: Optional[int] = None,
    item_type: Optional[str] = None,
    include_omission_info: bool = True,
):
    """Retrieve episodic memory slices."""
    if not adapter.get_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    try:
        return adapter.get_episodic_memory(
            agent_id,
            first_n=first_n,
            last_n=last_n,
            item_type=item_type,
            include_omission_info=include_omission_info,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve episodic memory: {str(e)}"
        )


@router.post("/{agent_id}/memory/episodic/clear", status_code=status.HTTP_204_NO_CONTENT)
async def clear_episodic_memory(agent_id: str, request: MemoryClearRequest):
    """Clear portions of episodic memory."""
    if not adapter.get_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    try:
        adapter.clear_episodic_memory(
            agent_id,
            max_prefix=request.max_prefix,
            max_suffix=request.max_suffix,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear episodic memory: {str(e)}"
        )
    return None


@router.get("/{agent_id}/memory/semantic", response_model=List[MemoryEntry])
async def get_semantic_memory(
    agent_id: str,
    limit: Optional[int] = None,
    item_type: Optional[str] = None,
):
    """Retrieve semantic memory entries."""
    if not adapter.get_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    try:
        return adapter.get_semantic_memory(
            agent_id,
            limit=limit,
            item_type=item_type,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve semantic memory: {str(e)}"
        )


@router.post("/{agent_id}/memory/semantic/query")
async def query_semantic_memory(agent_id: str, request: MemoryQuery):
    """Query semantic memory for relevant entries."""
    if not adapter.get_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    try:
        matches = adapter.query_semantic_memory(
            agent_id,
            query=request.query,
            top_k=request.top_k,
        )
        return {"matches": matches}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query semantic memory: {str(e)}"
        )


@router.post("/{agent_id}/memory/semantic/summarize")
async def summarize_semantic_memory(agent_id: str, request: MemorySummaryRequest):
    """Produce a semantic memory summary."""
    if not adapter.get_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    try:
        summary = adapter.summarize_semantic_memory(
            agent_id,
            query=request.query,
            batch_size=request.batch_size,
        )
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to summarize semantic memory: {str(e)}"
        )


@router.post("/{agent_id}/memory/semantic/ingest", status_code=status.HTTP_201_CREATED)
async def ingest_semantic_memory(agent_id: str, request: MemoryIngestRequest):
    """Ingest new content into semantic memory."""
    if not adapter.get_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    try:
        adapter.ingest_semantic_memory(
            agent_id,
            text=request.text,
            url=request.url,
            document_name=request.document_name,
        )
        return {"status": "ingested"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest semantic memory: {str(e)}"
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
