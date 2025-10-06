#!/usr/bin/env python3
"""
Example usage of TinyVerse database layer.

This script demonstrates how to work with the database models directly.
"""
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Mock TinyTroupe to run without dependencies
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

sys.modules['tinytroupe'] = type(sys)('tinytroupe')
sys.modules['tinytroupe.agent'] = type(sys)('tinytroupe.agent')
sys.modules['tinytroupe.environment'] = type(sys)('tinytroupe.environment')
sys.modules['tinytroupe'].agent = sys.modules['tinytroupe.agent']
sys.modules['tinytroupe'].environment = sys.modules['tinytroupe.environment']
sys.modules['tinytroupe.agent'].TinyPerson = MockTinyPerson
sys.modules['tinytroupe.environment'].TinyWorld = MockTinyWorld

from app.database import get_db_context, init_db
from app.models import Agent, Skill, Location, SimulationLog, Relationship, Routine


def example_create_agent():
    """Example: Create an agent with skills."""
    print("\n1. Creating an agent with skills...")
    
    with get_db_context() as db:
        # Create agent
        agent = Agent(
            id="agent-001",
            name="Dr. Sarah Chen",
            age=35,
            occupation="Research Scientist",
            occupation_description="AI/ML researcher specializing in natural language processing",
            nationality="Canadian",
            country_of_residence="USA",
            personality_traits=["analytical", "curious", "collaborative"],
            professional_interests=["machine learning", "NLP", "ethics in AI"],
            personal_interests=["hiking", "reading sci-fi", "chess"],
            backstory="PhD in Computer Science from MIT. Led multiple groundbreaking research projects."
        )
        db.add(agent)
        
        # Add skills
        skills_data = [
            {"name": "Python", "level": 10},
            {"name": "Machine Learning", "level": 9},
            {"name": "Research", "level": 9},
            {"name": "Technical Writing", "level": 8},
        ]
        
        for skill_data in skills_data:
            skill = Skill(
                agent_id="agent-001",
                name=skill_data["name"],
                level=skill_data["level"]
            )
            db.add(skill)
        
        db.commit()
        print(f"  ✓ Created agent: {agent.name} with {len(skills_data)} skills")


def example_create_location():
    """Example: Create a location."""
    print("\n2. Creating a location...")
    
    with get_db_context() as db:
        location = Location(
            id="loc-001",
            name="AI Research Lab",
            description="State-of-the-art facility for AI research with GPU clusters",
            location_type="building"
        )
        db.add(location)
        db.commit()
        print(f"  ✓ Created location: {location.name}")


def example_create_relationship():
    """Example: Create a relationship between agents."""
    print("\n3. Creating agent relationships...")
    
    # First create a second agent
    with get_db_context() as db:
        agent2 = Agent(
            id="agent-002",
            name="Prof. James Miller",
            age=48,
            occupation="Professor",
            personality_traits=["wise", "patient"],
            professional_interests=["teaching", "mentoring"],
            personal_interests=["classical music"],
        )
        db.add(agent2)
        db.commit()
    
    # Create relationship
    with get_db_context() as db:
        relationship = Relationship(
            source_agent_id="agent-001",
            target_agent_id="agent-002",
            relationship_type="mentor-mentee",
            strength=9,
            description="Prof. Miller mentored Dr. Chen during her PhD"
        )
        db.add(relationship)
        db.commit()
        print(f"  ✓ Created relationship: mentor-mentee (strength: {relationship.strength})")


def example_create_routine():
    """Example: Create a routine for an agent."""
    print("\n4. Creating a routine...")
    
    with get_db_context() as db:
        routine = Routine(
            agent_id="agent-001",
            name="Morning Research Session",
            description="Daily deep work session for research",
            schedule={"days": ["monday", "tuesday", "wednesday", "thursday", "friday"], "time": "08:00"},
            activity_type="research",
            location_id="loc-001",
            is_active=1
        )
        db.add(routine)
        db.commit()
        print(f"  ✓ Created routine: {routine.name}")


def example_log_simulation_event():
    """Example: Log a simulation event."""
    print("\n5. Logging a simulation event...")
    
    with get_db_context() as db:
        log = SimulationLog(
            agent_id="agent-001",
            agent_name="Dr. Sarah Chen",
            action_type="action",
            content="Reviewed latest research papers on transformer architectures",
            simulation_step=1,
            metadata={"papers_reviewed": 5, "duration_minutes": 90}
        )
        db.add(log)
        db.commit()
        print(f"  ✓ Logged simulation event: {log.action_type}")


def example_query_agents():
    """Example: Query agents with skills."""
    print("\n6. Querying agents...")
    
    with get_db_context() as db:
        # Get all agents
        agents = db.query(Agent).all()
        print(f"  ✓ Found {len(agents)} agents:")
        
        for agent in agents:
            print(f"    - {agent.name} ({agent.occupation})")
            if agent.skills:
                print(f"      Skills: {', '.join(f'{s.name}({s.level})' for s in agent.skills)}")


def example_query_simulation_logs():
    """Example: Query simulation logs."""
    print("\n7. Querying simulation logs...")
    
    with get_db_context() as db:
        logs = db.query(SimulationLog).order_by(SimulationLog.timestamp.desc()).all()
        print(f"  ✓ Found {len(logs)} log entries:")
        
        for log in logs:
            print(f"    - [{log.action_type}] {log.agent_name}: {log.content[:50]}...")


def example_complex_query():
    """Example: Complex query with joins."""
    print("\n8. Complex query: Agents with Python skills level >= 8...")
    
    with get_db_context() as db:
        python_experts = db.query(Agent).join(Skill).filter(
            Skill.name == "Python",
            Skill.level >= 8
        ).all()
        
        print(f"  ✓ Found {len(python_experts)} Python experts:")
        for agent in python_experts:
            python_skill = next(s for s in agent.skills if s.name == "Python")
            print(f"    - {agent.name}: Python level {python_skill.level}")


def main():
    """Run all examples."""
    print("=" * 60)
    print("TinyVerse Database Usage Examples")
    print("=" * 60)
    
    # Initialize database
    print("\nInitializing database...")
    init_db()
    print("  ✓ Database initialized")
    
    # Run examples
    try:
        example_create_agent()
        example_create_location()
        example_create_relationship()
        example_create_routine()
        example_log_simulation_event()
        example_query_agents()
        example_query_simulation_logs()
        example_complex_query()
        
        print("\n" + "=" * 60)
        print("✓ All examples completed successfully!")
        print("=" * 60)
        print("\nDatabase file: tinyverse.db")
        print("Run 'python db_manager.py check' to inspect the database")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
