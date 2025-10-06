"""
Simulation database models.
"""
from sqlalchemy import Column, String, Text, DateTime, Integer, Boolean, JSON
from datetime import datetime
from app.database import Base


class SimulationRun(Base):
    """Simulation run database model."""
    
    __tablename__ = "simulation_runs"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=True)
    status = Column(String, default="created")  # created, running, paused, completed, failed
    current_step = Column(Integer, default=0)
    total_steps = Column(Integer, nullable=True)
    
    # Simulation state
    world_state = Column(JSON, nullable=True)  # Serialized TinyWorld state
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SimulationEvent(Base):
    """Simulation event/log database model."""
    
    __tablename__ = "simulation_events"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    simulation_run_id = Column(String, index=True, nullable=True)
    
    # Event details
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    agent_id = Column(String, nullable=True, index=True)
    agent_name = Column(String, nullable=True)
    action_type = Column(String, nullable=False)  # action, interaction, thought, etc.
    content = Column(Text, nullable=False)
    event_metadata = Column(JSON, nullable=True)  # Renamed from 'metadata' to avoid SQLAlchemy conflict

