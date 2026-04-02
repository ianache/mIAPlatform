from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4
from sqlalchemy import Column, String, Text, Float, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Agent(Base):
    __tablename__ = "agents"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    provider = Column(String, nullable=False)
    model = Column(String, nullable=False)
    temperature = Column(Float, default=0.7)
    system_prompt = Column(Text, nullable=True)
    capabilities = Column(JSON, default=list)
    status = Column(String, default="ready")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
