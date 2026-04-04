"""Workspace API endpoints for projects and subprojects."""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
import logging
from datetime import datetime

from src.backend.db.database import get_db
from src.backend.core.security import verify_token, security
from src.backend.core.cache import cache_get, cache_set, cache_delete, cache_invalidate_pattern
from src.backend.core.config import get_settings
from src.backend.models.workspace import Project, Subproject, AgentExecution, AgentAction, AgentArtifact
from src.backend.models.workspace_schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse, ProjectWithSubprojectsResponse,
    SubprojectCreate, SubprojectUpdate, SubprojectResponse, SubprojectListResponse, SubprojectWithDetailsResponse,
    AgentExecutionCreate, AgentExecutionResponse, AgentExecutionListResponse,
    AgentActionResponse, AgentArtifactResponse, AgentSummaryResponse, WorkspaceSummaryResponse
)
from src.backend.models.agent import Agent

router = APIRouter(prefix="/workspace", tags=["workspace"])
logger = logging.getLogger(__name__)


async def get_current_tenant(request: Request, credentials=Depends(security)):
    """Extract tenant_id from JWT token."""
    try:
        token_data = await verify_token(credentials)
        tenant_id = token_data.get("tenant_id") or token_data.get("sub", "default-tenant")
        return tenant_id
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Authentication required")


