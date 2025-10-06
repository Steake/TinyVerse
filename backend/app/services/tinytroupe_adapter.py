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
        self._agent_name_to_id: Dict[str, str] = {}
        self._log_history: List[Dict[str, Any]] = []
        self._last_log_index = 0
    
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
        self._agent_name_to_id[agent_data["name"]] = agent_id
        
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
        self._agent_name_to_id.pop(person.name, None)
        return True
    
    def add_relationship(self, agent_id: str, relationship: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a relationship to an agent.
        
        Args:
            agent_id: Agent identifier
            relationship: Relationship data
            
        Returns:
            Updated agent data
        """
        if agent_id not in self.agent_metadata:
            raise ValueError(f"Agent {agent_id} not found")
        
        if "relationships" not in self.agent_metadata[agent_id]:
            self.agent_metadata[agent_id]["relationships"] = []
        
        self.agent_metadata[agent_id]["relationships"].append(relationship)
        return self.get_agent(agent_id)
    
    def remove_relationship(self, agent_id: str, target_id: str) -> bool:
        """
        Remove a relationship from an agent.
        
        Args:
            agent_id: Agent identifier
            target_id: Target agent identifier
            
        Returns:
            True if removed, False if not found
        """
        if agent_id not in self.agent_metadata:
            return False
        
        relationships = self.agent_metadata[agent_id].get("relationships", [])
        initial_length = len(relationships)
        
        self.agent_metadata[agent_id]["relationships"] = [
            rel for rel in relationships if rel.get("targetId") != target_id
        ]
        
        return len(self.agent_metadata[agent_id]["relationships"]) < initial_length
    
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
    
    def create_location(self, location_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a location.
        
        Args:
            location_data: Dictionary with location attributes
            
        Returns:
            Dictionary with location ID and metadata
        """
        location_id = str(uuid.uuid4())
        location = {
            "id": location_id,
            **location_data,
            "created_at": datetime.now(timezone.utc),
        }
        self.locations[location_id] = location
        return location
    
    def get_location(self, location_id: str) -> Optional[Dict[str, Any]]:
        """
        Get location details by ID.
        
        Args:
            location_id: Location identifier
            
        Returns:
            Location data dictionary or None if not found
        """
        return self.locations.get(location_id)
    
    def list_locations(self) -> List[Dict[str, Any]]:
        """
        List all locations.
        
        Returns:
            List of location data dictionaries
        """
        return list(self.locations.values())
    
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
    
    def create_connection(self, connection_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a connection between locations.
        
        Args:
            connection_data: Dictionary with connection attributes
            
        Returns:
            Dictionary with connection ID and metadata
        """
        connection_id = str(uuid.uuid4())
        connection = {
            "id": connection_id,
            **connection_data,
            "created_at": datetime.now(timezone.utc),
        }
        self.connections[connection_id] = connection
        return connection
    
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
    
    def get_simulation_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get simulation logs/events.
        
        Args:
            limit: Maximum number of logs to return
            
        Returns:
            List of log entries
        """
        communications = getattr(self.world, "_displayed_communications_buffer", [])

        if self._last_log_index < len(communications):
            new_entries = communications[self._last_log_index :]
            for communication in new_entries:
                log_entry = self._convert_communication_to_log(communication)
                if log_entry is not None:
                    self._log_history.append(log_entry)
            self._last_log_index = len(communications)

        if limit is None or limit <= 0:
            return list(self._log_history)

        return self._log_history[-limit:]

    def _convert_communication_to_log(self, communication: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Convert a TinyWorld communication payload into a SimulationLog-compatible dict.
        """
        if not isinstance(communication, dict):
            return None

        kind = communication.get("kind")
        content = communication.get("content") or {}

        # Determine timestamp preference order: explicit timestamp -> simulation timestamp -> world's current datetime -> now
        timestamp = (
            content.get("timestamp")
            or content.get("simulation_timestamp")
            or communication.get("timestamp")
        )

        if isinstance(timestamp, str):
            try:
                timestamp = datetime.fromisoformat(timestamp)
            except ValueError:
                timestamp = None

        if not isinstance(timestamp, datetime):
            world_timestamp = getattr(self.world, "current_datetime", None)
            timestamp = world_timestamp or datetime.utcnow()

        agent_name = communication.get("source")
        agent_id = self._agent_name_to_id.get(agent_name)

        action_type = kind or "unknown"
        content_text = communication.get("rendering") or ""

        if kind == "action":
            action_data = content.get("action") or {}
            action_type = action_data.get("type", action_type)
            content_text = action_data.get("content") or content_text
        elif kind in ("stimulus", "stimuli"):
            stimuli_list = []
            if kind == "stimulus":
                stimulus = content.get("stimulus")
                if stimulus:
                    stimuli_list = [stimulus]
            else:
                stimuli = content.get("stimuli")
                if isinstance(stimuli, list):
                    stimuli_list = stimuli

            primary_stimulus = stimuli_list[0] if stimuli_list else {}
            action_type = primary_stimulus.get("type", action_type)
            content_text = primary_stimulus.get("content") or content_text
        elif kind in ("step", "intervention"):
            content_text = communication.get("rendering") or content_text

        metadata: Dict[str, Any] = {}
        render_text = communication.get("rendering")
        if render_text:
            metadata["rendering"] = render_text

        target = communication.get("target")
        if target:
            metadata["target"] = target

        if content:
            metadata["raw_content"] = content

        if communication.get("source") and communication.get("target"):
            metadata["source"] = communication["source"]

        if communication.get("kind"):
            metadata["kind"] = communication["kind"]

        if not metadata:
            metadata = None

        return {
            "timestamp": timestamp,
            "agent_id": agent_id,
            "agent_name": agent_name,
            "action_type": action_type,
            "content": content_text,
            "metadata": metadata,
        }


# Global adapter instance
adapter = TinyTroupeAdapter()
