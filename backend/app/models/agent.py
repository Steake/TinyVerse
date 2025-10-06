"""
Agent database model.
"""
from sqlalchemy import Column, String, Integer, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Agent(Base):
    """Agent database model."""
    
    __tablename__ = "agents"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    age = Column(Integer, nullable=True)
    occupation = Column(String, nullable=True)
    occupation_description = Column(Text, nullable=True)
    personality_traits = Column(JSON, default=list)  # List of strings
    professional_interests = Column(JSON, default=list)  # List of strings
    personal_interests = Column(JSON, default=list)  # List of strings
    backstory = Column(Text, nullable=True)
    
    # TinyTroupe state
    tinytroupe_state = Column(JSON, nullable=True)  # Serialized TinyPerson state
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    skills = relationship("Skill", back_populates="agent", cascade="all, delete-orphan")


class Skill(Base):
    """Skill database model."""
    
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    agent_id = Column(String, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    level = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    
    # Relationship
    agent = relationship("Agent", back_populates="skills")
