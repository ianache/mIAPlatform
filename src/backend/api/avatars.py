"""Avatar endpoints — stores and serves images from mia.avatars table."""

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.backend.core.security import security, verify_token
from src.backend.db.database import get_db
from src.backend.models.avatar import Avatar

router = APIRouter(prefix="/avatars", tags=["avatars"])
logger = logging.getLogger(__name__)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


# ---------------------------------------------------------------------------
# POST /avatars — upload and store in DB
# ---------------------------------------------------------------------------
@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_avatar(
    request: Request,
    file: UploadFile = File(...),
    entity_type: str = Form(...),        # 'user' | 'agent'
    entity_id: str = Form(None),
    db: AsyncSession = Depends(get_db),
    credentials=Depends(security),
):
    """Upload an avatar and persist its bytes to mia.avatars.

    If the same (tenant, entity_type, entity_id) already has an avatar it is
    replaced automatically.
    """
    token_data = await verify_token(credentials)
    tenant_id = token_data.get("tenant_id") or token_data.get("sub", "default-tenant")

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido. Permitidos: {', '.join(ALLOWED_IMAGE_TYPES)}",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Archivo demasiado grande. Máximo 5 MB.",
        )

    # Replace existing avatar for same entity
    if entity_id:
        existing_result = await db.execute(
            select(Avatar).where(
                Avatar.entity_type == entity_type,
                Avatar.entity_id == entity_id,
                Avatar.tenant_id == tenant_id,
            )
        )
        old_avatar = existing_result.scalar_one_or_none()
        if old_avatar:
            await db.delete(old_avatar)

    avatar = Avatar(
        tenant_id=tenant_id,
        entity_type=entity_type,
        entity_id=entity_id,
        filename=file.filename or f"avatar",
        content_type=file.content_type,
        file_data=content,
    )
    db.add(avatar)
    await db.commit()
    await db.refresh(avatar)

    base_url = str(request.base_url).rstrip("/")
    url = f"{base_url}/api/v1/avatars/{avatar.id}"
    logger.info(f"Avatar stored: id={avatar.id} entity={entity_type}/{entity_id} tenant={tenant_id}")

    return {
        "id": str(avatar.id),
        "url": url,
        "filename": avatar.filename,
        "content_type": avatar.content_type,
        "entity_type": avatar.entity_type,
        "entity_id": avatar.entity_id,
    }


# ---------------------------------------------------------------------------
# GET /avatars/entity/{entity_type}/{entity_id} — lookup by owner
# Must be declared BEFORE /{avatar_id} to avoid routing conflict
# ---------------------------------------------------------------------------
@router.get("/entity/{entity_type}/{entity_id}")
async def get_entity_avatar(
    entity_type: str,
    entity_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    credentials=Depends(security),
):
    """Return avatar metadata for a given entity (user or agent)."""
    token_data = await verify_token(credentials)
    tenant_id = token_data.get("tenant_id") or token_data.get("sub", "default-tenant")

    result = await db.execute(
        select(Avatar).where(
            Avatar.entity_type == entity_type,
            Avatar.entity_id == entity_id,
            Avatar.tenant_id == tenant_id,
        )
    )
    avatar = result.scalar_one_or_none()
    if not avatar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avatar no encontrado")

    base_url = str(request.base_url).rstrip("/")
    return {
        "id": str(avatar.id),
        "url": f"{base_url}/api/v1/avatars/{avatar.id}",
        "filename": avatar.filename,
        "content_type": avatar.content_type,
        "entity_type": avatar.entity_type,
        "entity_id": avatar.entity_id,
    }


# ---------------------------------------------------------------------------
# GET /avatars/{avatar_id} — serve image bytes
# ---------------------------------------------------------------------------
@router.get("/{avatar_id}")
async def serve_avatar(
    avatar_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Serve avatar image bytes from DB. No auth required (UUID acts as token)."""
    result = await db.execute(select(Avatar).where(Avatar.id == avatar_id))
    avatar = result.scalar_one_or_none()
    if not avatar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avatar no encontrado")

    return Response(
        content=avatar.file_data,
        media_type=avatar.content_type,
        headers={"Cache-Control": "public, max-age=86400"},
    )


# ---------------------------------------------------------------------------
# DELETE /avatars/{avatar_id}
# ---------------------------------------------------------------------------
@router.delete("/{avatar_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_avatar(
    avatar_id: UUID,
    db: AsyncSession = Depends(get_db),
    credentials=Depends(security),
):
    """Delete an avatar. Only the owning tenant can delete."""
    token_data = await verify_token(credentials)
    tenant_id = token_data.get("tenant_id") or token_data.get("sub", "default-tenant")

    result = await db.execute(
        select(Avatar).where(Avatar.id == avatar_id, Avatar.tenant_id == tenant_id)
    )
    avatar = result.scalar_one_or_none()
    if not avatar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avatar no encontrado")

    await db.delete(avatar)
    await db.commit()
    return None
