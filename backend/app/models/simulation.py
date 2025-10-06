"""
Simulation-related database models.
"""
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class SimulationLog(Base):
    """
    Simulation log model for tracking agent actions and events.
    
    Stores a record of all actions, interactions, and events that occur
    during the simulation.
    """
    __tablename__ = "simulation_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Agent reference (nullable for world-level events)
    agent_id = Column(String, ForeignKey("agents.id", ondelete="SET NULL"), nullable=True)
    agent_name = Column(String, nullable=True)
    
    # Event details
    action_type = Column(String, nullable=False, index=True)  # action, speech, thought, interaction
    content = Column(Text, nullable=False)
    
    # Additional metadata stored as JSON
    metadata = Column(JSON, nullable=True)
    
    # Step tracking
    simulation_step = Column(Integer, nullable=True)
    
    # Relationship
    agent = relationship("Agent", back_populates="simulation_logs")
    
    def __repr__(self):
        return f"<SimulationLog(id={self.id}, agent={self.agent_name}, type={self.action_type})>"


class Relationship(Base):
    """
    Relationship model for tracking connections between agents.
    
    Represents social connections, friendships, or other relationships
    between agents in the simulation.
    """
    __tablename__ = "relationships"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Source and target agents
    source_agent_id = Column(String, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    target_agent_id = Column(String, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    
    # Relationship details
    relationship_type = Column(String, nullable=False)  # friend, colleague, family, etc.
    strength = Column(Integer, nullable=True)  # 0-10 scale for relationship strength
    description = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    def __repr__(self):
        return f"<Relationship(source={self.source_agent_id}, target={self.target_agent_id}, type={self.relationship_type})>"


class Routine(Base):
    """
    Routine model for defining agent schedules and recurring behaviors.
    
    Represents daily routines, schedules, or recurring activities for agents.
    """
    __tablename__ = "routines"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    agent_id = Column(String, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    
    # Routine details
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Timing information (stored as JSON for flexibility)
    schedule = Column(JSON, nullable=True)  # e.g., {"days": ["monday", "wednesday"], "time": "09:00"}
    
    # Activity details
    activity_type = Column(String, nullable=True)
    location_id = Column(String, ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    
    # Status
    is_active = Column(Integer, nullable=False, default=1)  # SQLite uses 0/1 for boolean
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    def __repr__(self):
        return f"<Routine(id={self.id}, agent={self.agent_id}, name={self.name})>"
