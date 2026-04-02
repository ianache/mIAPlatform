"""Tenant management API routes."""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.backend.core.security import verify_token, security
from src.backend.db.database import get_db

router = APIRouter(prefix="/tenants", tags=["tenants"])


class TenantCreate(BaseModel):
    name: str
    slug: str
    plan: str = "free"


class TenantResponse(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    created_at: str


class TenantUpdate(BaseModel):
    name: Optional[str] = None
    plan: Optional[str] = None


# In-memory tenant store (replace with PostgreSQL model in production)
tenants_db: dict[str, dict] = {}


@router.post("/", response_model=TenantResponse)
async def create_tenant(
    tenant: TenantCreate,
    credentials=Depends(security),
    db: AsyncSession = Depends(get_db),
):
    """Create a new tenant."""
    token_data = verify_token(credentials)

    # Check slug uniqueness
    for existing in tenants_db.values():
        if existing["slug"] == tenant.slug:
            raise HTTPException(status_code=400, detail="Tenant slug already exists")

    import uuid

    tenant_id = str(uuid.uuid4())

    new_tenant = {
        "id": tenant_id,
        "name": tenant.name,
        "slug": tenant.slug,
        "plan": tenant.plan,
        "created_at": "2026-04-02T00:00:00Z",
    }

    tenants_db[tenant_id] = new_tenant

    return TenantResponse(**new_tenant)


@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: str,
    credentials=Depends(security),
):
    """Get tenant by ID."""
    verify_token(credentials)

    if tenant_id not in tenants_db:
        raise HTTPException(status_code=404, detail="Tenant not found")

    return TenantResponse(**tenants_db[tenant_id])


@router.get("/", response_model=list[TenantResponse])
async def list_tenants(
    credentials=Depends(security),
):
    """List all tenants (admin only)."""
    verify_token(credentials)
    return [TenantResponse(**t) for t in tenants_db.values()]


@router.patch("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: str,
    update: TenantUpdate,
    credentials=Depends(security),
):
    """Update tenant settings."""
    verify_token(credentials)

    if tenant_id not in tenants_db:
        raise HTTPException(status_code=404, detail="Tenant not found")

    tenant = tenants_db[tenant_id]

    if update.name:
        tenant["name"] = update.name
    if update.plan:
        tenant["plan"] = update.plan

    return TenantResponse(**tenant)
