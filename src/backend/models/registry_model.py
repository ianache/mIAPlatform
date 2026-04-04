from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from src.backend.models.base import Base


class RegistryModel(Base):
    __tablename__ = "registry_models"
    __table_args__ = {"schema": "mia"}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    status = Column(String, default="active")  # active/deprecated/beta
    tags = Column(JSON, default=list)
    context_window = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class APIKeyRecord(Base):
    __tablename__ = "api_keys"
    __table_args__ = {"schema": "mia"}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(String, index=True, nullable=False)
    provider = Column(String, nullable=False)
    key_encrypted = Column(Text, nullable=False)
    is_valid = Column(Boolean, default=False)
    last_validated = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FeatureMapping(Base):
    __tablename__ = "feature_mappings"
    __table_args__ = {"schema": "mia"}

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(String, index=True, nullable=False)
    feature_id = Column(String, nullable=False)
    feature_name = Column(String, nullable=False)
    model_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
