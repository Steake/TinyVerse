"""
TinyTroupe Adapter - Bridges TinyVerse API with TinyTroupe library.

This adapter translates between TinyVerse's REST API concepts and TinyTroupe's
Python API, managing TinyPerson agents and TinyWorld simulations.
"""
import uuid
from datetime import datetime, timezone
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
        self.locations: Dict[str, Dict[str, Any]] = {}
        self.connections: Dict[str, Dict[str, Any]] = {}
        self.world = TinyWorld("TinyVerse Simulation")
        self.simulation_running = False
        self.current_step = 0
        self.action_logs: List[Dict[str, Any]] = []
    
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
            "created_at": datetime.now(timezone.utc),
        }
        
        # Add to world
        self.world.add_agent(person)
        
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
    
    def update_agent(self, agent_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an agent.
        
        Args:
            agent_id: Agent identifier
            update_data: Dictionary with fields to update
            
        Returns:
            Updated agent or None if not found
        """
        if agent_id not in self.agents:
            return None
        
        # Update metadata
        self.agent_metadata[agent_id].update(update_data)
        
        # Update TinyPerson attributes if needed
        person = self.agents[agent_id]
        if "name" in update_data:
            person.name = update_data["name"]
        if "age" in update_data:
            person.define("age", update_data["age"])
        if "occupation" in update_data:
            person.define("occupation", update_data["occupation"])
        
        return self.get_agent(agent_id)
    
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
        return True
    
    def run_simulation(self, steps: int = 1) -> None:
        """
        Run the simulation for a specified number of steps.
        
        Args:
            steps: Number of simulation steps to run
        """
        self.simulation_running = True
        self.world.run(steps)
        self.current_step += steps
    
    def pause_simulation(self) -> None:
        """Pause the simulation."""
        self.simulation_running = False
    
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
        # Return the most recent logs up to the limit
        return self.action_logs[-limit:] if self.action_logs else []
    
    def create_location(self, location_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new location.
        
        Args:
            location_data: Dictionary with location attributes
            
        Returns:
            Dictionary with location data including ID
        """
        location_id = str(uuid.uuid4())
        location = {
            "id": location_id,
            **location_data,
        }
        self.locations[location_id] = location
        return location
    
    def list_locations(self) -> List[Dict[str, Any]]:
        """
        List all locations.
        
        Returns:
            List of location dictionaries
        """
        return list(self.locations.values())
    
    def update_location(self, location_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update a location.
        
        Args:
            location_id: Location identifier
            update_data: Dictionary with fields to update
            
        Returns:
            Updated location or None if not found
        """
        if location_id not in self.locations:
            return None
        
        self.locations[location_id].update(update_data)
        return self.locations[location_id]
    
    def delete_location(self, location_id: str) -> bool:
        """
        Delete a location.
        
        Args:
            location_id: Location identifier
            
        Returns:
            True if deleted, False if not found
        """
        if location_id not in self.locations:
            return False
        
        del self.locations[location_id]
        return True
    
    def create_connection(self, connection_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new connection between locations.
        
        Args:
            connection_data: Dictionary with connection attributes
            
        Returns:
            Dictionary with connection data including ID
        """
        connection_id = str(uuid.uuid4())
        connection = {
            "id": connection_id,
            **connection_data,
        }
        self.connections[connection_id] = connection
        return connection
    
    def list_connections(self) -> List[Dict[str, Any]]:
        """
        List all connections.
        
        Returns:
            List of connection dictionaries
        """
        return list(self.connections.values())
    
    def delete_connection(self, connection_id: str) -> bool:
        """
        Delete a connection.
        
        Args:
            connection_id: Connection identifier
            
        Returns:
            True if deleted, False if not found
        """
        if connection_id not in self.connections:
            return False
        
        del self.connections[connection_id]
        return True
    
    def execute_action(self, action_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a simulation action.
        
        Args:
            action_data: Dictionary with action type, agentId, targetId, and data
            
        Returns:
            Log entry for the action
        """
        agent_id = action_data.get("agentId")
        action_type = action_data.get("type")
        
        # Create log entry
        log_entry = {
            "timestamp": datetime.now(timezone.utc),
            "agent_id": agent_id,
            "agent_name": self.agent_metadata.get(agent_id, {}).get("name", "Unknown") if agent_id in self.agents else "Unknown",
            "action_type": action_type,
            "content": f"Agent performed {action_type} action",
            "metadata": action_data.get("data", {}),
        }
        
        self.action_logs.append(log_entry)
        return log_entry


# Global adapter instance
adapter = TinyTroupeAdapter()
