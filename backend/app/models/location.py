"""
Location database model.
"""
from sqlalchemy import Column, String, Text, DateTime
from datetime import datetime
from app.database import Base


class Location(Base):
    """Location database model."""
    
    __tablename__ = "locations"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    location_type = Column(String, default="room")  # room, building, outdoor, etc.
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
