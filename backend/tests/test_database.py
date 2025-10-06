"""
Tests for database models and operations.
"""
import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.agent import Agent, Skill
from app.models.location import Location
from app.models.simulation import SimulationLog, Relationship, Routine


# Use in-memory SQLite for testing
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture
def db_engine():
    """Create a test database engine."""
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session(db_engine):
    """Create a test database session."""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = SessionLocal()
    yield session
    session.close()


class TestAgentModel:
    """Tests for Agent model."""
    
    def test_create_agent(self, db_session):
        """Test creating an agent."""
        agent = Agent(
            id="test-agent-1",
            name="Test Agent",
            age=30,
            occupation="Software Engineer",
            personality_traits=["curious", "analytical"],
            professional_interests=["AI", "Python"],
            personal_interests=["reading", "hiking"],
        )
        db_session.add(agent)
        db_session.commit()
        
        # Query back
        retrieved = db_session.query(Agent).filter(Agent.id == "test-agent-1").first()
        assert retrieved is not None
        assert retrieved.name == "Test Agent"
        assert retrieved.age == 30
        assert retrieved.occupation == "Software Engineer"
        assert "curious" in retrieved.personality_traits
    
    def test_agent_with_skills(self, db_session):
        """Test creating an agent with skills."""
        agent = Agent(
            id="test-agent-2",
            name="Jane Doe",
            age=28,
            occupation="Data Scientist",
            personality_traits=["analytical"],
            professional_interests=["ML"],
            personal_interests=["data"],
        )
        db_session.add(agent)
        
        # Add skills
        skill1 = Skill(agent_id="test-agent-2", name="Python", level=9)
        skill2 = Skill(agent_id="test-agent-2", name="SQL", level=7)
        db_session.add(skill1)
        db_session.add(skill2)
        db_session.commit()
        
        # Query back
        retrieved = db_session.query(Agent).filter(Agent.id == "test-agent-2").first()
        assert retrieved is not None
        assert len(retrieved.skills) == 2
        assert retrieved.skills[0].name in ["Python", "SQL"]
        assert retrieved.skills[1].name in ["Python", "SQL"]
    
    def test_delete_agent_cascades_skills(self, db_session):
        """Test that deleting an agent also deletes their skills."""
        agent = Agent(
            id="test-agent-3",
            name="John Smith",
            age=35,
            occupation="Engineer",
            personality_traits=["creative"],
            professional_interests=["design"],
            personal_interests=["art"],
        )
        db_session.add(agent)
        
        skill = Skill(agent_id="test-agent-3", name="JavaScript", level=8)
        db_session.add(skill)
        db_session.commit()
        
        # Delete agent
        db_session.delete(agent)
        db_session.commit()
        
        # Skills should be deleted too
        skills = db_session.query(Skill).filter(Skill.agent_id == "test-agent-3").all()
        assert len(skills) == 0


class TestLocationModel:
    """Tests for Location model."""
    
    def test_create_location(self, db_session):
        """Test creating a location."""
        location = Location(
            id="loc-1",
            name="Office",
            description="A modern office space",
            location_type="building"
        )
        db_session.add(location)
        db_session.commit()
        
        # Query back
        retrieved = db_session.query(Location).filter(Location.id == "loc-1").first()
        assert retrieved is not None
        assert retrieved.name == "Office"
        assert retrieved.description == "A modern office space"
        assert retrieved.location_type == "building"


class TestSimulationLog:
    """Tests for SimulationLog model."""
    
    def test_create_simulation_log(self, db_session):
        """Test creating a simulation log."""
        # Create agent first
        agent = Agent(
            id="agent-log-1",
            name="Test Agent",
            age=30,
            occupation="Tester",
            personality_traits=["test"],
            professional_interests=["testing"],
            personal_interests=["tests"],
        )
        db_session.add(agent)
        db_session.commit()
        
        # Create log
        log = SimulationLog(
            agent_id="agent-log-1",
            agent_name="Test Agent",
            action_type="action",
            content="Performed a test action",
            simulation_step=1,
            metadata={"test": True}
        )
        db_session.add(log)
        db_session.commit()
        
        # Query back
        retrieved = db_session.query(SimulationLog).filter(
            SimulationLog.agent_id == "agent-log-1"
        ).first()
        assert retrieved is not None
        assert retrieved.action_type == "action"
        assert retrieved.content == "Performed a test action"
        assert retrieved.metadata["test"] is True


class TestRelationshipModel:
    """Tests for Relationship model."""
    
    def test_create_relationship(self, db_session):
        """Test creating a relationship between agents."""
        # Create two agents
        agent1 = Agent(
            id="agent-rel-1",
            name="Alice",
            age=30,
            occupation="Developer",
            personality_traits=["friendly"],
            professional_interests=["coding"],
            personal_interests=["gaming"],
        )
        agent2 = Agent(
            id="agent-rel-2",
            name="Bob",
            age=32,
            occupation="Designer",
            personality_traits=["creative"],
            professional_interests=["design"],
            personal_interests=["art"],
        )
        db_session.add(agent1)
        db_session.add(agent2)
        db_session.commit()
        
        # Create relationship
        relationship = Relationship(
            source_agent_id="agent-rel-1",
            target_agent_id="agent-rel-2",
            relationship_type="colleague",
            strength=8,
            description="Work together on projects"
        )
        db_session.add(relationship)
        db_session.commit()
        
        # Query back
        retrieved = db_session.query(Relationship).filter(
            Relationship.source_agent_id == "agent-rel-1"
        ).first()
        assert retrieved is not None
        assert retrieved.target_agent_id == "agent-rel-2"
        assert retrieved.relationship_type == "colleague"
        assert retrieved.strength == 8


class TestRoutineModel:
    """Tests for Routine model."""
    
    def test_create_routine(self, db_session):
        """Test creating a routine."""
        # Create agent
        agent = Agent(
            id="agent-routine-1",
            name="Morning Person",
            age=25,
            occupation="Student",
            personality_traits=["organized"],
            professional_interests=["study"],
            personal_interests=["exercise"],
        )
        db_session.add(agent)
        db_session.commit()
        
        # Create routine
        routine = Routine(
            agent_id="agent-routine-1",
            name="Morning Exercise",
            description="Daily morning workout",
            schedule={"days": ["monday", "wednesday", "friday"], "time": "07:00"},
            activity_type="exercise",
            is_active=1
        )
        db_session.add(routine)
        db_session.commit()
        
        # Query back
        retrieved = db_session.query(Routine).filter(
            Routine.agent_id == "agent-routine-1"
        ).first()
        assert retrieved is not None
        assert retrieved.name == "Morning Exercise"
        assert retrieved.schedule["days"] == ["monday", "wednesday", "friday"]
        assert retrieved.is_active == 1
