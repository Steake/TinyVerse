"""
Tests for the TinyVerse backend API.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


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


def test_get_simulation_state():
    """Test getting simulation state."""
    response = client.get("/api/simulation/state")
    assert response.status_code == 200
    data = response.json()
    assert "is_running" in data
    assert "agents_count" in data
