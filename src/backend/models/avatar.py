"""Avatar DB model — stores image bytes in mia.avatars."""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime, LargeBinary, String
from sqlalchemy.dialects.postgresql import UUID

from src.backend.models.base import Base


class Avatar(Base):
    __tablename__ = "avatars"
    __table_args__ = {"schema": "mia"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(String, nullable=False)
    entity_type = Column(String(20), nullable=False)   # 'user' | 'agent'
    entity_id = Column(String(255), nullable=True)     # user sub or agent UUID
    filename = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False)
    file_data = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
