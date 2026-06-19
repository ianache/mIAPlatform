from pydantic import BaseModel, ConfigDict
from typing import Any, List, Optional
from uuid import UUID
from datetime import datetime


class NodeTypeProperty(BaseModel):
    name: str
    data_type: str  # string | number | boolean | code | json
    description: Optional[str] = None
    required: bool = False
    default_value: Optional[str] = None


class NodeTypeCreate(BaseModel):
    name: str
    icon: Optional[str] = "📦"
    description: Optional[str] = None
    category: str  # source | processor | sink
    properties: List[NodeTypeProperty] = []
    language: str = "javascript"
    code: Optional[str] = None


class NodeTypeUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    properties: Optional[List[NodeTypeProperty]] = None
    language: Optional[str] = None
    code: Optional[str] = None


class NodeTypeResponse(BaseModel):
    id: UUID
    tenant_id: str
    name: str
    icon: Optional[str]
    description: Optional[str]
    category: str
    properties: List[Any]
    language: str
    code: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NodeTypeListResponse(BaseModel):
    items: List[NodeTypeResponse]
    total: int
