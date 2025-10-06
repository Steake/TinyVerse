"""
Tests for database integration.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.agent import Agent, Skill
from app.models.location import Location
from app.models.simulation import SimulationRun, SimulationEvent
from app.services.database_service import DatabaseService


@pytest.fixture
def test_db():
    """Create a test database."""
    # Use in-memory SQLite for testing
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestSessionLocal()
    
    try:
        yield db
    finally:
        db.close()


def test_save_and_get_agent(test_db):
    """Test saving and retrieving an agent."""
    service = DatabaseService()
    
    agent_data = {
        "id": "test-agent-1",
        "name": "Test Agent",
        "age": 30,
        "occupation": "Software Engineer",
        "personality_traits": ["curious", "analytical"],
        "professional_interests": ["AI", "ML"],
        "skills": [
            {"name": "Python", "level": 8},
            {"name": "JavaScript", "level": 6}
        ]
    }
    
    # Save agent
    saved_agent = service.save_agent(test_db, agent_data)
    assert saved_agent.id == "test-agent-1"
    assert saved_agent.name == "Test Agent"
    
    # Get agent
    retrieved_agent = service.get_agent(test_db, "test-agent-1")
    assert retrieved_agent is not None
    assert retrieved_agent.name == "Test Agent"
    assert retrieved_agent.age == 30


def test_list_agents(test_db):
    """Test listing all agents."""
    service = DatabaseService()
    
    # Create multiple agents
    for i in range(3):
        agent_data = {
            "id": f"test-agent-{i}",
            "name": f"Agent {i}",
            "age": 25 + i,
            "occupation": "Tester",
            "skills": []
        }
        service.save_agent(test_db, agent_data)
    
    # List agents
    agents = service.list_agents(test_db)
    assert len(agents) == 3


def test_delete_agent(test_db):
    """Test deleting an agent."""
    service = DatabaseService()
    
    agent_data = {
        "id": "test-agent-delete",
        "name": "Delete Me",
        "age": 30,
        "occupation": "Tester",
        "skills": []
    }
    
    service.save_agent(test_db, agent_data)
    
    # Verify agent exists
    agent = service.get_agent(test_db, "test-agent-delete")
    assert agent is not None
    
    # Delete agent
    deleted = service.delete_agent(test_db, "test-agent-delete")
    assert deleted is True
    
    # Verify agent is gone
    agent = service.get_agent(test_db, "test-agent-delete")
    assert agent is None


def test_save_location(test_db):
    """Test saving a location."""
    service = DatabaseService()
    
    location_data = {
        "id": "test-location-1",
        "name": "Test Office",
        "description": "A test office space",
        "location_type": "office"
    }
    
    saved_location = service.save_location(test_db, location_data)
    assert saved_location.id == "test-location-1"
    assert saved_location.name == "Test Office"


def test_save_simulation_event(test_db):
    """Test saving simulation events."""
    service = DatabaseService()
    
    event_data = {
        "simulation_run_id": "test-run-1",
        "agent_id": "agent-1",
        "agent_name": "Test Agent",
        "action_type": "action",
        "content": "Test action performed"
    }
    
    saved_event = service.save_simulation_event(test_db, event_data)
    assert saved_event.agent_id == "agent-1"
    assert saved_event.content == "Test action performed"


def test_get_simulation_logs(test_db):
    """Test retrieving simulation logs."""
    service = DatabaseService()
    
    # Create multiple events
    for i in range(5):
        event_data = {
            "simulation_run_id": "test-run-1",
            "agent_id": f"agent-{i}",
            "agent_name": f"Agent {i}",
            "action_type": "action",
            "content": f"Action {i}"
        }
        service.save_simulation_event(test_db, event_data)
    
    # Get logs
    logs = service.get_simulation_logs(test_db, "test-run-1", limit=10)
    assert len(logs) == 5


def test_update_agent(test_db):
    """Test updating an existing agent."""
    service = DatabaseService()
    
    # Create agent
    agent_data = {
        "id": "test-agent-update",
        "name": "Original Name",
        "age": 30,
        "occupation": "Developer",
        "skills": []
    }
    service.save_agent(test_db, agent_data)
    
    # Update agent
    updated_data = {
        "id": "test-agent-update",
        "name": "Updated Name",
        "age": 31,
        "occupation": "Senior Developer",
        "skills": []
    }
    service.save_agent(test_db, updated_data)
    
    # Verify update
    agent = service.get_agent(test_db, "test-agent-update")
    assert agent.name == "Updated Name"
    assert agent.age == 31
