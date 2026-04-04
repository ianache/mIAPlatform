from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
import logging

from src.backend.db.database import get_db
from src.backend.core.security import verify_token, security
from src.backend.core.cache import cache_get, cache_set, cache_delete, cache_invalidate_pattern
from src.backend.core.config import get_settings
from src.backend.models.agent import Agent
from src.backend.models.agent_schemas import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
    AgentListResponse,
)
from src.backend.models.registry_model import RegistryModel as RegistryModelDB

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


@router.post("", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
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

    data = agent_in.model_dump()
    if agent_in.registry_model_id:
        reg_result = await db.execute(
            select(RegistryModelDB).where(
                RegistryModelDB.id == agent_in.registry_model_id,
                RegistryModelDB.tenant_id == tenant_id,
            )
        )
        reg = reg_result.scalar_one_or_none()
        if reg:
            data['model'] = reg.model_id or reg.name
            data['provider'] = reg.provider

    agent = Agent(**data, tenant_id=tenant_id)
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    await cache_invalidate_pattern(f"{tenant_id}:agents:*")
    return agent


@router.get("", response_model=AgentListResponse)
async def list_agents(
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    cache_key = f"{tenant_id}:agents:list"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    result = await db.execute(select(Agent).where(Agent.tenant_id == tenant_id))
    agents = result.scalars().all()
    data = {"items": [AgentResponse.model_validate(a).model_dump(mode="json") for a in agents], "total": len(agents)}
    await cache_set(cache_key, data, ttl=get_settings().REDIS_TTL)
    return data


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    cache_key = f"{tenant_id}:agents:{agent_id}"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    result = await db.execute(
        select(Agent).where(Agent.id == agent_id, Agent.tenant_id == tenant_id)
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found"
        )
    data = AgentResponse.model_validate(agent).model_dump(mode="json")
    await cache_set(cache_key, data, ttl=get_settings().REDIS_TTL)
    return data


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

    update_data = agent_in.model_dump(exclude_unset=True)
    if agent_in.registry_model_id:
        reg_result = await db.execute(
            select(RegistryModelDB).where(
                RegistryModelDB.id == agent_in.registry_model_id,
                RegistryModelDB.tenant_id == tenant_id,
            )
        )
        reg = reg_result.scalar_one_or_none()
        if reg:
            update_data['model'] = reg.model_id or reg.name
            update_data['provider'] = reg.provider

    for field, value in update_data.items():
        setattr(agent, field, value)

    await db.commit()
    await db.refresh(agent)
    await cache_delete(f"{tenant_id}:agents:{agent_id}")
    await cache_delete(f"{tenant_id}:agents:list")
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
    await cache_delete(f"{tenant_id}:agents:{agent_id}", f"{tenant_id}:agents:list")
    return None
