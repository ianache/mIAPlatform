"""FlowRun DB model — execution records for flows."""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID, JSONB

from src.backend.models.base import Base


class FlowRun(Base):
    __tablename__ = "flow_runs"
    __table_args__ = {"schema": "mia"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    flow_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    tenant_id = Column(String, nullable=False, index=True)
    status = Column(String(20), nullable=False, default="running", index=True)
    trigger = Column(String(20), nullable=False, default="manual")
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    finished_at = Column(DateTime, nullable=True)
    log = Column(JSONB, nullable=False, default=list)
    final_output = Column(JSONB, nullable=True)
