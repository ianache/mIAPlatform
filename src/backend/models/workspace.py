"""Workspace models for projects and subprojects."""

from sqlalchemy import Column, String, ForeignKey, DateTime, Text, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from uuid import uuid4

from src.backend.models.base import Base


class Project(Base):
    """Workspace project model."""
    __tablename__ = "projects"
    __table_args__ = {"schema": "mia"}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(String, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    labels = Column(JSON, default=list)  # List of label strings
    status = Column(String(20), default="active")  # active, archived, deleted
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subprojects = relationship("Subproject", back_populates="project", cascade="all, delete-orphan")


class Subproject(Base):
    """Subproject within a workspace project."""
    __tablename__ = "subprojects"
    __table_args__ = {"schema": "mia"}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("mia.projects.id"), nullable=False)
    tenant_id = Column(String, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("mia.agents.id"), nullable=True)
    status = Column(String(20), default="active")  # active, archived, deleted
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="subprojects")
    agent = relationship("Agent", back_populates="subprojects")
    executions = relationship("AgentExecution", back_populates="subproject", cascade="all, delete-orphan")
    artifacts = relationship("AgentArtifact", back_populates="subproject")


class AgentExecution(Base):
    """Execution of an agent in a subproject."""
    __tablename__ = "agent_executions"
    __table_args__ = {"schema": "mia"}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    subproject_id = Column(UUID(as_uuid=True), ForeignKey("mia.subprojects.id"), nullable=False)
    tenant_id = Column(String, nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    status = Column(String(20), default="running")  # running, completed, failed, cancelled
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    subproject = relationship("Subproject", back_populates="executions")
    actions = relationship("AgentAction", back_populates="execution", cascade="all, delete-orphan")
    artifacts = relationship("AgentArtifact", back_populates="execution", cascade="all, delete-orphan")


class AgentAction(Base):
    """Individual actions performed by an agent during execution."""
    __tablename__ = "agent_actions"
    __table_args__ = {"schema": "mia"}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    execution_id = Column(UUID(as_uuid=True), ForeignKey("mia.agent_executions.id"), nullable=False)
    action_type = Column(String(50), nullable=False)  # think, tool_call, message, error
    content = Column(Text, nullable=False)
    metadata_json = Column(Text, nullable=True)  # JSON string for additional data
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    execution = relationship("AgentExecution", back_populates="actions")


class AgentArtifact(Base):
    """Artifacts produced by agent execution."""
    __tablename__ = "agent_artifacts"
    __table_args__ = {"schema": "mia"}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    execution_id = Column(UUID(as_uuid=True), ForeignKey("mia.agent_executions.id"), nullable=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("mia.chat_sessions.id", ondelete="SET NULL"), nullable=True, index=True)
    subproject_id = Column(UUID(as_uuid=True), ForeignKey("mia.subprojects.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(200), nullable=False)
    artifact_type = Column(String(50), nullable=False)  # file, code, text, json, markdown
    content = Column(Text, nullable=True)
    file_url = Column(String(500), nullable=True)  # If stored as file
    summary = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    execution = relationship("AgentExecution", back_populates="artifacts")
    subproject = relationship("Subproject", back_populates="artifacts")
