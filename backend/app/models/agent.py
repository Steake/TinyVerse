"""
Agent and Skill database models.
"""
from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Agent(Base):
    """
    Agent model representing a TinyPerson in the simulation.
    
    Stores persistent data for agents including their attributes,
    personality traits, interests, and skills.
    """
    __tablename__ = "agents"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    age = Column(Integer, nullable=False)
    occupation = Column(String, nullable=False)
    occupation_description = Column(Text, nullable=True)
    nationality = Column(String, nullable=True)
    country_of_residence = Column(String, nullable=True)
    
    # Store lists as JSON
    personality_traits = Column(JSON, nullable=False, default=list)
    professional_interests = Column(JSON, nullable=False, default=list)
    personal_interests = Column(JSON, nullable=False, default=list)
    
    backstory = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    # State serialization - store TinyPerson state as JSON
    tinytroupe_state = Column(JSON, nullable=True)
    
    # Relationships
    skills = relationship("Skill", back_populates="agent", cascade="all, delete-orphan")
    simulation_logs = relationship("SimulationLog", back_populates="agent", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Agent(id={self.id}, name={self.name}, occupation={self.occupation})>"


class Skill(Base):
    """
    Skill model representing an agent's skill with a proficiency level.
    """
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    agent_id = Column(String, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    level = Column(Integer, nullable=False)  # 0-10 scale
    
    # Relationship
    agent = relationship("Agent", back_populates="skills")
    
    def __repr__(self):
        return f"<Skill(name={self.name}, level={self.level})>"
