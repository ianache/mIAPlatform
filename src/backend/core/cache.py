"""Redis cache helper — singleton client with graceful degradation."""

import json
import logging
from typing import Any, Optional

import redis.asyncio as aioredis

from src.backend.core.config import get_settings

logger = logging.getLogger(__name__)

_client: Optional[aioredis.Redis] = None


async def init_redis() -> None:
    global _client
    settings = get_settings()
    try:
        _client = aioredis.from_url(
            settings.REDIS_URL,
            password=settings.REDIS_PASSWORD,
            encoding="utf-8",
            decode_responses=True,
        )
        await _client.ping()
        logger.info("Redis connected: %s", settings.REDIS_URL)
    except Exception as exc:
        logger.warning("Redis unavailable — caching disabled: %s", exc)
        _client = None


async def close_redis() -> None:
    global _client
    if _client:
        await _client.aclose()
        _client = None
        logger.info("Redis connection closed")


# ── Public helpers ─────────────────────────────────────────────────────────────

async def cache_get(key: str) -> Optional[Any]:
    if _client is None:
        return None
    try:
        raw = await _client.get(key)
        return json.loads(raw) if raw is not None else None
    except Exception as exc:
        logger.warning("cache_get(%s) error: %s", key, exc)
        return None


async def cache_set(key: str, value: Any, ttl: int = 60) -> None:
    if _client is None:
        return
    try:
        await _client.setex(key, ttl, json.dumps(value, default=str))
    except Exception as exc:
        logger.warning("cache_set(%s) error: %s", key, exc)


async def cache_delete(*keys: str) -> None:
    if _client is None or not keys:
        return
    try:
        await _client.delete(*keys)
    except Exception as exc:
        logger.warning("cache_delete error: %s", exc)


async def cache_invalidate_pattern(pattern: str) -> None:
    """Delete all keys matching a glob pattern (e.g. 'tenant123:projects:*')."""
    if _client is None:
        return
    try:
        keys = await _client.keys(pattern)
        if keys:
            await _client.delete(*keys)
    except Exception as exc:
        logger.warning("cache_invalidate_pattern(%s) error: %s", pattern, exc)
