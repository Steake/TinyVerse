"""
Database setup and session management for TinyVerse.

This module configures SQLAlchemy for database connections and provides
session management utilities.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from typing import Generator
from app.config import settings

# Create database engine with connection pooling
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
    pool_pre_ping=True,  # Verify connections before using them
    pool_recycle=3600,   # Recycle connections after 1 hour
    echo=False,          # Set to True for SQL query debugging
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    
    Usage in FastAPI endpoints:
        @router.get("/endpoint")
        def endpoint(db: Session = Depends(get_db)):
            # Use db session here
    
    Yields:
        Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """
    Context manager for database sessions.
    
    Usage:
        with get_db_context() as db:
            # Use db session here
    
    Yields:
        Database session
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database tables.
    
    Creates all tables defined in models if they don't exist.
    In production, use Alembic migrations instead.
    """
    from app.models import agent, location, simulation  # Import all models
    Base.metadata.create_all(bind=engine)


def reset_db() -> None:
    """
    Drop and recreate all database tables.
    
    WARNING: This will delete all data. Only use for development/testing.
    """
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
