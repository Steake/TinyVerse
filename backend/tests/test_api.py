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


def test_update_agent():
    """Test updating an agent."""
    # First create an agent
    agent_data = {
        "name": "Agent to Update",
        "age": 25,
        "occupation": "Designer",
    }
    create_response = client.post("/api/agents", json=agent_data)
    assert create_response.status_code == 201
    agent_id = create_response.json()["id"]
    
    # Update the agent
    update_data = {
        "age": 26,
        "occupation": "Senior Designer",
    }
    update_response = client.patch(f"/api/agents/{agent_id}", json=update_data)
    assert update_response.status_code == 200
    updated_agent = update_response.json()
    assert updated_agent["age"] == 26
    assert updated_agent["occupation"] == "Senior Designer"
    assert updated_agent["name"] == "Agent to Update"  # Unchanged


def test_get_simulation_state():
    """Test getting simulation state."""
    response = client.get("/api/simulation/state")
    assert response.status_code == 200
    data = response.json()
    assert "is_running" in data
    assert "agents_count" in data


# World/Location tests

def test_create_location():
    """Test creating a location."""
    location_data = {
        "name": "Test Room",
        "type": "room",
        "description": "A test room",
        "x": 10.0,
        "y": 20.0,
        "width": 100.0,
        "height": 100.0,
    }
    response = client.post("/api/locations", json=location_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Room"
    assert data["type"] == "room"
    assert data["x"] == 10.0
    assert "id" in data


def test_list_locations():
    """Test listing locations."""
    response = client.get("/api/locations")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_update_location():
    """Test updating a location."""
    # First create a location
    location_data = {
        "name": "Location to Update",
        "type": "outdoor",
    }
    create_response = client.post("/api/locations", json=location_data)
    assert create_response.status_code == 201
    location_id = create_response.json()["id"]
    
    # Update the location
    update_data = {
        "name": "Updated Location",
        "description": "Now with a description",
    }
    update_response = client.patch(f"/api/locations/{location_id}", json=update_data)
    assert update_response.status_code == 200
    updated_location = update_response.json()
    assert updated_location["name"] == "Updated Location"
    assert updated_location["description"] == "Now with a description"
    assert updated_location["type"] == "outdoor"  # Unchanged


def test_delete_location():
    """Test deleting a location."""
    # First create a location
    location_data = {"name": "Location to Delete", "type": "room"}
    create_response = client.post("/api/locations", json=location_data)
    location_id = create_response.json()["id"]
    
    # Delete the location
    delete_response = client.delete(f"/api/locations/{location_id}")
    assert delete_response.status_code == 204
    
    # Verify it's deleted
    get_response = client.get("/api/locations")
    locations = get_response.json()
    assert not any(loc["id"] == location_id for loc in locations)


# Connection tests

def test_create_connection():
    """Test creating a connection between locations."""
    # First create two locations
    loc1_data = {"name": "Room 1", "type": "room"}
    loc2_data = {"name": "Room 2", "type": "room"}
    
    loc1_response = client.post("/api/locations", json=loc1_data)
    loc2_response = client.post("/api/locations", json=loc2_data)
    
    loc1_id = loc1_response.json()["id"]
    loc2_id = loc2_response.json()["id"]
    
    # Create connection
    connection_data = {
        "source": loc1_id,
        "target": loc2_id,
        "type": "door",
    }
    response = client.post("/api/connections", json=connection_data)
    assert response.status_code == 201
    data = response.json()
    assert data["source"] == loc1_id
    assert data["target"] == loc2_id
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
    # Create locations and connection
    loc1_response = client.post("/api/locations", json={"name": "L1", "type": "room"})
    loc2_response = client.post("/api/locations", json={"name": "L2", "type": "room"})
    
    connection_data = {
        "source": loc1_response.json()["id"],
        "target": loc2_response.json()["id"],
        "type": "path",
    }
    create_response = client.post("/api/connections", json=connection_data)
    connection_id = create_response.json()["id"]
    
    # Delete the connection
    delete_response = client.delete(f"/api/connections/{connection_id}")
    assert delete_response.status_code == 204


def test_create_connection_invalid_location():
    """Test creating a connection with invalid location IDs."""
    connection_data = {
        "source": "invalid-id-1",
        "target": "invalid-id-2",
        "type": "path",
    }
    response = client.post("/api/connections", json=connection_data)
    assert response.status_code == 400  # Bad request
    assert "not found" in response.json()["detail"].lower()


def test_delete_location_with_connections():
    """Test that deleting a location also deletes its connections."""
    # Create locations and connection
    loc1_response = client.post("/api/locations", json={"name": "L1", "type": "room"})
    loc2_response = client.post("/api/locations", json={"name": "L2", "type": "room"})
    
    loc1_id = loc1_response.json()["id"]
    loc2_id = loc2_response.json()["id"]
    
    connection_data = {
        "source": loc1_id,
        "target": loc2_id,
        "type": "path",
    }
    conn_response = client.post("/api/connections", json=connection_data)
    connection_id = conn_response.json()["id"]
    
    # Delete location 1
    client.delete(f"/api/locations/{loc1_id}")
    
    # Verify connection is also deleted
    connections = client.get("/api/connections").json()
    assert not any(conn["id"] == connection_id for conn in connections)

