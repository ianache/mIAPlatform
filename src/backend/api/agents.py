from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
import logging

from src.backend.db.database import get_db
from src.backend.core.security import verify_token, security
from src.backend.models.agent import Agent
from src.backend.models.agent_schemas import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
    AgentListResponse,
)

router = APIRouter(prefix="/agents", tags=["agents"])
logger = logging.getLogger(__name__)


async def get_current_tenant(request: Request, credentials=Depends(security)):
    auth_header = request.headers.get("Authorization", "")
    logger.info(f"Authorization present: {bool(auth_header)}")

    try:
        token_data = await verify_token(credentials)
        tenant_id = token_data.get("tenant_id")
        if not tenant_id:
            tenant_id = token_data.get("sub", "default-tenant")
            logger.warning(f"No tenant_id, using sub: {tenant_id}")
        logger.info(f"Token verified, tenant: {tenant_id}")
        return tenant_id
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Authentication required")


@router.post("/", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    request: Request,
    agent_in: AgentCreate,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    logger.info(f"Creating agent: {agent_in.name}, tenant: {tenant_id}")
    result = await db.execute(
        select(Agent).where(Agent.name == agent_in.name, Agent.tenant_id == tenant_id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Agent with this name already exists",
        )

    agent = Agent(**agent_in.model_dump(), tenant_id=tenant_id)
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return agent


@router.get("/", response_model=AgentListResponse)
async def list_agents(
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    result = await db.execute(select(Agent).where(Agent.tenant_id == tenant_id))
    agents = result.scalars().all()
    return {"items": agents, "total": len(agents)}


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    result = await db.execute(
        select(Agent).where(Agent.id == agent_id, Agent.tenant_id == tenant_id)
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found"
        )
    return agent


@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: UUID,
    agent_in: AgentUpdate,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    result = await db.execute(
        select(Agent).where(Agent.id == agent_id, Agent.tenant_id == tenant_id)
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found"
        )

    for field, value in agent_in.model_dump(exclude_unset=True).items():
        setattr(agent, field, value)

    await db.commit()
    await db.refresh(agent)
    return agent


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    result = await db.execute(
        select(Agent).where(Agent.id == agent_id, Agent.tenant_id == tenant_id)
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found"
        )

    await db.delete(agent)
    await db.commit()
    return None
