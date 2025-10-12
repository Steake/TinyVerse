#!/usr/bin/env python3
"""
Migration script to add location tracking fields to agents table.
Adds: current_location (location_id where agent is) and group (for organization)
"""
import sqlite3
import sys
from pathlib import Path

# Get database path
db_path = Path(__file__).parent / "tinyverse.db"

if not db_path.exists():
    print(f"Database not found at {db_path}")
    sys.exit(1)

print(f"Migrating database: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if columns already exist
    cursor.execute("PRAGMA table_info(agents)")
    columns = {row[1] for row in cursor.fetchall()}
    
    migrations_applied = []
    
    # Add current_location column
    if 'current_location' not in columns:
        print("Adding current_location column...")
        cursor.execute("""
            ALTER TABLE agents 
            ADD COLUMN current_location TEXT
        """)
        migrations_applied.append("current_location")
    else:
        print("current_location column already exists, skipping")
    
    # Add group column
    if 'group' not in columns:
        print("Adding group column...")
        cursor.execute("""
            ALTER TABLE agents 
            ADD COLUMN "group" TEXT
        """)
        migrations_applied.append("group")
    else:
        print("group column already exists, skipping")
    
    # Commit changes
    conn.commit()
    
    if migrations_applied:
        print(f"\n✅ Migration successful! Added columns: {', '.join(migrations_applied)}")
    else:
        print("\n✅ No migrations needed - all columns already exist")
    
    # Verify the changes
    cursor.execute("PRAGMA table_info(agents)")
    print("\nCurrent agents table schema:")
    for row in cursor.fetchall():
        print(f"  {row[1]} ({row[2]})")
    
except sqlite3.Error as e:
    print(f"❌ Migration failed: {e}")
    sys.exit(1)
finally:
    if conn:
        conn.close()
