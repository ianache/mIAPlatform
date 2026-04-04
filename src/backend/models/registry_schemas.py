from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import datetime


class RegistryModelCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    provider: str
    litellm_prefix: Optional[str] = None
    model_id: Optional[str] = None
    status: str = "active"
    tags: List[str] = Field(default_factory=list)
    context_window: Optional[int] = None


class RegistryModelUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    provider: Optional[str] = None
    litellm_prefix: Optional[str] = None
    model_id: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None
    context_window: Optional[int] = None


class RegistryModelResponse(BaseModel):
    id: UUID
    tenant_id: str
    name: str
    provider: str
    litellm_prefix: Optional[str]
    model_id: Optional[str]
    status: str
    tags: List[str]
    context_window: Optional[int]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RegistryModelListResponse(BaseModel):
    items: List[RegistryModelResponse]
    total: int


class APIKeyUpsert(BaseModel):
    key: str = Field(..., min_length=1)


class APIKeyResponse(BaseModel):
    id: UUID
    tenant_id: str
    provider: str
    key_masked: str
    is_valid: bool
    last_validated: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class APIKeyListResponse(BaseModel):
    items: List[APIKeyResponse]
    total: int


class FeatureMappingUpsert(BaseModel):
    feature_name: str
    model_id: str


class FeatureMappingResponse(BaseModel):
    id: UUID
    tenant_id: str
    feature_id: str
    feature_name: str
    model_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FeatureMappingListResponse(BaseModel):
    items: List[FeatureMappingResponse]
    total: int
