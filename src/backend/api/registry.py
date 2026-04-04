from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import logging
from datetime import datetime
import httpx

from src.backend.db.database import get_db
from src.backend.core.security import verify_token, security
from src.backend.core.cache import cache_get, cache_set, cache_delete
from src.backend.core.config import get_settings
from src.backend.models.registry_model import RegistryModel, APIKeyRecord, FeatureMapping
from src.backend.models.registry_schemas import (
    RegistryModelCreate,
    RegistryModelUpdate,
    RegistryModelResponse,
    RegistryModelListResponse,
    APIKeyUpsert,
    APIKeyResponse,
    APIKeyListResponse,
    FeatureMappingUpsert,
    FeatureMappingResponse,
    FeatureMappingListResponse,
)

router = APIRouter(prefix="/registry", tags=["registry"])
logger = logging.getLogger(__name__)


async def get_current_tenant(request: Request, credentials=Depends(security)):
    try:
        token_data = await verify_token(credentials)
        tenant_id = token_data.get("tenant_id") or token_data.get("sub", "default-tenant")
        return tenant_id
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Authentication required")


def _mask_key(key: str) -> str:
    if len(key) <= 8:
        return "***"
    return key[:3] + "..." + key[-4:]


def _build_key_response(record: APIKeyRecord) -> APIKeyResponse:
    return APIKeyResponse(
        id=record.id,
        tenant_id=record.tenant_id,
        provider=record.provider,
        key_masked=_mask_key(record.key_encrypted),
        is_valid=record.is_valid,
        last_validated=record.last_validated,
        created_at=record.created_at,
        updated_at=record.updated_at,
    )


async def _probe_provider_key(provider: str, api_key: str) -> bool:
    """Validates an API key by making a test request to the provider."""
    try:
        if provider.lower() == "google":
            # Test Gemini API - uses query parameter authentication
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}",
                    timeout=10.0
                )
                return response.status_code == 200
        
        elif provider.lower() == "openai":
            # Test OpenAI API
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.openai.com/v1/models",
                    headers={"Authorization": f"Bearer {api_key}"},
                    timeout=10.0
                )
                return response.status_code == 200
        
        elif provider.lower() == "anthropic":
            # Test Anthropic API
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.anthropic.com/v1/models",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "anthropic-version": "2023-06-01"
                    },
                    timeout=10.0
                )
                return response.status_code == 200

        elif provider.lower() == "groq":
            # Test Groq API (OpenAI-compatible endpoint)
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.groq.com/openai/v1/models",
                    headers={"Authorization": f"Bearer {api_key}"},
                    timeout=10.0
                )
                logger.info(f"Groq probe → status={response.status_code} body={response.text[:200]}")
                # 401/403 = definitively invalid key; anything else = treat as valid
                return response.status_code not in (401, 403)

        else:
            # Unknown / custom provider — cannot probe, assume stored key is valid
            logger.info(f"Provider '{provider}' has no validation probe; marking as stored (unverified)")
            return True
    
    except httpx.RequestError as e:
        logger.error(f"Network error validating {provider} API key: {e}")
        return None  # type: ignore  — caller treats None as "could not verify"
    except Exception as e:
        logger.error(f"Error validating {provider} API key: {e}")
        return None  # type: ignore


# ── Registry Models ───────────────────────────────────────────────────────────

