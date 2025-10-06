# Database Integration Guide

## Overview

TinyVerse uses SQLAlchemy as the ORM and supports both SQLite (development) and PostgreSQL (production).

## Database Schema

The database includes the following tables:

### Core Tables

- **agents**: Stores agent profiles and attributes
- **skills**: Agent skills with proficiency levels (related to agents)
- **locations**: Physical locations in the simulation
- **simulation_logs**: Event and action logs from simulations
- **relationships**: Connections between agents
- **routines**: Agent schedules and recurring behaviors

### Entity Relationships

```
agents (1) ----< (N) skills
agents (1) ----< (N) simulation_logs
agents (N) ----< (N) relationships (through source/target)
agents (1) ----< (N) routines
locations (1) ----< (N) routines
```

## Configuration

Database settings are configured in `.env`:

```bash
# Development (SQLite)
DATABASE_URL=sqlite:///./tinyverse.db

# Production (PostgreSQL)
# DATABASE_URL=postgresql://user:password@localhost/tinyverse
```

## Database Management

### Initialize Database

Create all tables:

```bash
python db_manager.py init
```

### Check Database Status

View current tables and connection:

```bash
python db_manager.py check
```

### Reset Database (Development Only)

⚠️ **WARNING**: This deletes all data!

```bash
python db_manager.py reset
```

## Using Alembic Migrations

### Apply Migrations

Run all pending migrations:

```bash
alembic upgrade head
```

### Rollback Migration

Undo the last migration:

```bash
alembic downgrade -1
```

### View Migration History

```bash
alembic history
```

### Check Current Migration

```bash
alembic current
```

### Create New Migration

After modifying models, generate a new migration:

```bash
alembic revision --autogenerate -m "Description of changes"
```

## Using the Database in Code

### With FastAPI Dependency Injection

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Agent

@router.get("/agents")
def list_agents(db: Session = Depends(get_db)):
    agents = db.query(Agent).all()
    return agents
```

### With Context Manager

```python
from app.database import get_db_context
from app.models import Agent

with get_db_context() as db:
    agent = Agent(id="test", name="Test", ...)
    db.add(agent)
    # Automatically commits on exit
```

### Direct Session Usage

```python
from app.database import SessionLocal
from app.models import Agent

db = SessionLocal()
try:
    agent = Agent(id="test", name="Test", ...)
    db.add(agent)
    db.commit()
finally:
    db.close()
```

## Connection Pooling

SQLAlchemy is configured with connection pooling:

- `pool_pre_ping=True`: Verifies connections before use
- `pool_recycle=3600`: Recycles connections after 1 hour
- Automatic reconnection on connection failures

## Error Handling

The `get_db_context()` context manager automatically handles transactions:

- Commits on successful completion
- Rolls back on exceptions
- Always closes the connection

## Best Practices

1. **Always use context managers or dependencies** for database sessions
2. **Never commit directly in services** - let the context manager handle it
3. **Use transactions** for operations that modify multiple records
4. **Add indexes** to frequently queried fields
5. **Use migrations** for schema changes in production

## Testing

Database tests use an in-memory SQLite database:

```python
import pytest
from app.database import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()
```

Run database tests:

```bash
pytest tests/test_database.py -v
```

## Production Deployment

### PostgreSQL Setup

1. Install PostgreSQL
2. Create database:
   ```sql
   CREATE DATABASE tinyverse;
   CREATE USER tinyverse_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE tinyverse TO tinyverse_user;
   ```

3. Update `.env`:
   ```bash
   DATABASE_URL=postgresql://tinyverse_user:your_password@localhost/tinyverse
   ```

4. Run migrations:
   ```bash
   alembic upgrade head
   ```

### Backup and Restore

**SQLite**:
```bash
# Backup
cp tinyverse.db tinyverse.db.backup

# Restore
cp tinyverse.db.backup tinyverse.db
```

**PostgreSQL**:
```bash
# Backup
pg_dump tinyverse > backup.sql

# Restore
psql tinyverse < backup.sql
```

## Troubleshooting

### "No such table" error

Run database initialization:
```bash
python db_manager.py init
```

### Connection pool exhausted

Ensure database sessions are properly closed. Use context managers.

### Migration conflicts

Check current state:
```bash
alembic current
alembic history
```

Reset to a specific version:
```bash
alembic downgrade <revision>
alembic upgrade head
```

## Additional Resources

- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [FastAPI Database Guide](https://fastapi.tiangolo.com/tutorial/sql-databases/)