# Project endpoints
@router.get("/projects", response_model=ProjectListResponse)
async def list_projects(
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """List all projects for the current tenant."""
    cache_key = f"{tenant_id}:projects:list"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    result = await db.execute(
        select(Project).where(Project.tenant_id == tenant_id, Project.status != "deleted")
        .order_by(desc(Project.created_at))
    )
    projects = result.scalars().all()
    data = {"items": [ProjectResponse.model_validate(p).model_dump(mode="json") for p in projects], "total": len(projects)}
    await cache_set(cache_key, data, ttl=get_settings().REDIS_TTL)
    return data


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Create a new project."""
    project = Project(
        **project_in.model_dump(),
        tenant_id=tenant_id
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    await cache_invalidate_pattern(f"{tenant_id}:projects:*")
    return project


@router.get("/projects/{project_id}", response_model=ProjectWithSubprojectsResponse)
async def get_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Get project details with subprojects."""
    cache_key = f"{tenant_id}:projects:{project_id}"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    result = await db.execute(
        select(Project)
        .options(selectinload(Project.subprojects))
        .where(
            Project.id == project_id,
            Project.tenant_id == tenant_id,
            Project.status != "deleted"
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    data = ProjectWithSubprojectsResponse.model_validate(project).model_dump(mode="json")
    await cache_set(cache_key, data, ttl=get_settings().REDIS_TTL)
    return data


@router.patch("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    project_in: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Update a project."""
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.tenant_id == tenant_id
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    for field, value in project_in.model_dump(exclude_unset=True).items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project)
    await cache_invalidate_pattern(f"{tenant_id}:projects:*")
    return project


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Soft delete a project."""
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.tenant_id == tenant_id
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project.status = "deleted"
    await db.commit()
    await cache_invalidate_pattern(f"{tenant_id}:projects:*")
    return None


# Subproject endpoints
@router.get("/subprojects", response_model=SubprojectListResponse)
async def list_subprojects(
    project_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """List subprojects, optionally filtered by project."""
    cache_key = f"{tenant_id}:subprojects:{project_id or 'all'}"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    query = select(Subproject).where(
        Subproject.tenant_id == tenant_id,
        Subproject.status != "deleted"
    )
    if project_id:
        query = query.where(Subproject.project_id == project_id)

    query = query.order_by(desc(Subproject.created_at))
    result = await db.execute(query)
    subprojects = result.scalars().all()
    data = {"items": [SubprojectResponse.model_validate(s).model_dump(mode="json") for s in subprojects], "total": len(subprojects)}
    await cache_set(cache_key, data, ttl=get_settings().REDIS_TTL)
    return data


@router.post("/subprojects", response_model=SubprojectResponse, status_code=status.HTTP_201_CREATED)
async def create_subproject(
    subproject_in: SubprojectCreate,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Create a new subproject."""
    # Verify project exists
    result = await db.execute(
        select(Project).where(
            Project.id == subproject_in.project_id,
            Project.tenant_id == tenant_id
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify agent exists if provided
    if subproject_in.agent_id:
        agent_result = await db.execute(
            select(Agent).where(
                Agent.id == subproject_in.agent_id,
                Agent.tenant_id == tenant_id
            )
        )
        if not agent_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Agent not found")
    
    subproject = Subproject(
        **subproject_in.model_dump(),
        tenant_id=tenant_id
    )
    db.add(subproject)
    await db.commit()
    await db.refresh(subproject)
    await cache_invalidate_pattern(f"{tenant_id}:subprojects:*")
    await cache_delete(f"{tenant_id}:projects:{subproject_in.project_id}")
    return subproject


@router.get("/subprojects/{subproject_id}", response_model=SubprojectWithDetailsResponse)
async def get_subproject(
    subproject_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Get subproject details with project and agent info."""
    result = await db.execute(
        select(Subproject)
        .options(selectinload(Subproject.project), selectinload(Subproject.agent))
        .where(
            Subproject.id == subproject_id,
            Subproject.tenant_id == tenant_id,
            Subproject.status != "deleted"
        )
    )
    subproject = result.scalar_one_or_none()
    if not subproject:
        raise HTTPException(status_code=404, detail="Subproject not found")
    return subproject


@router.patch("/subprojects/{subproject_id}", response_model=SubprojectResponse)
async def update_subproject(
    subproject_id: UUID,
    subproject_in: SubprojectUpdate,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Update a subproject."""
    result = await db.execute(
        select(Subproject).where(
            Subproject.id == subproject_id,
            Subproject.tenant_id == tenant_id
        )
    )
    subproject = result.scalar_one_or_none()
    if not subproject:
        raise HTTPException(status_code=404, detail="Subproject not found")
    
    for field, value in subproject_in.model_dump(exclude_unset=True).items():
        setattr(subproject, field, value)

    await db.commit()
    await db.refresh(subproject)
    await cache_invalidate_pattern(f"{tenant_id}:subprojects:*")
    await cache_delete(f"{tenant_id}:projects:{subproject.project_id}")
    return subproject


@router.delete("/subprojects/{subproject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subproject(
    subproject_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Soft delete a subproject."""
    result = await db.execute(
        select(Subproject).where(
            Subproject.id == subproject_id,
            Subproject.tenant_id == tenant_id
        )
    )
    subproject = result.scalar_one_or_none()
    if not subproject:
        raise HTTPException(status_code=404, detail="Subproject not found")
    
    subproject.status = "deleted"
    await db.commit()
    await cache_invalidate_pattern(f"{tenant_id}:subprojects:*")
    await cache_delete(f"{tenant_id}:projects:{subproject.project_id}")
    return None


# Execution endpoints
@router.get("/subprojects/{subproject_id}/executions", response_model=AgentExecutionListResponse)
async def list_executions(
    subproject_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """List executions for a subproject."""
    result = await db.execute(
        select(AgentExecution).where(
            AgentExecution.subproject_id == subproject_id,
            AgentExecution.tenant_id == tenant_id
        )
        .order_by(desc(AgentExecution.started_at))
    )
    executions = result.scalars().all()
    return {"items": executions, "total": len(executions)}


@router.post("/subprojects/{subproject_id}/executions", response_model=AgentExecutionResponse, status_code=status.HTTP_201_CREATED)
async def create_execution(
    subproject_id: UUID,
    execution_in: AgentExecutionCreate,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Start a new agent execution."""
    # Verify subproject exists and has an agent
    result = await db.execute(
        select(Subproject).where(
            Subproject.id == subproject_id,
            Subproject.tenant_id == tenant_id,
            Subproject.status != "deleted"
        )
    )
    subproject = result.scalar_one_or_none()
    if not subproject:
        raise HTTPException(status_code=404, detail="Subproject not found")
    
    if not subproject.agent_id:
        raise HTTPException(status_code=400, detail="Subproject has no agent assigned")
    
    execution = AgentExecution(
        subproject_id=subproject_id,
        tenant_id=tenant_id,
        prompt=execution_in.prompt,
        status="running"
    )
    db.add(execution)
    await db.commit()
    await db.refresh(execution)
    
    # TODO: Trigger async agent execution here
    
    return execution


@router.get("/executions/{execution_id}", response_model=AgentExecutionResponse)
async def get_execution(
    execution_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Get execution details."""
    result = await db.execute(
        select(AgentExecution).where(
            AgentExecution.id == execution_id,
            AgentExecution.tenant_id == tenant_id
        )
    )
    execution = result.scalar_one_or_none()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return execution


@router.get("/executions/{execution_id}/actions", response_model=List[AgentActionResponse])
async def get_execution_actions(
    execution_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Get actions for an execution."""
    result = await db.execute(
        select(AgentAction).where(
            AgentAction.execution_id == execution_id
        )
        .order_by(AgentAction.created_at)
    )
    actions = result.scalars().all()
    return actions


@router.get("/executions/{execution_id}/artifacts", response_model=List[AgentArtifactResponse])
async def get_execution_artifacts(
    execution_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Get artifacts for an execution."""
    result = await db.execute(
        select(AgentArtifact).where(
            AgentArtifact.execution_id == execution_id
        )
        .order_by(AgentArtifact.created_at)
    )
    artifacts = result.scalars().all()
    return artifacts


# Workspace summary endpoint
@router.get("/summary", response_model=WorkspaceSummaryResponse)
async def get_workspace_summary(
    subproject_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Get workspace summary for a subproject."""
    # Get subproject with project and agent
    result = await db.execute(
        select(Subproject).where(
            Subproject.id == subproject_id,
            Subproject.tenant_id == tenant_id,
            Subproject.status != "deleted"
        )
    )
    subproject = result.scalar_one_or_none()
    if not subproject:
        raise HTTPException(status_code=404, detail="Subproject not found")
    
    # Get active execution if any
    exec_result = await db.execute(
        select(AgentExecution).where(
            AgentExecution.subproject_id == subproject_id,
            AgentExecution.tenant_id == tenant_id,
            AgentExecution.status == "running"
        )
        .order_by(desc(AgentExecution.started_at))
    )
    active_execution = exec_result.scalar_one_or_none()
    
    return {
        "project": subproject.project,
        "subproject": subproject,
        "agent": subproject.agent,
        "active_execution": active_execution
    }
