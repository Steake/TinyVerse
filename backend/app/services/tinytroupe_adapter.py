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
        self.locations: Dict[str, Dict[str, Any]] = {}
        self.connections: Dict[str, Dict[str, Any]] = {}
        self.world = TinyWorld("TinyVerse Simulation")
        self.simulation_running = False
        self.current_step = 0
    
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
        return True
    
    def update_agent(self, agent_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an agent's attributes.
        
        Args:
            agent_id: Agent identifier
            update_data: Dictionary with fields to update
            
        Returns:
            Updated agent data or None if not found
        """
        if agent_id not in self.agents:
            return None
        
        person = self.agents[agent_id]
        metadata = self.agent_metadata[agent_id]
        
        # Update TinyPerson attributes
        if "age" in update_data:
            person.define("age", update_data["age"])
            metadata["age"] = update_data["age"]
        
        if "occupation" in update_data:
            person.define("occupation", update_data["occupation"])
            metadata["occupation"] = update_data["occupation"]
        
        if "nationality" in update_data:
            person.define("nationality", update_data["nationality"])
        
        if "country_of_residence" in update_data:
            person.define("residence", update_data["country_of_residence"])
        
        if "personality_traits" in update_data:
            for trait in update_data["personality_traits"]:
                person.define("personality_trait", trait)
        
        if "professional_interests" in update_data:
            person.define("professional_interests", update_data["professional_interests"])
        
        if "personal_interests" in update_data:
            person.define("personal_interests", update_data["personal_interests"])
        
        if "backstory" in update_data:
            person.define("backstory", update_data["backstory"])
        
        # Update metadata
        metadata.update({k: v for k, v in update_data.items() if k in metadata})
        
        return self.get_agent(agent_id)
    
    # Location management methods
    
    def create_location(self, location_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a location in the world.
        
        Args:
            location_data: Dictionary with location attributes
            
        Returns:
            Dictionary with location ID and metadata
        """
        location_id = str(uuid.uuid4())
        
        location = {
            "id": location_id,
            "name": location_data["name"],
            "type": location_data.get("type", "room"),
            "description": location_data.get("description", ""),
            "x": location_data.get("x", 0.0),
            "y": location_data.get("y", 0.0),
            "width": location_data.get("width", 100.0),
            "height": location_data.get("height", 100.0),
            "image": location_data.get("image"),
            "created_at": datetime.utcnow(),
        }
        
        self.locations[location_id] = location
        return location
    
    def get_location(self, location_id: str) -> Optional[Dict[str, Any]]:
        """
        Get location details by ID.
        
        Args:
            location_id: Location identifier
            
        Returns:
            Location data or None if not found
        """
        return self.locations.get(location_id)
    
    def list_locations(self) -> List[Dict[str, Any]]:
        """
        List all locations.
        
        Returns:
            List of location data dictionaries
        """
        return list(self.locations.values())
    
    def update_location(self, location_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update a location's attributes.
        
        Args:
            location_id: Location identifier
            update_data: Dictionary with fields to update
            
        Returns:
            Updated location data or None if not found
        """
        if location_id not in self.locations:
            return None
        
        location = self.locations[location_id]
        location.update({k: v for k, v in update_data.items() if k != "id" and k != "created_at"})
        
        return location
    
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
        
        # Delete all connections involving this location
        connections_to_delete = [
            conn_id for conn_id, conn in self.connections.items()
            if conn["source"] == location_id or conn["target"] == location_id
        ]
        for conn_id in connections_to_delete:
            del self.connections[conn_id]
        
        del self.locations[location_id]
        return True
    
    # Connection management methods
    
    def create_connection(self, connection_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a connection between locations.
        
        Args:
            connection_data: Dictionary with connection attributes
            
        Returns:
            Dictionary with connection ID and metadata
        """
        source_id = connection_data["source"]
        target_id = connection_data["target"]
        
        # Validate that both locations exist
        if source_id not in self.locations:
            raise ValueError(f"Source location {source_id} not found")
        if target_id not in self.locations:
            raise ValueError(f"Target location {target_id} not found")
        
        connection_id = str(uuid.uuid4())
        
        connection = {
            "id": connection_id,
            "source": source_id,
            "target": target_id,
            "type": connection_data.get("type", "path"),
            "created_at": datetime.utcnow(),
        }
        
        self.connections[connection_id] = connection
        return connection
    
    def get_connection(self, connection_id: str) -> Optional[Dict[str, Any]]:
        """
        Get connection details by ID.
        
        Args:
            connection_id: Connection identifier
            
        Returns:
            Connection data or None if not found
        """
        return self.connections.get(connection_id)
    
    def list_connections(self) -> List[Dict[str, Any]]:
        """
        List all connections.
        
        Returns:
            List of connection data dictionaries
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
    
    # Simulation methods
    
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
        # TODO: Implement proper log extraction from TinyWorld
        # For now, return empty list as TinyTroupe's event system
        # needs to be properly integrated
        return []


# Global adapter instance
adapter = TinyTroupeAdapter()
