#!/usr/bin/env python3
"""
Migration script to add coordinate fields to locations table.
"""
import sqlite3
from pathlib import Path
import sys


def migrate():
    """Add x, y, width, height columns to locations table."""
    db_path = Path(__file__).parent / "tinyverse.db"
    
    if not db_path.exists():
        print(f"❌ Database not found at {db_path}")
        sys.exit(1)
    
    print(f"Migrating database: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Get current columns
        cursor.execute("PRAGMA table_info(locations)")
        columns = {row[1] for row in cursor.fetchall()}
        
        # Add missing columns
        migrations = [
            ("x", "REAL DEFAULT 0"),
            ("y", "REAL DEFAULT 0"),
            ("width", "REAL DEFAULT 100"),
            ("height", "REAL DEFAULT 100"),
            ("image", "TEXT")
        ]
        
        added = []
        for col_name, col_def in migrations:
            if col_name not in columns:
                print(f"Adding {col_name} column...")
                cursor.execute(f"ALTER TABLE locations ADD COLUMN {col_name} {col_def}")
                added.append(col_name)
            else:
                print(f"Column {col_name} already exists, skipping")
        
        if not added:
            print("No columns to add, already up to date")
        else:
            conn.commit()
            print(f"\n✅ Migration successful! Added columns: {', '.join(added)}")
        
        # Show final schema
        cursor.execute("PRAGMA table_info(locations)")
        print("\nCurrent locations table schema:")
        for row in cursor.fetchall():
            print(f"  {row[1]} ({row[2]})")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()
