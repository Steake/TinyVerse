"""Initial database schema

Revision ID: 001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial database schema."""
    
    # Create agents table
    op.create_table(
        'agents',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('age', sa.Integer(), nullable=False),
        sa.Column('occupation', sa.String(), nullable=False),
        sa.Column('occupation_description', sa.Text(), nullable=True),
        sa.Column('nationality', sa.String(), nullable=True),
        sa.Column('country_of_residence', sa.String(), nullable=True),
        sa.Column('personality_traits', sa.JSON(), nullable=False),
        sa.Column('professional_interests', sa.JSON(), nullable=False),
        sa.Column('personal_interests', sa.JSON(), nullable=False),
        sa.Column('backstory', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('tinytroupe_state', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agents_id'), 'agents', ['id'], unique=False)
    op.create_index(op.f('ix_agents_name'), 'agents', ['name'], unique=False)
    
    # Create skills table
    op.create_table(
        'skills',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('agent_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('level', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skills_id'), 'skills', ['id'], unique=False)
    
    # Create locations table
    op.create_table(
        'locations',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('location_type', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_locations_id'), 'locations', ['id'], unique=False)
    op.create_index(op.f('ix_locations_name'), 'locations', ['name'], unique=False)
    
    # Create simulation_logs table
    op.create_table(
        'simulation_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('agent_id', sa.String(), nullable=True),
        sa.Column('agent_name', sa.String(), nullable=True),
        sa.Column('action_type', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('simulation_step', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_simulation_logs_id'), 'simulation_logs', ['id'], unique=False)
    op.create_index(op.f('ix_simulation_logs_timestamp'), 'simulation_logs', ['timestamp'], unique=False)
    op.create_index(op.f('ix_simulation_logs_action_type'), 'simulation_logs', ['action_type'], unique=False)
    
    # Create relationships table
    op.create_table(
        'relationships',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('source_agent_id', sa.String(), nullable=False),
        sa.Column('target_agent_id', sa.String(), nullable=False),
        sa.Column('relationship_type', sa.String(), nullable=False),
        sa.Column('strength', sa.Integer(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['source_agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['target_agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_relationships_id'), 'relationships', ['id'], unique=False)
    
    # Create routines table
    op.create_table(
        'routines',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('agent_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('schedule', sa.JSON(), nullable=True),
        sa.Column('activity_type', sa.String(), nullable=True),
        sa.Column('location_id', sa.String(), nullable=True),
        sa.Column('is_active', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['location_id'], ['locations.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_routines_id'), 'routines', ['id'], unique=False)


def downgrade() -> None:
    """Drop all tables."""
    op.drop_index(op.f('ix_routines_id'), table_name='routines')
    op.drop_table('routines')
    
    op.drop_index(op.f('ix_relationships_id'), table_name='relationships')
    op.drop_table('relationships')
    
    op.drop_index(op.f('ix_simulation_logs_action_type'), table_name='simulation_logs')
    op.drop_index(op.f('ix_simulation_logs_timestamp'), table_name='simulation_logs')
    op.drop_index(op.f('ix_simulation_logs_id'), table_name='simulation_logs')
    op.drop_table('simulation_logs')
    
    op.drop_index(op.f('ix_locations_name'), table_name='locations')
    op.drop_index(op.f('ix_locations_id'), table_name='locations')
    op.drop_table('locations')
    
    op.drop_index(op.f('ix_skills_id'), table_name='skills')
    op.drop_table('skills')
    
    op.drop_index(op.f('ix_agents_name'), table_name='agents')
    op.drop_index(op.f('ix_agents_id'), table_name='agents')
    op.drop_table('agents')
