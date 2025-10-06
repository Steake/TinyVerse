# Database Integration

## Overview

TinyVerse uses SQLAlchemy for database persistence, allowing simulation state, agents, and locations to be saved and restored across sessions.

## Database Models

### Agent Model (`app/models/agent.py`)

Stores agent information and TinyPerson state.

**Fields:**
- `id` (String, Primary Key): Unique agent identifier
- `name` (String): Agent's name
- `age` (Integer): Agent's age
- `occupation` (String): Agent's occupation
- `occupation_description` (Text): Detailed occupation description
- `personality_traits` (JSON): List of personality traits
- `professional_interests` (JSON): List of professional interests
- `personal_interests` (JSON): List of personal interests
- `backstory` (Text): Agent's backstory
- `tinytroupe_state` (JSON): Serialized TinyPerson state for restoration
- `created_at` (DateTime): Timestamp of creation
- `updated_at` (DateTime): Timestamp of last update
- `skills` (Relationship): Related Skill models

### Skill Model (`app/models/agent.py`)

Stores agent skills with proficiency levels.

**Fields:**
- `id` (Integer, Primary Key): Auto-incrementing ID
- `agent_id` (String, Foreign Key): Reference to agent
- `name` (String): Skill name (e.g., "Python", "Communication")
- `level` (Integer): Proficiency level (1-10)
- `description` (Text): Skill description

### Location Model (`app/models/location.py`)

Stores simulation locations.

**Fields:**
- `id` (String, Primary Key): Unique location identifier
- `name` (String): Location name
- `description` (Text): Location description
- `location_type` (String): Type of location (room, building, outdoor, etc.)
- `created_at` (DateTime): Timestamp of creation
- `updated_at` (DateTime): Timestamp of last update

### SimulationRun Model (`app/models/simulation.py`)

Stores simulation run metadata and state.

**Fields:**
- `id` (String, Primary Key): Unique simulation run identifier
- `name` (String): Simulation run name
- `status` (String): Run status (created, running, paused, completed, failed)
- `current_step` (Integer): Current simulation step
- `total_steps` (Integer): Total planned steps
- `world_state` (JSON): Serialized TinyWorld state
- `created_at` (DateTime): Timestamp of creation
- `started_at` (DateTime): Timestamp when simulation started
- `completed_at` (DateTime): Timestamp when simulation completed
- `updated_at` (DateTime): Timestamp of last update

### SimulationEvent Model (`app/models/simulation.py`)

Stores simulation events and logs.

**Fields:**
- `id` (Integer, Primary Key): Auto-incrementing ID
- `simulation_run_id` (String): Reference to simulation run
- `timestamp` (DateTime): Event timestamp
- `agent_id` (String): Reference to agent (if applicable)
- `agent_name` (String): Agent name for quick lookup
- `action_type` (String): Type of action (action, interaction, thought, etc.)
- `content` (Text): Event content/description
- `metadata` (JSON): Additional event data

## Database Service

The `DatabaseService` class (`app/services/database_service.py`) provides a service layer for database operations.

### Key Methods

#### Agent Operations
```python
from app.services import db_service
from app.database import SessionLocal

db = SessionLocal()

# Save agent
agent_data = {
    "id": "agent-123",
    "name": "Alice",
    "age": 30,
    "occupation": "Software Engineer",
    "skills": [
        {"name": "Python", "level": 8},
        {"name": "JavaScript", "level": 6}
    ]
}
saved_agent = db_service.save_agent(db, agent_data)

# Get agent
agent = db_service.get_agent(db, "agent-123")

# List agents
agents = db_service.list_agents(db)

# Delete agent
db_service.delete_agent(db, "agent-123")
```

#### Location Operations
```python
# Save location
location_data = {
    "id": "loc-123",
    "name": "Office",
    "description": "Modern office space",
    "location_type": "office"
}
saved_location = db_service.save_location(db, location_data)

# Get location
location = db_service.get_location(db, "loc-123")

# List locations
locations = db_service.list_locations(db)

# Delete location
db_service.delete_location(db, "loc-123")
```

#### Simulation Operations
```python
# Save simulation run
run_data = {
    "id": "run-123",
    "name": "Test Simulation",
    "status": "running",
    "current_step": 10,
    "total_steps": 100
}
saved_run = db_service.save_simulation_run(db, run_data)

# Save simulation event
event_data = {
    "simulation_run_id": "run-123",
    "agent_id": "agent-123",
    "agent_name": "Alice",
    "action_type": "action",
    "content": "Alice is working on a project"
}
saved_event = db_service.save_simulation_event(db, event_data)

# Get simulation logs
logs = db_service.get_simulation_logs(db, "run-123", limit=100)
```

## Database Setup

### Configuration

Database settings are configured in `app/config.py`:

```python
class Settings(BaseSettings):
    database_url: str = "sqlite:///./tinyverse.db"  # Default SQLite
    # For PostgreSQL: "postgresql://user:password@localhost/tinyverse"
```

### Environment Variables

Set the database URL in `.env`:

```bash
# SQLite (Development)
DATABASE_URL=sqlite:///./tinyverse.db

# PostgreSQL (Production)
DATABASE_URL=postgresql://user:password@localhost:5432/tinyverse

# MySQL
DATABASE_URL=mysql://user:password@localhost:3306/tinyverse
```

### Initialization

The database is automatically initialized on application startup in `app/main.py`:

```python
@app.on_event("startup")
async def startup_event():
    from app.database import init_db
    init_db()
```

This creates all tables if they don't exist.

## Database Migrations

For production, use Alembic for database migrations:

```bash
# Initialize Alembic
alembic init alembic

# Create a migration
alembic revision --autogenerate -m "Add agents table"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Testing

Database integration tests are in `backend/tests/test_database.py`.

Run tests with:

```bash
cd backend
pytest tests/test_database.py -v
```

Tests use an in-memory SQLite database for isolation.

## Usage in API Endpoints

Use the `get_db()` dependency in FastAPI endpoints:

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import db_service

@router.post("/agents")
async def create_agent(agent: AgentCreate, db: Session = Depends(get_db)):
    # Save to database
    saved_agent = db_service.save_agent(db, agent.model_dump())
    return saved_agent
```

## Best Practices

1. **Always use the service layer**: Don't access models directly in API endpoints
2. **Use transactions**: Database operations are automatically committed
3. **Handle errors**: Wrap database operations in try-except blocks
4. **Close sessions**: The `get_db()` dependency automatically closes sessions
5. **Index frequently queried fields**: Add indexes to improve query performance
6. **Use JSON fields wisely**: Good for flexible data, but not for complex queries
7. **Regular backups**: Implement automated database backups in production

## Schema Evolution

When adding new fields to models:

1. Update the model in `app/models/`
2. Create an Alembic migration
3. Update the service layer if needed
4. Update API schemas
5. Test thoroughly
6. Apply migration in production

## Performance Considerations

- **Use pagination** for list endpoints
- **Add indexes** on frequently queried fields
- **Use connection pooling** for production
- **Consider read replicas** for high-traffic deployments
- **Cache frequently accessed data** using Redis
- **Monitor query performance** and optimize slow queries

## Troubleshooting

### Database locked (SQLite)

SQLite has limited concurrency. Use PostgreSQL for production.

### Connection pool exhausted

Increase the pool size in the engine configuration:

```python
engine = create_engine(
    settings.database_url,
    pool_size=10,
    max_overflow=20
)
```

### Migration conflicts

Resolve conflicts by creating a new migration or manually editing the database.

---

*Last Updated: 2025*
