from pydantic import BaseModel, ConfigDict
from typing import Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime


class FlowCreate(BaseModel):
    title: str
    description: Optional[str] = None
    graph: Dict[str, Any] = {"nodes": [], "edges": []}


class FlowUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    graph: Optional[Dict[str, Any]] = None


class FlowResponse(BaseModel):
    id: UUID
    tenant_id: str
    title: str
    description: Optional[str]
    graph: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FlowListResponse(BaseModel):
    items: List[FlowResponse]
    total: int
