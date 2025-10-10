"""
Tests for the TinyVerse backend API.
"""
import pytest
from fastapi.testclient import TestClient
import sys

# Mock TinyTroupe modules before importing app
tinytroupe_module = type(sys)('tinytroupe')
tinytroupe_module.__path__ = []  # mark as package so submodules can be imported
sys.modules['tinytroupe'] = tinytroupe_module

agent_module = type(sys)('tinytroupe.agent')
agent_module.__path__ = []
sys.modules['tinytroupe.agent'] = agent_module

environment_module = type(sys)('tinytroupe.environment')
environment_module.__path__ = []
sys.modules['tinytroupe.environment'] = environment_module

openai_utils_module = type(sys)('tinytroupe.openai_utils')
sys.modules['tinytroupe.openai_utils'] = openai_utils_module

# Stub tinytroupe.utils.llm to satisfy adapter import
utils_pkg_module = type(sys)('tinytroupe.utils')
utils_pkg_module.__path__ = []
sys.modules['tinytroupe.utils'] = utils_pkg_module

llm_module = type(sys)('tinytroupe.utils.llm')
class _PreImportLLMChat:
    def __init__(self, *args, **kwargs):
        pass
    def call(self):
        return "{}"
llm_module.LLMChat = _PreImportLLMChat
sys.modules['tinytroupe.utils.llm'] = llm_module

# Minimal mental faculty stubs used by TinyTroupe adapter
mental_faculty_module = type(sys)('tinytroupe.agent.mental_faculty')

class _StubFaculty:
    def __init__(self, *args, **kwargs):
        pass

class _StubToolUse:
    def __init__(self, *args, **kwargs):
        self.tools = kwargs.get("tools", [])

mental_faculty_module.CustomMentalFaculty = _StubFaculty
mental_faculty_module.RecallFaculty = _StubFaculty
mental_faculty_module.FilesAndWebGroundingFaculty = _StubFaculty
mental_faculty_module.TinyToolUse = _StubToolUse
sys.modules['tinytroupe.agent.mental_faculty'] = mental_faculty_module

# Minimal tools stubs
tools_module = type(sys)('tinytroupe.tools')
tools_module.__path__ = []
sys.modules['tinytroupe.tools'] = tools_module

calendar_module = type(sys)('tinytroupe.tools.tiny_calendar')

class _StubCalendar:
    def __init__(self, *args, **kwargs):
        pass

calendar_module.TinyCalendar = _StubCalendar
sys.modules['tinytroupe.tools.tiny_calendar'] = calendar_module

word_processor_module = type(sys)('tinytroupe.tools.tiny_word_processor')

class _StubWordProcessor:
    def __init__(self, *args, **kwargs):
        pass

word_processor_module.TinyWordProcessor = _StubWordProcessor
sys.modules['tinytroupe.tools.tiny_word_processor'] = word_processor_module

class TinyPerson:
    def __init__(self, name):
        self.name = name
    def define(self, key, value):
        pass

class TinyWorld:
    def __init__(self, name):
        self.name = name
    def add_agent(self, agent):
        pass
    def remove_agent(self, agent):
        pass
    def run(self, steps):
        pass

class OpenAIClient:
    def __init__(self, cache_api_calls=False, cache_file_name=""):
        pass
    def _setup_from_config(self):
        pass

def register_client(api_type, client):
    pass

def force_api_type(api_type):
    pass

sys.modules['tinytroupe.agent'].TinyPerson = TinyPerson
sys.modules['tinytroupe.environment'].TinyWorld = TinyWorld
sys.modules['tinytroupe.openai_utils'].OpenAIClient = OpenAIClient
sys.modules['tinytroupe.openai_utils'].register_client = register_client
sys.modules['tinytroupe.openai_utils'].force_api_type = force_api_type

from app.main import app

# Patch LLMChat used inside adapter to return malformed scenario JSON-like blob
import types
import json as _json

