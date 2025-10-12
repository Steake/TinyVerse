"""
Location database model.
"""
from sqlalchemy import Column, String, Text, DateTime, Float
from datetime import datetime
from app.database import Base


class Location(Base):
    """Location database model."""
    
    __tablename__ = "locations"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    location_type = Column(String, default="room")  # room, building, outdoor, etc.
    
    # Position and dimensions for map visualization
    x = Column(Float, default=0.0)
    y = Column(Float, default=0.0)
    width = Column(Float, default=100.0)
    height = Column(Float, default=100.0)
    image = Column(String, nullable=True)  # Optional background image
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

