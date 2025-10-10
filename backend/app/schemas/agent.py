"""
Pydantic schemas for API request/response models.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal, Union
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
    type: str = Field(default="room", pattern="^(room|outdoor|special)$")
    description: Optional[str] = None
    x: float = 0
    y: float = 0
    width: float = 100
    height: float = 100
    image: Optional[str] = None


class Location(LocationCreate):
    """Location response schema."""
    id: str
    
    class Config:
        from_attributes = True


class LocationUpdate(BaseModel):
    """Location update schema."""
    name: Optional[str] = None
    type: Optional[str] = Field(None, pattern="^(room|outdoor|special)$")
    description: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    image: Optional[str] = None


class ConnectionCreate(BaseModel):
    """Connection creation schema."""
    source: str
    target: str
    type: str = Field(default="path", pattern="^(path|door|portal)$")


class Connection(ConnectionCreate):
    """Connection response schema."""
    id: str
    
    class Config:
        from_attributes = True


class SimulationAction(BaseModel):
    """Simulation action schema."""
    type: str = Field(..., pattern="^(MOVE|TALK|INTERACT)$")
    agentId: str
    targetId: Optional[str] = None
    data: Optional[Dict[str, Any]] = Field(default_factory=dict)


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


class SimulationControlResponse(BaseModel):
    """Response payload for simulation control mutations."""
    message: str
    state: SimulationState


class FacultyParameter(BaseModel):
    """Configurable parameter for a mental faculty or tool."""
    id: str
    name: str
    description: Optional[str] = None
    type: Literal['number', 'boolean', 'range', 'select', 'multi-select']
    value: Union[int, float, bool, str, List[str], None] = None
    min: Optional[float] = None
    max: Optional[float] = None
    step: Optional[float] = None
    options: Optional[List[Dict[str, str]]] = None


class MentalFacultyDefinition(BaseModel):
    """Metadata describing a mental faculty capability."""
    key: str
    name: str
    description: str
    type: Literal['memory', 'grounding', 'tool-use']
    parameters: List[FacultyParameter] = Field(default_factory=list)


class MentalFacultyInstance(BaseModel):
    """Mental faculty assigned to an agent."""
    id: str
    agent_id: str
    key: str
    name: str
    description: str
    type: Literal['memory', 'grounding', 'tool-use']
    is_active: bool = True
    parameters: List[FacultyParameter] = Field(default_factory=list)
    created_at: datetime


class MentalFacultyAssignRequest(BaseModel):
    """Request payload to assign a mental faculty to an agent."""
    key: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    activate: bool = True


class MentalFacultyUpdateRequest(BaseModel):
    """Request payload to update an assigned mental faculty."""
    parameters: Optional[Dict[str, Any]] = None
    activate: Optional[bool] = None


class ToolDefinition(BaseModel):
    """Metadata describing an available cognitive tool."""
    key: str
    name: str
    description: str
    capabilities: List[str] = Field(default_factory=list)
    parameters: List[FacultyParameter] = Field(default_factory=list)


class ToolInstance(BaseModel):
    """Tool instance assigned to an agent."""
    id: str
    agent_id: str
    key: str
    name: str
    description: str
    capabilities: List[str] = Field(default_factory=list)
    parameters: List[FacultyParameter] = Field(default_factory=list)
    created_at: datetime


class ToolAssignRequest(BaseModel):
    """Request payload to assign a tool to an agent."""
    key: str
    parameters: Dict[str, Any] = Field(default_factory=dict)


class ToolUpdateRequest(BaseModel):
    """Request payload to update a tool assignment."""
    parameters: Dict[str, Any] = Field(default_factory=dict)


class MemoryEntry(BaseModel):
    """Serialized representation of a memory item."""
    role: Optional[str] = None
    content: str
    type: Optional[str] = None
    simulation_timestamp: Optional[str] = None


class MemoryQuery(BaseModel):
    """Query semantic memory for relevant items."""
    query: str
    top_k: int = Field(default=5, ge=1, le=40)


class MemorySummaryRequest(BaseModel):
    """Request to produce a semantic memory summary."""
    query: str
    batch_size: int = Field(default=20, ge=5, le=100)


class MemoryClearRequest(BaseModel):
    """Request payload to clear portions of episodic memory."""
    max_prefix: Optional[int] = Field(default=None, ge=0)
    max_suffix: Optional[int] = Field(default=None, ge=0)


class MemoryIngestRequest(BaseModel):
    """Request payload for ingesting documents into semantic memory."""
    text: Optional[str] = None
    url: Optional[str] = None
    document_name: Optional[str] = None


class AutofillRequest(BaseModel):
    """LLM-powered autofill request."""
    form: Literal['agent', 'location']
    context: Optional[str] = None
    seed: Optional[Dict[str, Any]] = None


class AutofillAgentResponse(BaseModel):
    """Autofill response for an agent form."""
    form: Literal['agent']
    data: AgentCreate


class AutofillLocationResponse(BaseModel):
    """Autofill response for a location form."""
    form: Literal['location']
    data: LocationCreate


# ------------------------------
# Scenario autofill
# ------------------------------

class ScenarioBeat(BaseModel):
    id: int
    title: str
    description: str
    trigger: str
    blocks_progress: bool = False


class AutofillScenarioRequest(BaseModel):
    context: Optional[str] = None
    seed: Optional[Dict[str, Any]] = None


class AutofillScenarioResponse(BaseModel):
    agents: List[AgentCreate] = Field(default_factory=list)
    locations: List[LocationCreate] = Field(default_factory=list)
    beats: List[ScenarioBeat] = Field(default_factory=list)


class HealthCheck(BaseModel):
    """Health check response."""
    status: str
    version: str
    tinytroupe_available: bool