class _LLMChatStub:
    def __init__(self, system_prompt: str, user_prompt: str, **kwargs):
        self.system_prompt = system_prompt
        self.user_prompt = user_prompt
    def call(self):
        return _json.dumps({
            "agents": [
                {"name": "A1", "age": 28, "occupation": "Seller", "occupation_description": "",
                 "personality_traits": ["fast"], "professional_interests": [], "personal_interests": [], "skills": [], "backstory": "<p>...</p>"}
            ],
            "locations": [
                {"name": "L1", "type": "room", "description": "", "x": 1, "y": 2, "width": 3, "height": 4, "image": None}
            ],
            "narrative": [
                {"id": 1, "title": "T", "\"description\"": "D", "\"trigger\"": "Cond", "\"blocks_progress\"": False}
            ]
        })

# Inject stub
import app.services.tinytroupe_adapter as _adapter_mod
_adapter_mod.LLMChat = _LLMChatStub


client = TestClient(app)


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_api_health():
    """Test API health endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_agent():
    """Test creating an agent."""
    agent_data = {
        "name": "Test Agent",
        "age": 30,
        "occupation": "Software Engineer",
        "personality_traits": ["curious", "analytical"],
    }
    response = client.post("/api/agents", json=agent_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Agent"
    assert data["age"] == 30
    assert "id" in data


def test_list_agents():
    """Test listing agents."""
    response = client.get("/api/agents")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_agent():
    """Test getting a specific agent."""
    # First create an agent
    agent_data = {
        "name": "Specific Agent",
        "age": 25,
        "occupation": "Designer",
        "personality_traits": ["creative"],
    }
    create_response = client.post("/api/agents", json=agent_data)
    agent_id = create_response.json()["id"]
    
    # Get the agent
    response = client.get(f"/api/agents/{agent_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Specific Agent"
    assert data["id"] == agent_id


def test_get_nonexistent_agent():
    """Test getting a nonexistent agent returns 404."""
    response = client.get("/api/agents/nonexistent-id")
    assert response.status_code == 404


def test_delete_agent():
    """Test deleting an agent."""
    # Create an agent first
    agent_data = {
        "name": "To Delete",
        "age": 35,
        "occupation": "Manager",
    }
    create_response = client.post("/api/agents", json=agent_data)
    agent_id = create_response.json()["id"]
    
    # Delete the agent
    response = client.delete(f"/api/agents/{agent_id}")
    assert response.status_code == 204
    
    # Verify it's gone
    get_response = client.get(f"/api/agents/{agent_id}")
    assert get_response.status_code == 404


def test_update_agent():
    """Test updating an agent."""
    # Create an agent first
    agent_data = {
        "name": "Original Name",
        "age": 30,
        "occupation": "Engineer",
    }
    create_response = client.post("/api/agents", json=agent_data)
    agent_id = create_response.json()["id"]
    
    # Update the agent
    update_data = {
        "name": "Updated Name",
        "age": 31
    }
    response = client.patch(f"/api/agents/{agent_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["age"] == 31
    assert data["occupation"] == "Engineer"  # Unchanged


def test_get_simulation_state():
    """Test getting simulation state."""
    response = client.get("/api/simulation/state")
    assert response.status_code == 200
    data = response.json()
    assert "is_running" in data
    assert "agents_count" in data


def test_simulation_control():
    """Test simulation control endpoint."""
    # Test start
    response = client.post("/api/simulation/control", json={"action": "start", "steps": 1})
    assert response.status_code == 200
    assert "message" in response.json()
    
    # Test pause
    response = client.post("/api/simulation/control", json={"action": "pause"})
    assert response.status_code == 200
    
    # Test step
    response = client.post("/api/simulation/control", json={"action": "step"})
    assert response.status_code == 200


def test_get_simulation_logs():
    """Test getting simulation logs."""
    response = client.get("/api/simulation/logs")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_autofill_scenario_normalizes_malformed_narrative():
    # Call the new endpoint
    payload = {"context": "simple", "seed": 123}
    response = client.post("/autofill_scenario", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Ensure expected keys
    assert "agents" in data and isinstance(data["agents"], list)
    assert "locations" in data and isinstance(data["locations"], list)
    assert "beats" in data and isinstance(data["beats"], list)
    # Validate agents minimal shape
    assert len(data["agents"]) >= 1
    agent = data["agents"][0]
    for k in ["name", "occupation", "backstory"]:
        assert k in agent
    # Validate locations minimal shape
    assert len(data["locations"]) >= 1
    loc = data["locations"][0]
    for k in ["name", "type", "x", "y", "width", "height"]:
        assert k in loc
    # Beats should be normalized from malformed narrative keys into proper beat fields
    assert len(data["beats"]) >= 1
    beat = data["beats"][0]
    # adapter should map description -> description, trigger -> trigger, blocks_progress -> boolean
    assert "description" in beat and isinstance(beat["description"], str)
    assert "trigger" in beat and isinstance(beat["trigger"], str)
    assert "blocks_progress" in beat and isinstance(beat["blocks_progress"], bool)


def test_execute_simulation_action():
    """Test executing a simulation action."""
    # First create an agent
    agent_data = {
        "name": "Action Agent",
        "age": 28,
        "occupation": "Actor",
    }
    create_response = client.post("/api/agents", json=agent_data)
    agent_id = create_response.json()["id"]
    
    # Execute an action
    action_data = {
        "type": "MOVE",
        "agentId": agent_id,
        "data": {
            "location": "park"
        }
    }
    response = client.post("/api/simulation/action", json=action_data)
    assert response.status_code == 201
    data = response.json()
    assert data["agent_id"] == agent_id
    assert data["action_type"] == "MOVE"


def test_create_location():
    """Test creating a location."""
    location_data = {
        "name": "Test Room",
        "type": "room",
        "description": "A cozy test room",
        "x": 100,
        "y": 200,
        "width": 50,
        "height": 50
    }
    response = client.post("/api/locations", json=location_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Room"
    assert data["type"] == "room"
    assert "id" in data


def test_list_locations():
    """Test listing locations."""
    response = client.get("/api/locations")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_update_location():
    """Test updating a location."""
    # Create a location first
    location_data = {
        "name": "Original Name",
        "type": "room",
        "x": 0,
        "y": 0
    }
    create_response = client.post("/api/locations", json=location_data)
    location_id = create_response.json()["id"]
    
    # Update the location
    update_data = {
        "name": "Updated Name",
        "description": "New description"
    }
    response = client.patch(f"/api/locations/{location_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["description"] == "New description"


def test_delete_location():
    """Test deleting a location."""
    # Create a location first
    location_data = {
        "name": "To Delete",
        "type": "outdoor"
    }
    create_response = client.post("/api/locations", json=location_data)
    location_id = create_response.json()["id"]
    
    # Delete it
    response = client.delete(f"/api/locations/{location_id}")
    assert response.status_code == 204


def test_create_connection():
    """Test creating a connection."""
    # Create two locations first
    location1 = client.post("/api/locations", json={"name": "Room 1", "type": "room"}).json()
    location2 = client.post("/api/locations", json={"name": "Room 2", "type": "room"}).json()
    
    # Create a connection
    connection_data = {
        "source": location1["id"],
        "target": location2["id"],
        "type": "door"
    }
    response = client.post("/api/connections", json=connection_data)
    assert response.status_code == 201
    data = response.json()
    assert data["source"] == location1["id"]
    assert data["target"] == location2["id"]
    assert data["type"] == "door"
    assert "id" in data


def test_list_connections():
    """Test listing connections."""
    response = client.get("/api/connections")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_delete_connection():
    """Test deleting a connection."""
    # Create two locations and a connection
    location1 = client.post("/api/locations", json={"name": "L1", "type": "room"}).json()
    location2 = client.post("/api/locations", json={"name": "L2", "type": "room"}).json()
    connection = client.post("/api/connections", json={
        "source": location1["id"],
        "target": location2["id"],
        "type": "path"
    }).json()
    
    # Delete the connection
    response = client.delete(f"/api/connections/{connection['id']}")
    assert response.status_code == 204

