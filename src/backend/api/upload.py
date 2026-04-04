"""Upload endpoints for file storage."""

import os
import shutil
import logging
from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Request
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.backend.db.database import get_db
from src.backend.core.security import verify_token, security
from src.backend.models.agent_schemas import AvatarUploadResponse

router = APIRouter(prefix="/upload", tags=["upload"])
logger = logging.getLogger(__name__)

# Upload directories - use absolute path from project root
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent  # src/backend/api -> project root
UPLOAD_DIR = BASE_DIR / "uploads"
AVATAR_DIR = UPLOAD_DIR / "avatars"

# Ensure directories exist
try:
    AVATAR_DIR.mkdir(parents=True, exist_ok=True)
    logger.info(f"Upload directory created/verified: {AVATAR_DIR}")
except Exception as e:
    logger.error(f"Failed to create upload directory: {e}")

# Allowed image types and max size (5MB)
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/avatar", response_model=AvatarUploadResponse)
async def upload_avatar(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    credentials=Depends(security),
):
    """Upload an agent avatar image.
    
    Saves the image to the local filesystem and returns the accessible URL.
    """
    try:
        logger.info(f"Starting avatar upload. File: {file.filename}, Content-Type: {file.content_type}")
        
        # Verify token
        token_data = await verify_token(credentials)
        tenant_id = token_data.get("tenant_id") or token_data.get("sub", "default-tenant")
        logger.info(f"Uploading for tenant: {tenant_id}")
        
        # Validate file type
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            logger.warning(f"Invalid file type: {file.content_type}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}"
            )
        
        # Read file content to check size
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Generate unique filename
        original_filename = file.filename if file.filename else "avatar.png"
        file_extension = Path(str(original_filename)).suffix.lower()
        if file_extension not in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
            # Map content type to extension
            ext_map = {
                'image/jpeg': '.jpg',
                'image/png': '.png',
                'image/gif': '.gif',
                'image/webp': '.webp'
            }
            file_extension = ext_map.get(file.content_type, '.png')
        
        unique_filename = f"{tenant_id}_{uuid4().hex}{file_extension}"
        file_path = AVATAR_DIR / unique_filename
        
        # Save file
        logger.info(f"Saving file to: {file_path}")
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # Verify file was saved
        if not file_path.exists():
            logger.error(f"File was not saved: {file_path}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save file"
            )
        
        logger.info(f"File saved successfully. Size: {len(content)} bytes")
        
        # Generate full URL
        base_url = str(request.base_url).rstrip('/')
        avatar_url = f"{base_url}/api/v1/upload/avatar/{unique_filename}"
        logger.info(f"Generated URL: {avatar_url}")
        
        return AvatarUploadResponse(
            filename=unique_filename,
            url=avatar_url,
            content_type=file.content_type,
            size=len(content)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading avatar: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload avatar: {str(e)}"
        )


@router.get("/avatar/{filename}")
async def serve_avatar(
    filename: str,
):
    """Serve an avatar image by filename.
    
    Note: This endpoint is public. The filename contains a UUID that acts as
    a secure token, making it impractical to guess valid URLs.
    """
    try:
        file_path = AVATAR_DIR / filename
        
        # Security check: ensure file is within avatar directory
        if not str(file_path.resolve()).startswith(str(AVATAR_DIR.resolve())):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avatar not found"
            )
        
        # Determine content type
        content_type = "image/png"
        if filename.endswith('.jpg') or filename.endswith('.jpeg'):
            content_type = "image/jpeg"
        elif filename.endswith('.gif'):
            content_type = "image/gif"
        elif filename.endswith('.webp'):
            content_type = "image/webp"
        
        return FileResponse(
            path=file_path,
            media_type=content_type,
            filename=filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to serve avatar: {str(e)}"
        )


@router.delete("/avatar/{filename}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_avatar(
    filename: str,
    credentials=Depends(security),
):
    """Delete an avatar image."""
    try:
        # Verify token
        token_data = await verify_token(credentials)
        tenant_id = token_data.get("tenant_id") or token_data.get("sub", "default-tenant")
        
        # Security check: only allow deletion of own tenant's files
        if not filename.startswith(f"{tenant_id}_"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only delete your own avatars"
            )
        
        file_path = AVATAR_DIR / filename
        
        # Security check: ensure file is within avatar directory
        if not str(file_path.resolve()).startswith(str(AVATAR_DIR.resolve())):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        if file_path.exists():
            file_path.unlink()
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete avatar: {str(e)}"
        )
