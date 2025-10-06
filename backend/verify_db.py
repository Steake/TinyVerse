#!/usr/bin/env python3
"""
Verify database setup without requiring TinyTroupe.

This script validates that the database models are correctly defined
and can be used to create tables.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Mock TinyTroupe imports to avoid dependency issues
class MockTinyPerson:
    def __init__(self, name):
        self.name = name
    def define(self, key, value):
        pass

class MockTinyWorld:
    def __init__(self, name):
        self.name = name
    def add_agent(self, agent):
        pass
    def remove_agent(self, agent):
        pass

# Inject mocks
sys.modules['tinytroupe'] = type(sys)('tinytroupe')
sys.modules['tinytroupe.agent'] = type(sys)('tinytroupe.agent')
sys.modules['tinytroupe.environment'] = type(sys)('tinytroupe.environment')
sys.modules['tinytroupe'].agent = sys.modules['tinytroupe.agent']
sys.modules['tinytroupe'].environment = sys.modules['tinytroupe.environment']
sys.modules['tinytroupe.agent'].TinyPerson = MockTinyPerson
sys.modules['tinytroupe.environment'].TinyWorld = MockTinyWorld

# Now import our modules
from app.database import Base, engine
from app.models import Agent, Skill, Location, SimulationLog, Relationship, Routine
from sqlalchemy import inspect


def verify_models():
    """Verify that all models are properly defined."""
    print("=" * 60)
    print("Database Model Verification")
    print("=" * 60)
    print()
    
    models = [Agent, Skill, Location, SimulationLog, Relationship, Routine]
    
    print(f"Found {len(models)} models:")
    for model in models:
        print(f"  ✓ {model.__name__}")
    print()
    
    # Check table names
    print("Table names:")
    for model in models:
        print(f"  - {model.__tablename__}")
    print()
    
    # Try to create tables
    print("Creating tables in memory database...")
    try:
        Base.metadata.create_all(bind=engine)
        print("  ✓ Tables created successfully")
    except Exception as e:
        print(f"  ✗ Error creating tables: {e}")
        return False
    print()
    
    # Inspect created tables
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print(f"Created {len(tables)} tables:")
    for table in sorted(tables):
        columns = inspector.get_columns(table)
        print(f"  - {table} ({len(columns)} columns)")
    print()
    
    # Verify relationships
    print("Checking foreign key relationships:")
    for table in tables:
        fks = inspector.get_foreign_keys(table)
        if fks:
            for fk in fks:
                print(f"  ✓ {table}.{fk['constrained_columns'][0]} -> {fk['referred_table']}.{fk['referred_columns'][0]}")
    print()
    
    # Check indexes
    print("Checking indexes:")
    for table in tables:
        indexes = inspector.get_indexes(table)
        if indexes:
            for idx in indexes:
                print(f"  ✓ {table}: {', '.join(idx['column_names'])}")
    print()
    
    print("=" * 60)
    print("✓ Database model verification complete!")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = verify_models()
    sys.exit(0 if success else 1)
