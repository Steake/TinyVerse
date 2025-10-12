#!/usr/bin/env python3
"""
Add emoji column to agents table.
"""
import sqlite3
import sys
from pathlib import Path


def main():
    db_path = Path(__file__).parent / "tinyverse.db"
    
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        sys.exit(1)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(agents)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'emoji' in columns:
            print("✓ emoji column already exists")
            return
        
        # Add emoji column
        print("Adding emoji column to agents table...")
        cursor.execute("ALTER TABLE agents ADD COLUMN emoji VARCHAR DEFAULT NULL")
        conn.commit()
        print("✓ Migration complete")
        
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
