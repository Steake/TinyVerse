"""
TinyTroupe Adapter - Bridges TinyVerse API with TinyTroupe library.

This adapter translates between TinyVerse's REST API concepts and TinyTroupe's
Python API, managing TinyPerson agents and TinyWorld simulations.
"""
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from tinytroupe.agent import TinyPerson
from tinytroupe.environment import TinyWorld


class TinyTroupeAdapter:
    """
    Adapter to translate TinyVerse API calls to TinyTroupe operations.
    
    This class maintains a registry of TinyPerson agents and manages a TinyWorld
    simulation environment.
    """
    
    def __init__(self):
        """Initialize the adapter with empty registries."""
        self.agents: Dict[str, TinyPerson] = {}
        self.agent_metadata: Dict[str, Dict[str, Any]] = {}
        self.world = TinyWorld("TinyVerse Simulation")
        self.simulation_running = False
        self.current_step = 0
        self.event_log: List[Dict[str, Any]] = []
    
    def create_agent(self, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a TinyPerson from TinyVerse agent data.
        
        Args:
            agent_data: Dictionary with agent attributes
            
        Returns:
            Dictionary with agent ID and metadata
        """
        agent_id = str(uuid.uuid4())
        
        # Create TinyPerson
        person = TinyPerson(name=agent_data["name"])
        
        # Define basic attributes
        person.define("age", agent_data["age"])
        person.define("occupation", agent_data["occupation"])
        
        if agent_data.get("nationality"):
            person.define("nationality", agent_data["nationality"])
        
        if agent_data.get("country_of_residence"):
            person.define("residence", agent_data["country_of_residence"])
        
        # Add personality traits
        if agent_data.get("personality_traits"):
            for trait in agent_data["personality_traits"]:
                person.define("personality_trait", trait)
        
        # Add interests
        if agent_data.get("professional_interests"):
            person.define("professional_interests", agent_data["professional_interests"])
        
        if agent_data.get("personal_interests"):
            person.define("personal_interests", agent_data["personal_interests"])
        
        # Add backstory
        if agent_data.get("backstory"):
            person.define("backstory", agent_data["backstory"])
        
        # Store agent and metadata
        self.agents[agent_id] = person
        self.agent_metadata[agent_id] = {
            "id": agent_id,
            "name": agent_data["name"],
            "age": agent_data["age"],
            "occupation": agent_data["occupation"],
            "created_at": datetime.utcnow(),
        }
        
        # Add to world
        self.world.add_agent(person)
        
        # Log the event
        self._log_event("agent_created", {
            "agent_id": agent_id,
            "agent_name": agent_data["name"],
        })
        
        return {
            "id": agent_id,
            **agent_data,
            "created_at": self.agent_metadata[agent_id]["created_at"],
        }
    
    def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """
        Get agent details by ID.
        
        Args:
            agent_id: Agent identifier
            
        Returns:
            Agent data dictionary or None if not found
        """
        if agent_id not in self.agents:
            return None
        
        person = self.agents[agent_id]
        metadata = self.agent_metadata[agent_id]
        
        return {
            "id": agent_id,
            "name": person.name,
            **metadata,
        }
    
    def list_agents(self) -> List[Dict[str, Any]]:
        """
        List all agents.
        
        Returns:
            List of agent data dictionaries
        """
        return [self.get_agent(agent_id) for agent_id in self.agents.keys()]
    
    def delete_agent(self, agent_id: str) -> bool:
        """
        Delete an agent.
        
        Args:
            agent_id: Agent identifier
            
        Returns:
            True if deleted, False if not found
        """
        if agent_id not in self.agents:
            return False
        
        person = self.agents[agent_id]
        self.world.remove_agent(person)
        del self.agents[agent_id]
        del self.agent_metadata[agent_id]
        
        # Log the event
        self._log_event("agent_deleted", {
            "agent_id": agent_id,
        })
        
        return True
    
    def run_simulation(self, steps: int = 1) -> None:
        """
        Run the simulation for a specified number of steps.
        
        Args:
            steps: Number of simulation steps to run
        """
        self.simulation_running = True
        
        # Log simulation start
        self._log_event("simulation_started", {
            "steps": steps,
            "starting_step": self.current_step,
        })
        
        self.world.run(steps)
        self.current_step += steps
        
        # Log simulation completion
        self._log_event("simulation_step_completed", {
            "steps_completed": steps,
            "current_step": self.current_step,
        })
    
    def pause_simulation(self) -> None:
        """Pause the simulation."""
        self.simulation_running = False
        
        # Log simulation pause
        self._log_event("simulation_paused", {
            "paused_at_step": self.current_step,
        })
    
    def get_simulation_state(self) -> Dict[str, Any]:
        """
        Get current simulation state.
        
        Returns:
            Dictionary with simulation state information
        """
        return {
            "is_running": self.simulation_running,
            "current_step": self.current_step,
            "agents_count": len(self.agents),
            "world_name": self.world.name,
        }
    
    def get_simulation_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get simulation logs/events.
        
        Args:
            limit: Maximum number of logs to return
            
        Returns:
            List of log entries
        """
        # Return most recent logs up to limit
        return self.event_log[-limit:] if self.event_log else []
    
    def _log_event(self, event_type: str, data: Dict[str, Any]) -> None:
        """
        Log a simulation event.
        
        Args:
            event_type: Type of event
            data: Event data
        """
        log_entry = {
            "type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data,
        }
        self.event_log.append(log_entry)


# Global adapter instance
adapter = TinyTroupeAdapter()
