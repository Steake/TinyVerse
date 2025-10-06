#!/usr/bin/env python3
"""
Database management script for TinyVerse.

Provides utilities for database initialization, migrations, and management.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import init_db, reset_db, engine
from app.config import settings
from sqlalchemy import inspect


def check_db():
    """Check database connection and show current tables."""
    print(f"Database URL: {settings.database_url}")
    print()
    
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if not tables:
            print("No tables found in database.")
            print("Run 'python db_manager.py init' to create tables.")
        else:
            print(f"Found {len(tables)} tables:")
            for table in tables:
                print(f"  - {table}")
                # Show column count
                columns = inspector.get_columns(table)
                print(f"    ({len(columns)} columns)")
        
        print()
        print("Database connection: OK")
        return True
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return False


def init():
    """Initialize database tables."""
    print("Initializing database...")
    try:
        init_db()
        print("Database initialized successfully!")
        print()
        check_db()
    except Exception as e:
        print(f"Error initializing database: {e}")
        return False


def reset():
    """Reset database (WARNING: deletes all data)."""
    response = input("WARNING: This will delete all data. Continue? (yes/no): ")
    if response.lower() != "yes":
        print("Operation cancelled.")
        return
    
    print("Resetting database...")
    try:
        reset_db()
        print("Database reset successfully!")
        print()
        check_db()
    except Exception as e:
        print(f"Error resetting database: {e}")
        return False


def show_help():
    """Show help message."""
    print("""
TinyVerse Database Manager

Usage:
    python db_manager.py <command>

Commands:
    check   - Check database connection and show tables
    init    - Initialize database tables (safe, creates if not exists)
    reset   - Reset database (WARNING: deletes all data)
    help    - Show this help message

Examples:
    python db_manager.py check
    python db_manager.py init

For migrations, use Alembic:
    alembic upgrade head    - Apply all migrations
    alembic downgrade -1    - Rollback one migration
    alembic history         - Show migration history
    alembic current         - Show current migration
    """)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        show_help()
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "check":
        check_db()
    elif command == "init":
        init()
    elif command == "reset":
        reset()
    elif command == "help":
        show_help()
    else:
        print(f"Unknown command: {command}")
        print("Run 'python db_manager.py help' for usage.")
        sys.exit(1)
