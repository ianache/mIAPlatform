from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from enum import Enum
from uuid import UUID
from datetime import datetime


class ProviderEnum(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    OLLAMA = "ollama"
    OTHER = "other"


class AgentCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    registry_model_id: Optional[UUID] = None
    provider: ProviderEnum
    model: str
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    system_prompt: Optional[str] = None
    capabilities: List[str] = Field(default_factory=list)
    status: str = "ready"


class AgentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    registry_model_id: Optional[UUID] = None
    provider: Optional[ProviderEnum] = None
    model: Optional[str] = None
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    system_prompt: Optional[str] = None
    capabilities: Optional[List[str]] = None
    status: Optional[str] = None


class AgentResponse(BaseModel):
    id: UUID
    tenant_id: str
    name: str
    description: Optional[str]
    avatar_url: Optional[str]
    registry_model_id: Optional[UUID]
    provider: str
    model: str
    temperature: float
    system_prompt: Optional[str]
    capabilities: List[str]
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AgentListResponse(BaseModel):
    items: List[AgentResponse]
    total: int


class CapabilityToggle(BaseModel):
    capability_name: str
    enabled: bool


class AvatarUploadResponse(BaseModel):
    filename: str
    url: str
    content_type: str
    size: int
