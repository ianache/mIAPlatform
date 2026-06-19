"""NodeType DB model — catalog of reusable flow node definitions."""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB

from src.backend.models.base import Base


class NodeType(Base):
    __tablename__ = "node_types"
    __table_args__ = {"schema": "mia"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(String, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    icon = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String(20), nullable=False)  # source | processor | sink
    properties = Column(JSONB, nullable=False, default=list)
    language = Column(String(20), nullable=False, default="javascript")
    code = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
