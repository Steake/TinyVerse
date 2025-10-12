"""
TinyTroupe Adapter - Bridges TinyVerse API with TinyTroupe library.

This adapter translates between TinyVerse's REST API concepts and TinyTroupe's
Python API, managing TinyPerson agents and TinyWorld simulations.
"""
import copy
import json
import logging
import sys
import textwrap
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from app.schemas import (
    AgentCreate,
    LocationCreate,
    AutofillScenarioResponse,
    ScenarioBeat,
)

TINYTROUPE_LOCAL_PATH = Path(__file__).resolve().parent.parent / "tinytroupe-local"

if TINYTROUPE_LOCAL_PATH.exists():
    # Ensure the vendored TinyTroupe clone is importable even if setup.sh wasn't run.
    local_path_str = str(TINYTROUPE_LOCAL_PATH)
    if local_path_str not in sys.path:
        sys.path.insert(0, local_path_str)

try:
    from tinytroupe.agent import TinyPerson
    from tinytroupe.agent.mental_faculty import (
        FilesAndWebGroundingFaculty,
        RecallFaculty,
        TinyToolUse,
    )
    from tinytroupe.environment import TinyWorld
    from tinytroupe.tools.tiny_calendar import TinyCalendar
    from tinytroupe.tools.tiny_word_processor import TinyWordProcessor
    from tinytroupe.utils.llm import LLMChat
except ModuleNotFoundError as exc:
    missing_module = exc.name if hasattr(exc, "name") else "tinytroupe"
    raise ModuleNotFoundError(
        f"TinyTroupe dependency '{missing_module}' is missing. "
        "Run backend/setup.sh to install the vendored TinyTroupe package."
    ) from exc

from app.utils.json_tools import coerce_json_object

