"""
Agent API endpoints.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas import Agent, AgentCreate, AgentUpdate
from app.services import adapter


router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("", response_model=Agent, status_code=status.HTTP_201_CREATED)
async def create_agent(agent: AgentCreate):
    """
    Create a new agent using TinyTroupe.
    
    This endpoint creates a TinyPerson in TinyTroupe with the specified attributes.
    """
    try:
        agent_data = adapter.create_agent(agent.model_dump())
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
    return None
