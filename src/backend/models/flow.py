"""Flow DB model — content ingestion flow definitions."""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB

from src.backend.models.base import Base


class Flow(Base):
    __tablename__ = "flows"
    __table_args__ = {"schema": "mia"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(String, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    graph = Column(JSONB, nullable=False, default=lambda: {"nodes": [], "edges": []})
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
