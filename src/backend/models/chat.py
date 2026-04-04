"""Chat and session models for AI agent conversations."""

from sqlalchemy import Column, String, ForeignKey, DateTime, Text, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from uuid import uuid4

from src.backend.models.base import Base


class ChatSession(Base):
    """Chat session for agent conversations."""
    __tablename__ = "chat_sessions"
    __table_args__ = {"schema": "mia"}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(String, nullable=False, index=True)
    subproject_id = Column(UUID(as_uuid=True), ForeignKey("mia.subprojects.id"), nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("mia.agents.id"), nullable=False)
    session_code = Column(String(50), nullable=False, unique=True, index=True)  # Human-readable code
    title = Column(String(200), nullable=True)
    status = Column(String(20), default="active")  # active, paused, closed
    session_metadata = Column(JSON, default=dict)  # Session-level metadata
    context_summary = Column(Text, nullable=True)  # Summarized context for long conversations
    message_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subproject = relationship("Subproject")
    agent = relationship("Agent")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.sequence_number")


class ChatMessage(Base):
    """Individual messages in a chat session."""
    __tablename__ = "chat_messages"
    __table_args__ = {"schema": "mia"}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("mia.chat_sessions.id"), nullable=False)
    sequence_number = Column(Integer, nullable=False)  # Order in conversation
    role = Column(String(20), nullable=False)  # user, assistant, system, tool
    content = Column(Text, nullable=False)
    message_metadata = Column(JSON, default=dict)  # Message-specific metadata (tokens, latency, etc.)
    injected_metadata = Column(JSON, default=dict)  # Metadatos inyectados en este mensaje
    tool_calls = Column(JSON, nullable=True)  # Tool calls if any
    tool_results = Column(JSON, nullable=True)  # Tool results if any
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")


class ChatMetadataTemplate(Base):
    """Templates for metadata injection configurations."""
    __tablename__ = "chat_metadata_templates"
    __table_args__ = {"schema": "mia"}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(String, nullable=False, index=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("mia.agents.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    
    # Configuration for metadata injection
    # JSON structure: {"properties": [{"key": "user_name", "source": "context|static", "value": "..."}, ...]}
    configuration = Column(JSON, nullable=False)
    
    is_active = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    agent = relationship("Agent")
