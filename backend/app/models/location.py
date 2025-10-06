"""
Location database model.
"""
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Location(Base):
    """
    Location model representing a place in the TinyVerse simulation.
    
    Locations can be rooms, buildings, or other spaces where agents interact.
    """
    __tablename__ = "locations"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    location_type = Column(String, nullable=False, default="room")  # room, building, outdoor, etc.
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    def __repr__(self):
        return f"<Location(id={self.id}, name={self.name}, type={self.location_type})>"
