"""Workspace schemas for API requests and responses."""

from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional
from uuid import UUID
from datetime import datetime


# Project Schemas
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    labels: Optional[List[str]] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    labels: Optional[List[str]] = None
    status: Optional[str] = None


class ProjectResponse(BaseModel):
    id: UUID
    tenant_id: str
    name: str
    description: Optional[str]
    labels: List[str] = []
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator('labels', mode='before')
    @classmethod
    def coerce_labels(cls, v):
        return v if v is not None else []


class ProjectListResponse(BaseModel):
    items: List[ProjectResponse]
    total: int


class ProjectWithSubprojectsResponse(ProjectResponse):
    subprojects: List["SubprojectResponse"] = []


# Subproject Schemas
class SubprojectCreate(BaseModel):
    project_id: UUID
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    agent_id: Optional[UUID] = None


class SubprojectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    agent_id: Optional[UUID] = None
    status: Optional[str] = None


class SubprojectResponse(BaseModel):
    id: UUID
    project_id: UUID
    tenant_id: str
    name: str
    description: Optional[str]
    agent_id: Optional[UUID]
    status: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class SubprojectWithDetailsResponse(SubprojectResponse):
    project: Optional[ProjectResponse] = None
    agent: Optional["AgentSummaryResponse"] = None


class SubprojectListResponse(BaseModel):
    items: List[SubprojectResponse]
    total: int


# Agent Summary for subproject
class AgentSummaryResponse(BaseModel):
    id: UUID
    name: str
    avatar_url: Optional[str] = None
    provider: str
    model: str
    
    model_config = ConfigDict(from_attributes=True)


# Execution Schemas
class AgentExecutionCreate(BaseModel):
    subproject_id: UUID
    prompt: str = Field(..., min_length=1)


class AgentExecutionResponse(BaseModel):
    id: UUID
    subproject_id: UUID
    tenant_id: str
    prompt: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)


class AgentExecutionWithDetailsResponse(AgentExecutionResponse):
    actions: List["AgentActionResponse"] = []
    artifacts: List["AgentArtifactResponse"] = []


class AgentExecutionListResponse(BaseModel):
    items: List[AgentExecutionResponse]
    total: int


# Action Schemas
class AgentActionResponse(BaseModel):
    id: UUID
    execution_id: UUID
    action_type: str
    content: str
    metadata_json: Optional[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AgentActionStreamResponse(BaseModel):
    execution_id: UUID
    action_type: str
    content: str
    timestamp: datetime


# Artifact Schemas
class AgentArtifactResponse(BaseModel):
    id: UUID
    execution_id: UUID
    name: str
    artifact_type: str
    content: Optional[str]
    file_url: Optional[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AgentArtifactCreate(BaseModel):
    execution_id: UUID
    name: str
    artifact_type: str
    content: Optional[str] = None
    file_url: Optional[str] = None


# Workspace Summary
class WorkspaceSummaryResponse(BaseModel):
    project: ProjectResponse
    subproject: SubprojectResponse
    agent: Optional[AgentSummaryResponse]
    active_execution: Optional[AgentExecutionResponse]
