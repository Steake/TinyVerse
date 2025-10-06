"""
Pydantic schemas for API request/response models.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class SkillCreate(BaseModel):
    """Skill creation schema."""
    name: str
    level: int = Field(ge=0, le=10)


class Skill(SkillCreate):
    """Skill schema."""
    pass


class AgentCreate(BaseModel):
    """Agent creation schema."""
    name: str
    age: int = Field(gt=0)
    occupation: str
    occupation_description: Optional[str] = None
    nationality: Optional[str] = None
    country_of_residence: Optional[str] = None
    personality_traits: List[str] = Field(default_factory=list)
    professional_interests: List[str] = Field(default_factory=list)
    personal_interests: List[str] = Field(default_factory=list)
    skills: List[SkillCreate] = Field(default_factory=list)
    backstory: Optional[str] = None


class Agent(AgentCreate):
    """Agent response schema."""
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class AgentUpdate(BaseModel):
    """Agent update schema."""
    name: Optional[str] = None
    age: Optional[int] = Field(None, gt=0)
    occupation: Optional[str] = None
    occupation_description: Optional[str] = None
    personality_traits: Optional[List[str]] = None
    professional_interests: Optional[List[str]] = None
    personal_interests: Optional[List[str]] = None
    skills: Optional[List[SkillCreate]] = None
    backstory: Optional[str] = None


class LocationCreate(BaseModel):
    """Location creation schema."""
    name: str
    description: Optional[str] = None
    location_type: str = "room"


class Location(LocationCreate):
    """Location response schema."""
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class SimulationControl(BaseModel):
    """Simulation control schema."""
    action: str = Field(..., pattern="^(start|pause|stop|step)$")
    steps: Optional[int] = Field(1, gt=0)


class SimulationState(BaseModel):
    """Simulation state response."""
    is_running: bool
    current_step: int
    agents_count: int
    world_name: str


class SimulationLog(BaseModel):
    """Simulation log entry."""
    timestamp: datetime
    agent_id: Optional[str]
    agent_name: Optional[str]
    action_type: str
    content: str
    metadata: Optional[Dict[str, Any]] = None


class HealthCheck(BaseModel):
    """Health check response."""
    status: str
    version: str
    tinytroupe_available: bool