logger = logging.getLogger(__name__)


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
        self.faculty_catalog = self._build_faculty_catalog()
        self.tool_catalog = self._build_tool_catalog()
        self.faculties: Dict[str, Dict[str, Any]] = {}
        self.agent_faculty_index: Dict[str, List[str]] = {}
        self.tools_registry: Dict[str, Dict[str, Any]] = {}
        self.agent_tool_index: Dict[str, List[str]] = {}
        # Track last index of communications broadcasted over websocket
        self._last_broadcast_index: int = 0

    def _build_faculty_catalog(self) -> Dict[str, Dict[str, Any]]:
        """Return the base catalogue of supported mental faculties."""
        return {
            "recall": {
                "key": "recall",
                "name": "Memory Recall",
                "description": "Allows agents to proactively search semantic memory using RECALL actions.",
                "type": "memory",
                "parameters": [
                    {
                        "id": "enable_full_scan",
                        "name": "Enable Full Scan",
                        "description": "Permit RECALL_WITH_FULL_SCAN actions when the agent needs exhaustive retrieval.",
                        "type": "boolean",
                        "value": True,
                    }
                ],
            },
            "grounding": {
                "key": "grounding",
                "name": "Files & Web Grounding",
                "description": "Connects the agent to curated local documents and web references.",
                "type": "grounding",
                "parameters": [
                    {
                        "id": "allow_files",
                        "name": "Local Documents",
                        "description": "Expose local document corpus to the agent.",
                        "type": "boolean",
                        "value": True,
                    },
                    {
                        "id": "allow_web",
                        "name": "Web References",
                        "description": "Allow consult actions to hit configured web URLs.",
                        "type": "boolean",
                        "value": True,
                    },
                ],
            },
            "tool_use": {
                "key": "tool_use",
                "name": "Tool Use",
                "description": "Aggregates TinyTool integrations so agents can call them via TOOL actions.",
                "type": "tool-use",
                "parameters": [
                    {
                        "id": "tool_ids",
                        "name": "Enabled Tools",
                        "description": "Select which tools the agent may call during simulation.",
                        "type": "multi-select",
                        "value": [],
                        "options": [],
                    }
                ],
            },
        }

    def _build_tool_catalog(self) -> Dict[str, Dict[str, Any]]:
        """Return the base catalogue of supported tools."""
        return {
            "calendar": {
                "key": "calendar",
                "name": "Tiny Calendar",
                "description": "Lightweight agenda for tracking meetings and commitments.",
                "capabilities": ["CREATE_EVENT", "LIST_EVENTS"],
                "parameters": [],
            },
            "word_processor": {
                "key": "word_processor",
                "name": "Tiny Word Processor",
                "description": "Long-form document drafting tool with optional enrichment/export hooks.",
                "capabilities": ["WRITE_DOCUMENT"],
                "parameters": [],
            },
        }
    
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
            "emoji": agent_data.get("emoji", "👤"),
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
        if "emoji" in update_data:
            # Store emoji in metadata (not in TinyPerson since it's UI-only)
            pass
        
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

        # Clean up faculties
        faculty_ids = self.agent_faculty_index.pop(agent_id, [])
        for faculty_id in faculty_ids:
            record = self.faculties.pop(faculty_id, None)
            if record and record.get("is_active"):
                self._detach_faculty_instance(person, record.get("instance"))

        # Clean up tools
        tool_ids = self.agent_tool_index.pop(agent_id, [])
        for tool_id in tool_ids:
            self.tools_registry.pop(tool_id, None)

        return True

    # ---------------------------------------------------------------------
    # Admin utilities
    # ---------------------------------------------------------------------
    def reset_all(self):
        """Hard reset all in-memory state (agents, locations, connections, tools, faculties, logs).

        Reinitializes TinyWorld and clears registries. Intended for admin reset endpoint.
        """
        try:
            # Detach faculties from persons to avoid dangling references
            for agent_id, person in list(self.agents.items()):
                # best-effort detach; faculties are cleaned when deleting agents normally
                pass
        except Exception:
            pass

        self.agents.clear()
        self.agent_metadata.clear()
        self.locations.clear()
        self.connections.clear()
        self.faculties.clear()
        self.agent_faculty_index.clear()
        self.tools_registry.clear()
        self.agent_tool_index.clear()
        self._agent_name_to_id.clear()
        self._log_history.clear()
        self._last_log_index = 0
        self.simulation_running = False
        self.current_step = 0
        # Recreate world
        try:
            self.world = TinyWorld("TinyVerse Simulation")
        except Exception:
            # As a fallback, leave world as-is if TinyWorld ctor fails
            pass

    def _get_person(self, agent_id: str) -> TinyPerson:
        """Return the TinyPerson instance for an agent id or raise."""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} not found")
        return self.agents[agent_id]

    # ---------------------------------------------------------------------
    # Mental faculties
    # ---------------------------------------------------------------------

    def _build_tool_options(self, agent_id: Optional[str]) -> List[Dict[str, str]]:
        if agent_id is None:
            return []

        options: List[Dict[str, str]] = []
        for tool_id in self.agent_tool_index.get(agent_id, []):
            tool_record = self.tools_registry.get(tool_id)
            if not tool_record:
                continue
            options.append(
                {
                    "value": tool_id,
                    "label": tool_record["name"],
                }
            )
        return options

    def _resolve_faculty_parameters(
        self,
        key: str,
        overrides: Optional[Dict[str, Any]],
        agent_id: Optional[str],
    ) -> List[Dict[str, Any]]:
        definition = self.faculty_catalog.get(key)
        if not definition:
            raise ValueError(f"Unknown faculty key: {key}")

        overrides = overrides or {}
        resolved: List[Dict[str, Any]] = []
        for parameter in definition.get("parameters", []):
            parameter_copy = copy.deepcopy(parameter)
            param_id = parameter_copy["id"]
            if param_id in overrides:
                parameter_copy["value"] = overrides[param_id]

            if param_id == "tool_ids":
                parameter_copy["options"] = self._build_tool_options(agent_id)
                parameter_copy["value"] = list(
                    overrides.get(param_id, parameter_copy.get("value", [])) or []
                )

            resolved.append(parameter_copy)
        return resolved

    def _instantiate_faculty(
        self,
        key: str,
        parameters: Dict[str, Any],
        agent_id: str,
    ):
        person = self._get_person(agent_id)

        if key == "recall":
            return RecallFaculty()

        if key == "grounding":
            allow_files = parameters.get("allow_files", True)
            allow_web = parameters.get("allow_web", True)
            folders_paths = parameters.get("folders_paths") if allow_files else []
            web_urls = parameters.get("web_urls") if allow_web else []
            return FilesAndWebGroundingFaculty(
                folders_paths=folders_paths, web_urls=web_urls
            )

        if key == "tool_use":
            tool_ids = parameters.get("tool_ids") or []
            tool_instances = []
            for tool_id in tool_ids:
                tool_record = self.tools_registry.get(tool_id)
                if not tool_record:
                    continue
                if tool_record["agent_id"] != agent_id:
                    continue
                instance = tool_record.get("instance")
                if instance:
                    tool_instances.append(instance)
            return TinyToolUse(tools=tool_instances)

        raise ValueError(f"Unsupported faculty key: {key}")

    def _attach_faculty_instance(self, person: TinyPerson, faculty) -> None:
        if faculty is None:
            return
        existing = getattr(person, "_mental_faculties", [])
        if faculty in existing:
            return
        person.add_mental_faculty(faculty)

    def _detach_faculty_instance(self, person: TinyPerson, faculty) -> None:
        if faculty is None:
            return
        mental_faculties = getattr(person, "_mental_faculties", [])
        if faculty in mental_faculties:
            mental_faculties = [fac for fac in mental_faculties if fac is not faculty]
            person._mental_faculties = mental_faculties

    def _serialize_faculty_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        parameters = self._resolve_faculty_parameters(
            record["key"], record.get("raw_parameters"), record["agent_id"]
        )
        return {
            "id": record["id"],
            "agent_id": record["agent_id"],
            "key": record["key"],
            "name": record["name"],
            "description": record["description"],
            "type": record["type"],
            "is_active": record["is_active"],
            "parameters": parameters,
            "created_at": record["created_at"],
        }

    def list_faculty_definitions(self) -> List[Dict[str, Any]]:
        """Return the static catalogue of available faculties."""
        definitions: List[Dict[str, Any]] = []
        for key, value in self.faculty_catalog.items():
            entry = copy.deepcopy(value)
            entry["parameters"] = self._resolve_faculty_parameters(key, None, None)
            definitions.append(entry)
        return definitions

    def list_agent_faculties(self, agent_id: str) -> List[Dict[str, Any]]:
        faculties: List[Dict[str, Any]] = []
        for faculty_id in self.agent_faculty_index.get(agent_id, []):
            record = self.faculties.get(faculty_id)
            if record:
                faculties.append(self._serialize_faculty_record(record))
        return faculties

    def add_mental_faculty(
        self,
        agent_id: str,
        key: str,
        parameters: Optional[Dict[str, Any]] = None,
        activate: bool = True,
    ) -> Dict[str, Any]:
        if key not in self.faculty_catalog:
            raise ValueError(f"Unknown faculty key: {key}")

        faculty_id = str(uuid.uuid4())
        person = self._get_person(agent_id)
        parameters = parameters or {}
        instance = None
        if activate:
            instance = self._instantiate_faculty(key, parameters, agent_id)
            self._attach_faculty_instance(person, instance)

        record = {
            "id": faculty_id,
            "agent_id": agent_id,
            "key": key,
            "name": self.faculty_catalog[key]["name"],
            "description": self.faculty_catalog[key]["description"],
            "type": self.faculty_catalog[key]["type"],
            "raw_parameters": parameters,
            "is_active": activate,
            "instance": instance,
            "created_at": datetime.now(timezone.utc),
        }

        self.faculties[faculty_id] = record
        self.agent_faculty_index.setdefault(agent_id, []).append(faculty_id)

        logger.info(
            "Assigned faculty %s to agent %s (active=%s)",
            key,
            agent_id,
            activate,
        )
        return self._serialize_faculty_record(record)

    def update_mental_faculty(
        self,
        agent_id: str,
        faculty_id: str,
        parameters: Optional[Dict[str, Any]] = None,
        activate: Optional[bool] = None,
    ) -> Dict[str, Any]:
        record = self.faculties.get(faculty_id)
        if not record or record["agent_id"] != agent_id:
            raise ValueError(f"Faculty {faculty_id} not found for agent {agent_id}")

        person = self._get_person(agent_id)
        parameters = parameters if parameters is not None else record.get("raw_parameters", {})

        current_instance = record.get("instance")
        if current_instance:
            self._detach_faculty_instance(person, current_instance)
            record["instance"] = None

        should_activate = record["is_active"] if activate is None else activate
        record["is_active"] = should_activate
        record["raw_parameters"] = parameters

        if should_activate:
            instance = self._instantiate_faculty(record["key"], parameters, agent_id)
            self._attach_faculty_instance(person, instance)
            record["instance"] = instance

        return self._serialize_faculty_record(record)

    def remove_mental_faculty(self, agent_id: str, faculty_id: str) -> bool:
        record = self.faculties.get(faculty_id)
        if not record or record["agent_id"] != agent_id:
            return False

        person = self._get_person(agent_id)
        if record.get("instance"):
            self._detach_faculty_instance(person, record["instance"])

        self.faculties.pop(faculty_id, None)
        self.agent_faculty_index[agent_id] = [
            existing_id
            for existing_id in self.agent_faculty_index.get(agent_id, [])
            if existing_id != faculty_id
        ]
        return True

    # ---------------------------------------------------------------------
    # Tools
    # ---------------------------------------------------------------------

    def list_tool_definitions(self) -> List[Dict[str, Any]]:
        return [copy.deepcopy(value) for value in self.tool_catalog.values()]

    def list_agent_tools(self, agent_id: str) -> List[Dict[str, Any]]:
        tools: List[Dict[str, Any]] = []
        for tool_id in self.agent_tool_index.get(agent_id, []):
            record = self.tools_registry.get(tool_id)
            if record:
                tools.append(self._serialize_tool_record(record))
        return tools

    def _serialize_tool_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        definition = self.tool_catalog.get(record["key"], {})
        return {
            "id": record["id"],
            "agent_id": record["agent_id"],
            "key": record["key"],
            "name": record["name"],
            "description": record["description"],
            "capabilities": definition.get("capabilities", []),
            "parameters": [],
            "created_at": record["created_at"],
        }

    def _instantiate_tool(
        self,
        key: str,
        agent_id: str,
        parameters: Optional[Dict[str, Any]],
    ):
        person = self._get_person(agent_id)
        parameters = parameters or {}

        if key == "calendar":
            return TinyCalendar(owner=person)

        if key == "word_processor":
            return TinyWordProcessor(owner=person)

        raise ValueError(f"Unsupported tool key: {key}")

    def assign_tool(
        self,
        agent_id: str,
        key: str,
        parameters: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        if key not in self.tool_catalog:
            raise ValueError(f"Unknown tool key: {key}")

        tool_id = str(uuid.uuid4())
        instance = self._instantiate_tool(key, agent_id, parameters)
        record = {
            "id": tool_id,
            "agent_id": agent_id,
            "key": key,
            "name": self.tool_catalog[key]["name"],
            "description": self.tool_catalog[key]["description"],
            "parameters": parameters or {},
            "instance": instance,
            "created_at": datetime.now(timezone.utc),
        }

        self.tools_registry[tool_id] = record
        self.agent_tool_index.setdefault(agent_id, []).append(tool_id)

        # Refresh tool-use faculties so they pick up the new tool
        for faculty_id in self.agent_faculty_index.get(agent_id, []):
            faculty_record = self.faculties.get(faculty_id)
            if faculty_record and faculty_record["key"] == "tool_use" and faculty_record["is_active"]:
                self.update_mental_faculty(
                    agent_id,
                    faculty_id,
                    parameters=faculty_record.get("raw_parameters"),
                )

        return self._serialize_tool_record(record)

    def update_tool(
        self,
        agent_id: str,
        tool_id: str,
        parameters: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        record = self.tools_registry.get(tool_id)
        if not record or record["agent_id"] != agent_id:
            raise ValueError(f"Tool {tool_id} not found for agent {agent_id}")

        record["parameters"] = parameters or {}
        # Rebuild instance
        record["instance"] = self._instantiate_tool(record["key"], agent_id, record["parameters"])

        # Refresh dependent faculties
        for faculty_id in self.agent_faculty_index.get(agent_id, []):
            faculty_record = self.faculties.get(faculty_id)
            if faculty_record and faculty_record["key"] == "tool_use" and faculty_record["is_active"]:
                self.update_mental_faculty(
                    agent_id,
                    faculty_id,
                    parameters=faculty_record.get("raw_parameters"),
                )

        return self._serialize_tool_record(record)

    def remove_tool(self, agent_id: str, tool_id: str) -> bool:
        record = self.tools_registry.get(tool_id)
        if not record or record["agent_id"] != agent_id:
            return False

        self.tools_registry.pop(tool_id, None)
        self.agent_tool_index[agent_id] = [
            existing_id
            for existing_id in self.agent_tool_index.get(agent_id, [])
            if existing_id != tool_id
        ]

        # Refresh tool-use faculties to drop the missing tool
        for faculty_id in self.agent_faculty_index.get(agent_id, []):
            faculty_record = self.faculties.get(faculty_id)
            if faculty_record and faculty_record["key"] == "tool_use" and faculty_record["is_active"]:
                self.update_mental_faculty(
                    agent_id,
                    faculty_id,
                    parameters=faculty_record.get("raw_parameters"),
                )

        return True

    # ---------------------------------------------------------------------
    # Memory management
    # ---------------------------------------------------------------------

    def get_episodic_memory(
        self,
        agent_id: str,
        first_n: Optional[int] = None,
        last_n: Optional[int] = None,
        item_type: Optional[str] = None,
        include_omission_info: bool = True,
    ) -> List[Dict[str, Any]]:
        person = self._get_person(agent_id)
        entries = person.episodic_memory.retrieve(
            first_n=first_n,
            last_n=last_n,
            include_omission_info=include_omission_info,
            item_type=item_type,
        )
        return self._coerce_memory_entries(entries)

    def get_recent_episodic_memory(
        self,
        agent_id: str,
        item_type: Optional[str] = None,
        include_omission_info: bool = True,
    ) -> List[Dict[str, Any]]:
        person = self._get_person(agent_id)
        entries = person.episodic_memory.retrieve_recent(
            item_type=item_type,
            include_omission_info=include_omission_info,
        )
        return self._coerce_memory_entries(entries)

    def clear_episodic_memory(
        self,
        agent_id: str,
        max_prefix: Optional[int] = None,
        max_suffix: Optional[int] = None,
    ) -> None:
        person = self._get_person(agent_id)
        person.clear_episodic_memory(
            max_prefix_to_clear=max_prefix,
            max_suffix_to_clear=max_suffix,
        )

    def get_semantic_memory(
        self,
        agent_id: str,
        limit: Optional[int] = None,
        item_type: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        person = self._get_person(agent_id)
        memories = person.semantic_memory.retrieve_all(item_type=item_type)
        if limit is not None and limit > 0:
            memories = memories[-limit:]
        return self._coerce_memory_entries(memories)

    def query_semantic_memory(
        self,
        agent_id: str,
        query: str,
        top_k: int = 5,
    ) -> List[Any]:
        person = self._get_person(agent_id)
        return person.semantic_memory.retrieve_relevant(
            relevance_target=query,
            top_k=top_k,
        )

    def summarize_semantic_memory(
        self,
        agent_id: str,
        query: str,
        batch_size: int = 20,
    ) -> str:
        person = self._get_person(agent_id)
        return person.summarize_relevant_memories_via_full_scan(
            relevance_target=query,
            batch_size=batch_size,
        )

    def ingest_semantic_memory(
        self,
        agent_id: str,
        text: Optional[str] = None,
        url: Optional[str] = None,
        document_name: Optional[str] = None,
    ) -> None:
        if not text and not url:
            raise ValueError("Either text or url must be provided")

        person = self._get_person(agent_id)
        timestamp = datetime.now(timezone.utc).isoformat()

        if text:
            engram = {
                "type": "information",
                "content": text,
                "simulation_timestamp": timestamp,
            }
            if document_name:
                engram["document_name"] = document_name
            person.semantic_memory.store(engram)

        if url:
            try:
                person.semantic_memory.add_web_url(url)
            except AttributeError:
                # Fallback to TinyPerson helper if present
                if hasattr(person, "add_web_url"):
                    person.add_web_url(url)
                else:
                    raise

    def _coerce_memory_entries(self, entries: List[Any]) -> List[Dict[str, Any]]:
        normalized: List[Dict[str, Any]] = []
        for entry in entries:
            if isinstance(entry, dict):
                item = dict(entry)
                
                # Ensure 'content' field exists (required by MemoryEntry schema)
                if "content" not in item:
                    # Try to extract content from common fields
                    content = (
                        item.get("text") or 
                        item.get("description") or 
                        item.get("message") or 
                        str(item.get("role", "")) + ": " + str(item.get("data", "")) if "data" in item else
                        str(item)
                    )
                    item["content"] = content
                
                # Convert datetime to ISO string
                timestamp = item.get("simulation_timestamp")
                if isinstance(timestamp, datetime):
                    item["simulation_timestamp"] = timestamp.isoformat()
                    
                normalized.append(item)
            else:
                # Non-dict entry: wrap in content field
                normalized.append({"content": str(entry)})
        return normalized

    # ---------------------------------------------------------------------
    # LLM-assisted autofill
    # ---------------------------------------------------------------------

    def _call_llm_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        try:
            chat = LLMChat(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                # Let TinyTroupe return raw text and avoid its internal JSON extractor
                # which logs noisy errors when models return bundled payloads.
                output_type=str,
                enable_json_output_format=False,
                enable_justification_step=False,
            )
            response = chat.call()
        except Exception as exc:
            logger.exception("Autofill LLM call failed: %s", exc)
            raise RuntimeError(f"LLM call failed: {exc}") from exc

        try:
            payload = coerce_json_object(response)
            return self._sanitize_generated_payload(payload)
        except ValueError:
            # As a last resort, try to salvage a single agent/location object from a bundled scenario blob.
            logger.warning("Primary JSON parse failed; attempting targeted extraction from raw text")
            text = str(response)
            salvage = self._salvage_first_object_from_text(text)
            if salvage is None:
                logger.error("Failed to parse LLM JSON payload", exc_info=True)
                raise RuntimeError("LLM returned unparsable JSON content")
            return self._sanitize_generated_payload(salvage)

    @staticmethod
    def _strip_wrapping_quotes(text: str) -> str:
        if isinstance(text, str) and len(text) >= 2 and text[0] == text[-1] == '"':
            return text[1:-1]
        return text

    def _sanitize_generated_payload(self, data: Any) -> Any:
        if isinstance(data, dict):
            sanitized: Dict[str, Any] = {}
            for key, value in data.items():
                new_key = self._strip_wrapping_quotes(key) if isinstance(key, str) else key
                sanitized[new_key] = self._sanitize_generated_payload(value)
            return sanitized
        if isinstance(data, list):
            return [self._sanitize_generated_payload(item) for item in data]
        if isinstance(data, str):
            return self._strip_wrapping_quotes(data.strip())
        return data

    def _salvage_first_object_from_text(self, text: str) -> Optional[Dict[str, Any]]:
        """Try to recover a single object (first agent or first location) from a bundled JSON-ish text.

        Strategy:
        - Find top-level keys agents or locations
        - Extract the first {...} object inside the corresponding array using a simple brace counter
        - Parse that object with json-repair
        Returns None if nothing plausible found.
        """
        import re
        from json_repair import repair_json

        def _extract_first_object_after(key: str) -> Optional[str]:
            m = re.search(rf'"{key}"\s*:\s*\[', text)
            if not m:
                return None
            i = m.end()
            # Skip whitespace
            n = len(text)
            while i < n and text[i].isspace():
                i += 1
            # Expect an opening brace
            while i < n and text[i] != '{':
                i += 1
            if i >= n:
                return None
            # Brace matching to capture the first object
            start = i
            depth = 0
            while i < n:
                ch = text[i]
                if ch == '{':
                    depth += 1
                elif ch == '}':
                    depth -= 1
                    if depth == 0:
                        return text[start:i+1]
                i += 1
            return None

        for key in ("agent", "agents", "location", "locations"):
            frag = _extract_first_object_after(key)
            if not frag:
                continue
            try:
                repaired = repair_json(frag)
                obj = json.loads(repaired)
                if isinstance(obj, dict):
                    # If we found from agents/locations, wrap to match call sites
                    if key.startswith('agent'):
                        return {"agent": obj}
                    if key.startswith('location'):
                        return {"location": obj}
                    return obj
            except Exception:
                continue
        return None

    def _extract_agent_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        data = dict(payload or {})

        if "data" in data and isinstance(data["data"], dict):
            data = dict(data["data"])

        if "agent" in data and isinstance(data["agent"], dict):
            data = dict(data["agent"])

        if "agents" in data and isinstance(data["agents"], list) and data["agents"]:
            first_agent = data["agents"][0]
            if isinstance(first_agent, dict):
                logger.warning("LLM returned agent bundle; selecting first entry from 'agents' list")
                data = dict(first_agent)

        allowed_keys = {
            "name",
            "age",
            "occupation",
            "occupation_description",
            "nationality",
            "country_of_residence",
            "personality_traits",
            "professional_interests",
            "personal_interests",
            "skills",
            "backstory",
            "emoji",
        }

        filtered = {key: value for key, value in data.items() if key in allowed_keys}
        if filtered != data:
            logger.info("Filtered extraneous agent fields from LLM payload: %s", sorted(set(data) - allowed_keys))
        return filtered or data

    def _extract_location_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        data = dict(payload or {})

        if "data" in data and isinstance(data["data"], dict):
            data = dict(data["data"])

        if "location" in data and isinstance(data["location"], dict):
            data = dict(data["location"])

        if "locations" in data and isinstance(data["locations"], list) and data["locations"]:
            first_location = data["locations"][0]
            if isinstance(first_location, dict):
                logger.warning("LLM returned location bundle; selecting first entry from 'locations' list")
                data = dict(first_location)

        allowed_keys = {"name", "type", "description", "x", "y", "width", "height", "image"}
        filtered = {key: value for key, value in data.items() if key in allowed_keys}
        if filtered != data:
            logger.info("Filtered extraneous location fields from LLM payload: %s", sorted(set(data) - allowed_keys))
        return filtered or data

    def _extract_scenario_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        data = dict(payload or {})
        if "data" in data and isinstance(data["data"], dict):
            data = dict(data["data"])
        agents = []
        if isinstance(data.get("agents"), list):
            agents = [x for x in data["agents"] if isinstance(x, dict)]
        locations = []
        if isinstance(data.get("locations"), list):
            locations = [x for x in data["locations"] if isinstance(x, dict)]
        beats = []
        if isinstance(data.get("narrative"), list):
            beats = [x for x in data["narrative"] if isinstance(x, dict)]
        # Some models might return "beats"
        if not beats and isinstance(data.get("beats"), list):
            beats = [x for x in data["beats"] if isinstance(x, dict)]
        return {"agents": agents, "locations": locations, "beats": beats}

    def _normalize_agent_autofill(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        payload = dict(payload or {})
        payload.setdefault("name", "Unnamed Agent")
        payload.setdefault("age", 30)
        payload.setdefault("occupation", "Specialist")
        payload.setdefault("occupation_description", "")
        payload.setdefault("nationality", "")
        payload.setdefault("country_of_residence", "")
        payload.setdefault("personality_traits", [])
        payload.setdefault("professional_interests", [])
        payload.setdefault("personal_interests", [])
        payload.setdefault("skills", [])
        payload.setdefault("backstory", "")
        payload.setdefault("emoji", "👤")  # Default fallback emoji

        # Normalize emoji: trim whitespace, take first character
        emoji = str(payload.get("emoji", "")).strip()
        if emoji:
            payload["emoji"] = emoji[0] if emoji else "👤"
        else:
            payload["emoji"] = "👤"

        # Normalize scalar types
        try:
            payload["age"] = max(18, int(payload.get("age", 30)))
        except (TypeError, ValueError):
            payload["age"] = 30

        for key in ("personality_traits", "professional_interests", "personal_interests"):
            value = payload.get(key, [])
            if isinstance(value, (str, bytes)):
                value = [value]
            elif not isinstance(value, list):
                value = list(value) if value else []
            payload[key] = [str(item).strip() for item in value if str(item).strip()]

        normalized_skills: List[Dict[str, Any]] = []
        for skill in payload.get("skills", []):
            if not isinstance(skill, dict):
                continue
            name = str(skill.get("name") or "").strip()
            if not name:
                continue
            try:
                level = int(skill.get("level", 5))
            except (TypeError, ValueError):
                level = 5
            level = max(0, min(level, 10))
            normalized_skills.append({"name": name, "level": level})
        payload["skills"] = normalized_skills

        return payload

    def _autofill_agent(self, context: Optional[str], seed: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        seed_json = json.dumps(seed or {}, indent=2)
        system_prompt = (
            "You are responsible for authoring TinyVerse simulation data. "
            "Always answer with strict JSON that can be parsed by json.loads without repair."
        )
        user_prompt = textwrap.dedent(
            f"""
            Design a believable agent persona for the TinyVerse simulation.

            Context (optional): {context or "None provided"}

            Existing seed data (JSON): {seed_json}

            Output contract (follow every rule exactly):
            1. Reply with a single JSON object—no arrays, extra keys, or surrounding text/markdown.
            2. The object must contain exactly these keys:
               name, age, occupation, occupation_description, nationality, country_of_residence,
               personality_traits, professional_interests, personal_interests, skills, backstory, emoji.
            3. Every key and string value must use double quotes. Do not include single quotes or smart quotes.
            4. age: integer between 18 and 80 inclusive.
            5. personality_traits, professional_interests, personal_interests: JSON arrays with at least two descriptive strings each.
            6. skills: JSON array with >=3 objects shaped as {{"name": "snake_case", "level": integer 0-10}}.
            7. backstory: coherent HTML paragraph string wrapped in <p>...</p> with internal double quotes escaped (\").
            8. emoji: single Unicode emoji character.
            9. If a seed value is provided, reuse or extend it without removing required keys.

            Valid format example (values are illustrative only):
            {{
              "name": "Ariadne Costa",
              "age": 32,
              "occupation": "Urban Resilience Strategist",
              "occupation_description": "Designs contingency playbooks for city-scale crises",
              "nationality": "Brazilian",
              "country_of_residence": "Portugal",
              "personality_traits": ["Analytical", "Calm", "Tenacious"],
              "professional_interests": ["Systems thinking", "Disaster mitigation"],
              "personal_interests": ["Trail running", "Independent cinema"],
              "skills": [
                {{"name": "scenario_modeling", "level": 8}},
                {{"name": "stakeholder_alignment", "level": 7}},
                {{"name": "resource_triage", "level": 6}}
              ],
              "backstory": "<p>Ariadne...</p>",
              "emoji": "🧭"
            }}

            Return only the populated JSON object.
            """
        )
        llm_payload = self._call_llm_json(system_prompt, user_prompt)
        agent_payload = self._extract_agent_payload(llm_payload)
        normalized = self._normalize_agent_autofill(agent_payload)
        agent_model = AgentCreate.model_validate(normalized)
        return agent_model.model_dump()

    def _normalize_location_autofill(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        payload = dict(payload or {})
        payload.setdefault("name", "New Location")
        payload.setdefault("type", "room")
        payload.setdefault("description", "")
        payload.setdefault("x", 0)
        payload.setdefault("y", 0)
        payload.setdefault("width", 120)
        payload.setdefault("height", 120)
        payload.setdefault("image", None)

        if payload["type"] not in {"room", "outdoor", "special"}:
            payload["type"] = "room"

        for key in ("x", "y", "width", "height"):
            try:
                payload[key] = float(payload.get(key, 0))
            except (TypeError, ValueError):
                payload[key] = 0.0

        return payload

    def _autofill_location(self, context: Optional[str], seed: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        seed_json = json.dumps(seed or {}, indent=2)
        system_prompt = (
            "You map TinyVerse locations. Output must be strict JSON parsable by json.loads with no fixes."
        )
        user_prompt = textwrap.dedent(
            f"""
            Design a location for the TinyVerse simulation world.

            Context (optional): {context or "None provided"}

            Existing seed data (JSON): {seed_json}

            Output contract (follow every rule exactly):
            1. Reply with a single JSON object—no surrounding text, code fences, or additional keys.
            2. The object must contain exactly these keys: name, type, description, x, y, width, height, image.
            3. All keys and string values must use double quotes. Numbers must be plain JSON numbers.
            4. type must be one of: "room", "outdoor", "special".
            5. x, y, width, height must be floating point numbers representing coordinates/sizes on a 2D canvas.
            6. description should be specific, sensory, and grounded; avoid filler adjectives.
            7. image can be null or a descriptive string URL/path.
            8. Preserve any provided seed values unless they violate these rules.

            Valid format example (values illustrative):
            {{
              "name": "Atrium Nexus",
              "type": "room",
              "description": "A sunlit atrium with suspended walkways and hydroponic planters",
              "x": 24.0,
              "y": 12.5,
              "width": 18.0,
              "height": 9.5,
              "image": null
            }}

            Return only the populated JSON object.
            """
        )
        llm_payload = self._call_llm_json(system_prompt, user_prompt)
        location_payload = self._extract_location_payload(llm_payload)
        normalized = self._normalize_location_autofill(location_payload)
        location_model = LocationCreate.model_validate(normalized)
        return location_model.model_dump()

    def _normalize_beat(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        d = dict(raw or {})
        # Fix over-quoted keys
        def uq(k: str) -> str:
            if isinstance(k, str) and len(k) >= 2 and k[0] == k[-1] == '"':
                return k[1:-1]
            return k
        d = {uq(k): v for k, v in d.items()}
        # Coerce types
        try:
            d["id"] = int(d.get("id", 1))
        except Exception:
            d["id"] = 1
        d["title"] = str(d.get("title", "Untitled")).strip()
        d["description"] = str(d.get("description", d.get('"description"', ""))).strip()
        d["trigger"] = str(d.get("trigger", d.get('"trigger"', ""))).strip()
        bp = d.get("blocks_progress", d.get('"blocks_progress"', False))
        d["blocks_progress"] = bool(bp in (True, "true", 1, "1"))
        # Drop weird quoted-key duplicates
        for k in ["\"description\"", "\"trigger\"", "\"blocks_progress\""]:
            d.pop(k, None)
        return d

    def _autofill_scenario(self, context: Optional[str], seed: Optional[Dict[str, Any]]) -> AutofillScenarioResponse:
        seed_json = json.dumps(seed or {}, indent=2)
        system_prompt = (
            "You author complete TinyVerse scenarios. Output must be strict JSON parsable by json.loads with no fixes."
        )
        user_prompt = textwrap.dedent(
            f"""
            Create a complete scenario with agents, locations, and beats.

            Context (optional): {context or "None provided"}

            Existing seed data (JSON): {seed_json}

            Output contract (follow every rule exactly):
            1. Reply with ONE JSON object only, no markdown and no prose.
            2. The object must have exactly these top-level keys: agents, locations, beats.
            3. agents: array of agent objects with the same schema as AgentCreate (no extra keys).
            4. locations: array of location objects with the same schema as LocationCreate (no extra keys).
            5. beats: array of objects with keys: id (int), title (string), description (string), trigger (string), blocks_progress (boolean).
            6. All keys must be in double quotes with no embedded or duplicated quotes.
            7. Do not include any other top-level keys.

            Example shape (values illustrative):
            {{
              "agents": [{{"name": "A", "age": 30, "occupation": "X", "personality_traits": [], "professional_interests": [], "personal_interests": [], "skills": [], "backstory": ""}}],
              "locations": [{{"name": "L", "type": "room", "description": "", "x": 0, "y": 0, "width": 100, "height": 100, "image": null}}],
              "beats": [{{"id": 1, "title": "Intro", "description": "...", "trigger": "...", "blocks_progress": false}}]
            }}

            Return only the JSON object.
            """
        )

        # Call and sanitize
        raw = self._call_llm_json(system_prompt, user_prompt)
        scenario = self._extract_scenario_payload(raw)

        # Validate/normalize agents
        agents: List[AgentCreate] = []
        for a in scenario.get("agents", [])[:6]:
            normalized = self._normalize_agent_autofill(a)
            agents.append(AgentCreate.model_validate(normalized))

        # Validate/normalize locations
        locations: List[LocationCreate] = []
        for l in scenario.get("locations", [])[:8]:
            normalized = self._normalize_location_autofill(l)
            locations.append(LocationCreate.model_validate(normalized))

        # Normalize beats
        beats: List[ScenarioBeat] = []
        for b in scenario.get("beats", scenario.get("narrative", []))[:12]:
            nb = self._normalize_beat(b)
            beats.append(ScenarioBeat.model_validate(nb))

        return AutofillScenarioResponse(
            agents=agents,
            locations=locations,
            beats=beats,
        )

    def autofill_form(
        self,
        form: str,
        context: Optional[str] = None,
        seed: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        if form == "agent":
            return {
                "form": "agent",
                "data": self._autofill_agent(context, seed),
            }
        if form == "location":
            return {
                "form": "location",
                "data": self._autofill_location(context, seed),
            }
        raise ValueError(f"Unsupported form type: {form}")
    
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
    
    def run_simulation(self, steps: int = 1, beat_context: Optional[str] = None) -> None:
        """
        Run the simulation for a specified number of steps.
        
        Args:
            steps: Number of simulation steps to run
            beat_context: Optional narrative context to broadcast to agents before running
        """
        if steps is None or steps < 1:
            raise ValueError("Simulation steps must be a positive integer")

        if self.simulation_running:
            raise RuntimeError("Simulation is already running")

        self.simulation_running = True
        try:
            # Inject narrative beat context if provided
            if beat_context:
                logger.info(f"Broadcasting narrative context to agents: {beat_context}")
                narrative_prompt = f"""
[NARRATIVE CONTEXT]
{beat_context}

Focus your actions and decisions on contributing to this dramatic moment in the story.
Consider how your character would naturally respond to this situation.
"""
                self.world.broadcast(narrative_prompt)
            
            self.world.run(steps)
            self.current_step += steps
        finally:
            self.simulation_running = False
    
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

    def consume_new_logs(self, only_dialogue: bool = True) -> List[Dict[str, Any]]:
        """
        Return new log entries since the last broadcast and advance the broadcast index.

        Args:
            only_dialogue: If True, return only dialogue-like entries (TALK/SAY/CHAT/etc.).

        Returns:
            List of log dicts as produced by _convert_communication_to_log
        """
        communications = getattr(self.world, "_displayed_communications_buffer", [])
        start = min(self._last_broadcast_index, len(communications))
        new_items = communications[start:]

        results: List[Dict[str, Any]] = []
        dialogueish = {"TALK", "SAY", "SPEAK", "DIALOG", "DIALOGUE", "MESSAGE", "CHAT", "UTTER", "UTTERANCE"}
        for c in new_items:
            log = self._convert_communication_to_log(c)
            if not log:
                continue
            if only_dialogue:
                action = (log.get("action_type") or "").upper()
                if not any(k in action for k in dialogueish):
                    continue
            # normalize timestamp to iso string for JSON
            ts = log.get("timestamp")
            if hasattr(ts, "isoformat"):
                log["timestamp"] = ts.isoformat()
            results.append(log)

        # advance index
        self._last_broadcast_index = len(communications)
        return results


# Global adapter instance
adapter = TinyTroupeAdapter()
