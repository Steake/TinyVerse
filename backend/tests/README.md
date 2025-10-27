# TinyVerse Backend Tests

This directory contains automated tests for the TinyVerse backend API.

## Running Tests

### Prerequisites

Make sure you have installed all dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### Run All Tests

```bash
pytest tests/
```

### Run with Verbose Output

```bash
pytest tests/ -v
```

### Run Specific Test File

```bash
pytest tests/test_api.py -v
```

### Run Specific Test

```bash
pytest tests/test_api.py::test_create_agent -v
```

### Run with Coverage Report

```bash
pytest tests/ --cov=app --cov-report=html
```

This generates an HTML coverage report in `htmlcov/index.html`.

## Test Structure

### test_api.py

Contains integration tests for all API endpoints:

#### Health Check Tests
- `test_health_check()` - Root health endpoint
- `test_api_health()` - API health endpoint

#### Agent Tests
- `test_create_agent()` - Creating new agents
- `test_list_agents()` - Listing all agents
- `test_update_agent()` - Updating agent attributes
- `test_get_simulation_state()` - Getting simulation state

#### Location Tests
- `test_create_location()` - Creating new locations
- `test_list_locations()` - Listing all locations
- `test_update_location()` - Updating location attributes
- `test_delete_location()` - Deleting locations

#### Connection Tests
- `test_create_connection()` - Creating connections between locations
- `test_list_connections()` - Listing all connections
- `test_delete_connection()` - Deleting connections
- `test_create_connection_invalid_location()` - Validation error handling
- `test_delete_location_with_connections()` - Cascade deletion behavior

## Writing New Tests

### Basic Test Template

```python
def test_your_feature():
    """Test description."""
    # Arrange
    test_data = {"key": "value"}
    
    # Act
    response = client.post("/api/endpoint", json=test_data)
    
    # Assert
    assert response.status_code == 201
    assert response.json()["key"] == "value"
```

### Testing Error Cases

```python
def test_error_case():
    """Test error handling."""
    response = client.get("/api/nonexistent/123")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
```

### Using Fixtures

```python
@pytest.fixture
def sample_agent():
    """Create a sample agent for testing."""
    agent_data = {
        "name": "Test Agent",
        "age": 30,
        "occupation": "Tester"
    }
    response = client.post("/api/agents", json=agent_data)
    return response.json()

def test_with_fixture(sample_agent):
    """Test using a fixture."""
    agent_id = sample_agent["id"]
    response = client.get(f"/api/agents/{agent_id}")
    assert response.status_code == 200
```

## Test Isolation

Each test should be independent and not rely on the state from other tests. The current implementation uses a shared adapter instance, which means tests may affect each other. For production use, consider:

1. Using a database with transaction rollback
2. Resetting the adapter state between tests
3. Using test-specific adapter instances

## Continuous Integration

These tests are designed to run in CI/CD pipelines. Make sure to:

1. Set required environment variables (like `OPENAI_API_KEY`)
2. Install all dependencies
3. Run tests with appropriate timeout settings

Example CI configuration:

```yaml
test:
  script:
    - cd backend
    - pip install -r requirements.txt
    - pytest tests/ --cov=app --cov-report=xml
```

## Troubleshooting

### Import Errors

If you get import errors, make sure you're running from the backend directory:

```bash
cd backend
PYTHONPATH=. pytest tests/
```

### TinyTroupe Not Found

Install TinyTroupe:

```bash
pip install git+https://github.com/microsoft/TinyTroupe.git@main
```

### Test Failures

1. Check that the FastAPI server isn't already running
2. Ensure all dependencies are installed
3. Check that no conflicting ports are in use
4. Review test output for specific error messages

## Test Coverage Goals

- **Endpoint Coverage**: All API endpoints should have tests
- **Success Cases**: Test normal operation paths
- **Error Cases**: Test validation and error handling
- **Edge Cases**: Test boundary conditions
- **Integration**: Test interactions between components

Current coverage areas:
- ✅ Agent CRUD operations
- ✅ Location CRUD operations
- ✅ Connection CRUD operations
- ✅ Simulation state retrieval
- ✅ Error handling for invalid inputs
- ✅ Cascade deletion behavior

## Contributing

When adding new features:

1. Write tests before implementing the feature (TDD)
2. Ensure all existing tests still pass
3. Add tests for both success and failure cases
4. Update this README if adding new test categories

## Resources

- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [Pytest Documentation](https://docs.pytest.org/)
- [TestClient Documentation](https://www.starlette.io/testclient/)
