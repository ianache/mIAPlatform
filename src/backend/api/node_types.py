from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import logging

from src.backend.db.database import get_db
from src.backend.core.security import verify_token, security
from src.backend.core.cache import cache_get, cache_set, cache_delete, cache_invalidate_pattern
from src.backend.core.config import get_settings
from src.backend.models.node_type import NodeType
from src.backend.models.node_type_schemas import (
    NodeTypeCreate,
    NodeTypeUpdate,
    NodeTypeResponse,
    NodeTypeListResponse,
)

router = APIRouter(prefix="/library/node-types", tags=["library"])
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


@router.post("", response_model=NodeTypeResponse, status_code=status.HTTP_201_CREATED)
async def create_node_type(
    request: Request,
    nt_in: NodeTypeCreate,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    data = nt_in.model_dump()
    # Serialize properties list to plain dicts
    data["properties"] = [p if isinstance(p, dict) else p.model_dump() for p in (nt_in.properties or [])]
    nt = NodeType(**data, tenant_id=tenant_id)
    db.add(nt)
    await db.commit()
    await db.refresh(nt)
    await cache_invalidate_pattern(f"{tenant_id}:node_types:*")
    return nt


@router.get("", response_model=NodeTypeListResponse)
async def list_node_types(
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    cache_key = f"{tenant_id}:node_types:list"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    result = await db.execute(select(NodeType).where(NodeType.tenant_id == tenant_id))
    items = result.scalars().all()
    data = {
        "items": [NodeTypeResponse.model_validate(n).model_dump(mode="json") for n in items],
        "total": len(items),
    }
    await cache_set(cache_key, data, ttl=get_settings().REDIS_TTL)
    return data


@router.get("/{nt_id}", response_model=NodeTypeResponse)
async def get_node_type(
    nt_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    cache_key = f"{tenant_id}:node_types:{nt_id}"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    result = await db.execute(
        select(NodeType).where(NodeType.id == nt_id, NodeType.tenant_id == tenant_id)
    )
    nt = result.scalar_one_or_none()
    if not nt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node type not found")

    data = NodeTypeResponse.model_validate(nt).model_dump(mode="json")
    await cache_set(cache_key, data, ttl=get_settings().REDIS_TTL)
    return data


@router.patch("/{nt_id}", response_model=NodeTypeResponse)
async def update_node_type(
    nt_id: UUID,
    nt_in: NodeTypeUpdate,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    result = await db.execute(
        select(NodeType).where(NodeType.id == nt_id, NodeType.tenant_id == tenant_id)
    )
    nt = result.scalar_one_or_none()
    if not nt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node type not found")

    update_data = nt_in.model_dump(exclude_unset=True)
    if "properties" in update_data and update_data["properties"] is not None:
        update_data["properties"] = [
            p if isinstance(p, dict) else p.model_dump() for p in update_data["properties"]
        ]
    for field, value in update_data.items():
        setattr(nt, field, value)

    await db.commit()
    await db.refresh(nt)
    await cache_delete(f"{tenant_id}:node_types:{nt_id}")
    await cache_delete(f"{tenant_id}:node_types:list")
    return nt


@router.delete("/{nt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_node_type(
    nt_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    result = await db.execute(
        select(NodeType).where(NodeType.id == nt_id, NodeType.tenant_id == tenant_id)
    )
    nt = result.scalar_one_or_none()
    if not nt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node type not found")

    await db.delete(nt)
    await db.commit()
    await cache_delete(f"{tenant_id}:node_types:{nt_id}", f"{tenant_id}:node_types:list")
    return None


# ── Code Generation Agent ───────────────────────────────────────────────────

import json
import re
from src.backend.llm.gateway import llm_gateway
from src.backend.services.api_key_service import get_api_key
from src.backend.models.registry_model import FeatureMapping


def get_provider_from_model(model: str) -> str:
    model = model.lower()
    if model.startswith("gpt-") or "openai" in model:
        return "openai"
    elif model.startswith("claude-") or "anthropic" in model:
        return "anthropic"
    elif model.startswith("gemini-") or "google" in model:
        return "google"
    elif model.startswith("groq/") or "groq" in model:
        return "groq"
    elif "/" in model:
        return model.split("/")[0]
    return "openai"


def extract_code_block(text: str, language: str) -> str:
    pattern = rf"```(?:{language})?\s*(.*?)\s*```"
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    generic_pattern = r"```\s*(.*?)\s*```"
    match = re.search(generic_pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()


@router.post("/{nt_id}/generate-code")
async def generate_node_type_code(
    nt_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Generates implementation code for a Node Type using the Coding Agent LLM."""
    # 1. Fetch Node Type
    result = await db.execute(
        select(NodeType).where(NodeType.id == nt_id, NodeType.tenant_id == tenant_id)
    )
    nt = result.scalar_one_or_none()
    if not nt:
        raise HTTPException(status_code=404, detail="Node type not found")

    # 2. Get Coding Agent Model Mapping
    mapping_result = await db.execute(
        select(FeatureMapping).where(
            FeatureMapping.tenant_id == tenant_id,
            FeatureMapping.feature_id == "coding-agent",
        )
    )
    mapping = mapping_result.scalar_one_or_none()

    # Fallback default model
    model_name = mapping.model_id if mapping else "gemini-1.5-flash"

    # 3. Retrieve API Key
    provider = get_provider_from_model(model_name)
    api_key = await get_api_key(provider, db, tenant_id)

    # 4. Construct Prompts
    language = nt.language or "javascript"

    # JSON-serialized properties
    properties_json = json.dumps(nt.properties or [], indent=2)

    # Format current code
    current_code = nt.code or ""

    system_prompt = f"""You are an AI Coding Agent for the Orchestra platform.
Your task is to generate or regenerate the execution code for a custom Node Type in the catalog.

You must output ONLY the clean execution code inside a code block. Do not include any introductory or concluding text, explanations, or markdown outside the code block.

Requirements for the code:
1. The code must be in {language}.
2. It must define and implement an execution handler.
   - For JavaScript:
     It must be an `async function process(input, config)` or `function process(input, config)` function.
     `input` is the data payload passed from upstream nodes.
     `config` is an object containing the custom property values defined in the properties.
     It must return the output data (typically an object or a list of objects).
   - For Python:
     It must be an `async def execute(config, input):` or `def execute(config, input):` function.
     It must return the output data.
3. Use the Node Type description and properties to implement the logic.
"""

    user_prompt = f"""Node Type Name: {nt.name}
Category: {nt.category}
Language: {language}
Description: {nt.description or 'No description provided'}

Properties:
{properties_json}

Current Implementation Code (if any):
```
{current_code}
```

Generate the complete implementation code for this Node Type. Follow the exact execution handler signature required by the platform.
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    try:
        response = await llm_gateway.complete(
            model=model_name,
            messages=messages,
            temperature=0.2,
            api_key=api_key,
        )
        raw_code = response.choices[0].message.content
        clean_code = extract_code_block(raw_code, language)

        return {"code": clean_code, "model_used": model_name}
    except Exception as e:
        logger.error(f"Failed to generate code via coding-agent: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Coding Agent failed to generate code: {str(e)}"
        )
