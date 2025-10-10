"""
Database service layer for persisting simulation state.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
import json
from sqlalchemy.orm import Session
from app.models.agent import Agent as AgentModel, Skill as SkillModel
from app.models.location import Location as LocationModel
from app.models.simulation import SimulationRun, SimulationEvent


class DatabaseService:
    """Service for database operations."""
    
    @staticmethod
    def save_agent(db: Session, agent_data: Dict[str, Any]) -> AgentModel:
        """
        Save or update an agent in the database.
        
        Args:
            db: Database session
            agent_data: Agent data dictionary
            
        Returns:
            Saved agent model
        """
        agent_id = agent_data.get("id")
        
        # Check if agent exists
        existing = db.query(AgentModel).filter(AgentModel.id == agent_id).first()
        
        if existing:
            # Update existing agent
            for key, value in agent_data.items():
                if key != "skills" and hasattr(existing, key):
                    setattr(existing, key, value)
            existing.updated_at = datetime.utcnow()
            agent = existing
        else:
            # Create new agent
            skills = agent_data.pop("skills", [])
            agent = AgentModel(**agent_data)
            db.add(agent)
            
            # Add skills
            for skill_data in skills:
                skill = SkillModel(
                    agent_id=agent_id,
                    name=skill_data.get("name"),
                    level=skill_data.get("level"),
                    description=skill_data.get("description")
                )
                db.add(skill)
        
        db.commit()
        db.refresh(agent)
        return agent
    
    @staticmethod
    def get_agent(db: Session, agent_id: str) -> Optional[AgentModel]:
        """Get an agent by ID."""
        return db.query(AgentModel).filter(AgentModel.id == agent_id).first()
    
    @staticmethod
    def list_agents(db: Session) -> List[AgentModel]:
        """List all agents."""
        return db.query(AgentModel).all()
    
    @staticmethod
    def delete_agent(db: Session, agent_id: str) -> bool:
        """Delete an agent."""
        agent = db.query(AgentModel).filter(AgentModel.id == agent_id).first()
        if agent:
            db.delete(agent)
            db.commit()
            return True
        return False
    
    @staticmethod
    def save_location(db: Session, location_data: Dict[str, Any]) -> LocationModel:
        """Save a location to the database."""
        location = LocationModel(**location_data)
        db.add(location)
        db.commit()
        db.refresh(location)
        return location
    
    @staticmethod
    def get_location(db: Session, location_id: str) -> Optional[LocationModel]:
        """Get a location by ID."""
        return db.query(LocationModel).filter(LocationModel.id == location_id).first()
    
    @staticmethod
    def list_locations(db: Session) -> List[LocationModel]:
        """List all locations."""
        return db.query(LocationModel).all()
    
    @staticmethod
    def delete_location(db: Session, location_id: str) -> bool:
        """Delete a location."""
        location = db.query(LocationModel).filter(LocationModel.id == location_id).first()
        if location:
            db.delete(location)
            db.commit()
            return True
        return False
    
    @staticmethod
    def save_simulation_run(db: Session, run_data: Dict[str, Any]) -> SimulationRun:
        """Save a simulation run."""
        run_id = run_data.get("id")
        existing = db.query(SimulationRun).filter(SimulationRun.id == run_id).first()
        
        if existing:
            # Update existing
            for key, value in run_data.items():
                if hasattr(existing, key):
                    setattr(existing, key, value)
            existing.updated_at = datetime.utcnow()
            run = existing
        else:
            # Create new
            run = SimulationRun(**run_data)
            db.add(run)
        
        db.commit()
        db.refresh(run)
        return run
    
    @staticmethod
    def save_simulation_event(db: Session, event_data: Dict[str, Any]) -> SimulationEvent:
        """Save a simulation event/log."""
        event = SimulationEvent(**event_data)
        db.add(event)
        db.commit()
        db.refresh(event)
        return event
    
    @staticmethod
    def get_simulation_logs(
        db: Session, 
        simulation_run_id: Optional[str] = None,
        limit: int = 100
    ) -> List[SimulationEvent]:
        """Get simulation logs."""
        query = db.query(SimulationEvent)
        
        if simulation_run_id:
            query = query.filter(SimulationEvent.simulation_run_id == simulation_run_id)
        
        return query.order_by(SimulationEvent.timestamp.desc()).limit(limit).all()

    @staticmethod
    def clear_all(db: Session) -> None:
        """Delete all data from all tables we manage.

        Order matters due to FKs and relationships.
        """
        # Delete events first (FK to runs)
        db.query(SimulationEvent).delete()
        db.query(SimulationRun).delete()
        # Delete skills before agents
        db.query(SkillModel).delete()
        db.query(AgentModel).delete()
        db.query(LocationModel).delete()
        db.commit()


# Singleton instance
db_service = DatabaseService()