@router.get("/models", response_model=RegistryModelListResponse)
async def list_models(
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    cache_key = f"{tenant_id}:registry:models"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    result = await db.execute(
        select(RegistryModel).where(RegistryModel.tenant_id == tenant_id)
    )
    models = result.scalars().all()
    data = {"items": [RegistryModelResponse.model_validate(m).model_dump(mode="json") for m in models], "total": len(models)}
    await cache_set(cache_key, data, ttl=get_settings().REDIS_TTL_LONG)
    return data


@router.post("/models", response_model=RegistryModelResponse, status_code=status.HTTP_201_CREATED)
async def create_model(
    model_in: RegistryModelCreate,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    model = RegistryModel(**model_in.model_dump(), tenant_id=tenant_id)
    db.add(model)
    await db.commit()
    await db.refresh(model)
    await cache_delete(f"{tenant_id}:registry:models")
    return model


@router.patch("/models/{model_id}", response_model=RegistryModelResponse)
async def update_model(
    model_id: UUID,
    model_in: RegistryModelUpdate,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    result = await db.execute(
        select(RegistryModel).where(
            RegistryModel.id == model_id, RegistryModel.tenant_id == tenant_id
        )
    )
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    for field, value in model_in.model_dump(exclude_unset=True).items():
        setattr(model, field, value)

    await db.commit()
    await db.refresh(model)
    await cache_delete(f"{tenant_id}:registry:models")
    return model


@router.delete("/models/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_model(
    model_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    result = await db.execute(
        select(RegistryModel).where(
            RegistryModel.id == model_id, RegistryModel.tenant_id == tenant_id
        )
    )
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    await db.delete(model)
    await db.commit()
    await cache_delete(f"{tenant_id}:registry:models")
    return None


# ── API Keys ──────────────────────────────────────────────────────────────────

@router.get("/api-keys", response_model=APIKeyListResponse)
async def list_api_keys(
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    result = await db.execute(
        select(APIKeyRecord).where(APIKeyRecord.tenant_id == tenant_id)
    )
    records = result.scalars().all()
    return {"items": [_build_key_response(r) for r in records], "total": len(records)}


@router.put("/api-keys/{provider}", response_model=APIKeyResponse)
async def upsert_api_key(
    provider: str,
    key_in: APIKeyUpsert,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    result = await db.execute(
        select(APIKeyRecord).where(
            APIKeyRecord.tenant_id == tenant_id, APIKeyRecord.provider == provider
        )
    )
    record = result.scalar_one_or_none()

    if record:
        record.key_encrypted = key_in.key
        record.is_valid = False
        record.last_validated = None
        record.updated_at = datetime.utcnow()
    else:
        record = APIKeyRecord(
            tenant_id=tenant_id, provider=provider, key_encrypted=key_in.key
        )
        db.add(record)

    await db.commit()
    await db.refresh(record)
    return _build_key_response(record)


@router.post("/api-keys/{provider}/validate", response_model=APIKeyResponse)
async def validate_api_key(
    provider: str,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    result = await db.execute(
        select(APIKeyRecord).where(
            APIKeyRecord.tenant_id == tenant_id, APIKeyRecord.provider == provider
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="API key not found for this provider")

    is_valid = await _probe_provider_key(provider, record.key_encrypted)

    if is_valid is None:
        # Network/connection error — don't overwrite existing validity status
        raise HTTPException(status_code=503, detail="Could not reach provider to validate key. Try again later.")

    record.is_valid = is_valid
    record.last_validated = datetime.utcnow()
    await db.commit()
    await db.refresh(record)
    return _build_key_response(record)


# ── Feature Mappings ──────────────────────────────────────────────────────────

@router.get("/feature-mappings", response_model=FeatureMappingListResponse)
async def list_feature_mappings(
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    result = await db.execute(
        select(FeatureMapping).where(FeatureMapping.tenant_id == tenant_id)
    )
    mappings = result.scalars().all()
    return {"items": mappings, "total": len(mappings)}


@router.put("/feature-mappings/{feature_id}", response_model=FeatureMappingResponse)
async def upsert_feature_mapping(
    feature_id: str,
    mapping_in: FeatureMappingUpsert,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    result = await db.execute(
        select(FeatureMapping).where(
            FeatureMapping.tenant_id == tenant_id, FeatureMapping.feature_id == feature_id
        )
    )
    mapping = result.scalar_one_or_none()

    if mapping:
        mapping.feature_name = mapping_in.feature_name
        mapping.model_id = mapping_in.model_id
        mapping.updated_at = datetime.utcnow()
    else:
        mapping = FeatureMapping(
            tenant_id=tenant_id,
            feature_id=feature_id,
            feature_name=mapping_in.feature_name,
            model_id=mapping_in.model_id,
        )
        db.add(mapping)

    await db.commit()
    await db.refresh(mapping)
    return mapping
