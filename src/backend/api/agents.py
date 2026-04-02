from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from src.backend.db.database import get_db
from src.backend.core.security import verify_token
from src.backend.models.agent import Agent
from src.backend.models.agent_schemas import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
    AgentListResponse,
)

router = APIRouter(prefix="/agents", tags=["agents"])


# Simplified dependency for demo - will be replaced with real JWT auth
def get_current_tenant(token: str = Depends(verify_token)):
    return token.get("tenant_id")


@router.post("/", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent_in: AgentCreate,
    db: Session = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    # Validate uniqueness
    existing = (
        db.query(Agent)
        .filter(Agent.name == agent_in.name, Agent.tenant_id == tenant_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Agent with this name already exists",
        )

    agent = Agent(**agent_in.model_dump(), tenant_id=tenant_id)
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@router.get("/", response_model=AgentListResponse)
async def list_agents(
    db: Session = Depends(get_db), tenant_id: str = Depends(get_current_tenant)
):
    agents = db.query(Agent).filter(Agent.tenant_id == tenant_id).all()
    return {"items": agents, "total": len(agents)}


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: UUID,
    db: Session = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    agent = (
        db.query(Agent)
        .filter(Agent.id == agent_id, Agent.tenant_id == tenant_id)
        .first()
    )
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found"
        )
    return agent


@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: UUID,
    agent_in: AgentUpdate,
    db: Session = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    agent = (
        db.query(Agent)
        .filter(Agent.id == agent_id, Agent.tenant_id == tenant_id)
        .first()
    )
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found"
        )

    # Update fields
    for field, value in agent_in.model_dump(exclude_unset=True).items():
        setattr(agent, field, value)

    db.commit()
    db.refresh(agent)
    return agent


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: UUID,
    db: Session = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    agent = (
        db.query(Agent)
        .filter(Agent.id == agent_id, Agent.tenant_id == tenant_id)
        .first()
    )
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found"
        )

    db.delete(agent)
    db.commit()
    return None
