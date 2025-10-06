# Database Quick Start Guide

Get up and running with the TinyVerse database in 5 minutes.

## Prerequisites

- Python 3.10+ installed
- Virtual environment activated
- Dependencies installed (`pip install -r requirements.txt`)

## Quick Setup

### 1. Configure Database

The default configuration uses SQLite (no setup required):

```bash
# Copy environment file
cp .env.example .env

# SQLite is already configured in .env:
# DATABASE_URL=sqlite:///./tinyverse.db
```

For PostgreSQL in production, update `.env`:
```bash
DATABASE_URL=postgresql://user:password@localhost/tinyverse
```

### 2. Initialize Database

Run the database manager to create all tables:

```bash
python db_manager.py init
```

Expected output:
```
Initializing database...
Database initialized successfully!

Database URL: sqlite:///./tinyverse.db

Found 6 tables:
  - agents
    (17 columns)
  - skills
    (4 columns)
  - locations
    (6 columns)
  - simulation_logs
    (8 columns)
  - relationships
    (8 columns)
  - routines
    (10 columns)

Database connection: OK
```

### 3. Verify Setup

Check that everything is working:

```bash
python db_manager.py check
```

### 4. Start the Server

The database is automatically initialized on server startup:

```bash
uvicorn app.main:app --reload
```

Expected startup log:
```
Database initialized successfully
Custom OpenAI client initialized with base_url: default
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Basic Usage

### Creating an Agent (API)

```bash
curl -X POST http://localhost:8000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "age": 30,
    "occupation": "Data Scientist",
    "personality_traits": ["analytical", "curious"],
    "professional_interests": ["AI", "Python"],
    "personal_interests": ["reading"],
    "skills": [
      {"name": "Python", "level": 9},
      {"name": "SQL", "level": 7}
    ]
  }'
```

### Listing Agents

```bash
curl http://localhost:8000/api/agents
```

### Checking Database

```bash
python db_manager.py check
```

## Database Files

### SQLite (Development)

- `tinyverse.db` - Main database file
- `tinyverse.db-journal` - Transaction journal (temporary)
- `tinyverse.db-wal` - Write-ahead log (temporary)

**Note:** These files are git-ignored automatically.

### Location

Database files are created in the `backend/` directory by default.

## Common Operations

### Reset Database (Development Only)

⚠️ **WARNING**: This deletes all data!

```bash
python db_manager.py reset
```

### Run Database Tests

```bash
pytest tests/test_database.py -v
```

Expected output:
```
tests/test_database.py::TestAgentModel::test_create_agent PASSED
tests/test_database.py::TestAgentModel::test_agent_with_skills PASSED
tests/test_database.py::TestAgentModel::test_delete_agent_cascades_skills PASSED
...
```

### Use Alembic Migrations

```bash
# Check current migration
alembic current

# View migration history
alembic history

# Apply all migrations
alembic upgrade head
```

## Troubleshooting

### "No such table: agents"

The database hasn't been initialized. Run:
```bash
python db_manager.py init
```

### "Database is locked"

SQLite is being accessed by multiple processes. Stop all servers and try again.

### "Cannot connect to database"

Check your `DATABASE_URL` in `.env`:
- SQLite: Ensure path is writable
- PostgreSQL: Verify server is running and credentials are correct

### Start Fresh

Delete the database and reinitialize:
```bash
# SQLite only
rm -f tinyverse.db*
python db_manager.py init
```

## Next Steps

- Read [DATABASE.md](DATABASE.md) for detailed documentation
- Read [IMPLEMENTATION.md](IMPLEMENTATION.md) for architecture details
- Explore the API at http://localhost:8000/docs

## Database Schema Overview

```
agents (main profiles)
  ├── skills (agent skills)
  ├── simulation_logs (activity logs)
  └── relationships (social connections)
      └── routines (schedules)
          └── locations (places)
```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `python db_manager.py init` | Create tables |
| `python db_manager.py check` | Verify setup |
| `python db_manager.py reset` | Delete all data |
| `alembic upgrade head` | Apply migrations |
| `pytest tests/test_database.py` | Run tests |

## Production Deployment

### PostgreSQL Setup

1. Create database:
```sql
CREATE DATABASE tinyverse;
CREATE USER tinyverse_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE tinyverse TO tinyverse_user;
```

2. Update `.env`:
```bash
DATABASE_URL=postgresql://tinyverse_user:secure_password@localhost/tinyverse
```

3. Initialize:
```bash
alembic upgrade head
```

## Support

For issues or questions:
- Check [DATABASE.md](DATABASE.md) for detailed docs
- Check [IMPLEMENTATION.md](IMPLEMENTATION.md) for architecture
- Review test examples in `tests/test_database.py`
- See main [README.md](README.md) for general setup

---

**Time to First Agent**: < 5 minutes! 🚀
