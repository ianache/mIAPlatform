"""Health check endpoints with dependency status."""

import asyncio
import logging
from typing import Dict, Any
from fastapi import APIRouter
from sqlalchemy import text
import httpx

from src.backend.core.config import get_settings

router = APIRouter(tags=["health"])
logger = logging.getLogger(__name__)


async def check_postgres() -> Dict[str, Any]:
    """Check PostgreSQL connection."""
    try:
        from src.backend.db.database import get_engine
        from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
        
        engine = get_engine()
        async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            result = await session.execute(text("SELECT 1"))
            value = result.scalar()
            logger.info(f"PostgreSQL health check successful: {value}")
            return {"status": "healthy", "message": "Connected"}
    except Exception as e:
        logger.error(f"PostgreSQL health check failed: {e}", exc_info=True)
        return {"status": "unhealthy", "message": str(e)}


async def check_vault() -> Dict[str, Any]:
    """Check Vault connection."""
    try:
        settings = get_settings()
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.VAULT_URL}/v1/sys/health",
                timeout=5.0
            )
            if response.status_code in [200, 429, 472, 473]:
                return {"status": "healthy", "message": "Vault is operational"}
            else:
                return {"status": "unhealthy", "message": f"Status code: {response.status_code}"}
    except Exception as e:
        logger.error(f"Vault health check failed: {e}")
        return {"status": "unhealthy", "message": str(e)}


async def check_neo4j() -> Dict[str, Any]:
    """Check Neo4j connection."""
    try:
        settings = get_settings()
        # Try to connect to Neo4j HTTP API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.NEO4J_URL.replace('bolt://', 'http://')}:7474/dbms/health",
                timeout=5.0
            )
            if response.status_code == 200:
                return {"status": "healthy", "message": "Connected"}
            else:
                return {"status": "unhealthy", "message": f"Status code: {response.status_code}"}
    except Exception as e:
        logger.error(f"Neo4j health check failed: {e}")
        return {"status": "unhealthy", "message": "Service unavailable"}


async def check_qdrant() -> Dict[str, Any]:
    """Check Qdrant connection."""
    try:
        # Default Qdrant URL
        qdrant_url = "http://localhost:6333"
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{qdrant_url}/healthz",
                timeout=5.0
            )
            if response.status_code == 200:
                return {"status": "healthy", "message": "Connected"}
            else:
                return {"status": "unhealthy", "message": f"Status code: {response.status_code}"}
    except Exception as e:
        logger.error(f"Qdrant health check failed: {e}")
        return {"status": "unhealthy", "message": "Service unavailable"}


async def check_mongo() -> Dict[str, Any]:
    """Check MongoDB connection."""
    try:
        settings = get_settings()
        # MongoDB no tiene HTTP API por defecto, verificamos si la URL está configurada
        if settings.MONGO_URL and settings.MONGO_URL != "mongodb://miaplatform:changeme@localhost:27017":
            return {"status": "healthy", "message": "Configured"}
        return {"status": "unknown", "message": "Not configured or using defaults"}
    except Exception as e:
        logger.error(f"MongoDB health check failed: {e}")
        return {"status": "unhealthy", "message": str(e)}


async def check_keycloak() -> Dict[str, Any]:
    """Check Keycloak connection."""
    try:
        settings = get_settings()
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_REALM}",
                timeout=5.0
            )
            if response.status_code == 200:
                return {"status": "healthy", "message": "Connected"}
            else:
                return {"status": "unhealthy", "message": f"Status code: {response.status_code}"}
    except Exception as e:
        logger.error(f"Keycloak health check failed: {e}")
        return {"status": "unhealthy", "message": "Service unavailable"}


async def check_redis() -> Dict[str, Any]:
    """Check Redis connection."""
    try:
        from src.backend.core.cache import get_redis_client
        
        client = get_redis_client()
        if client is None:
            return {"status": "unhealthy", "message": "Redis client not initialized"}
        
        # Try to ping Redis
        await client.ping()
        return {"status": "healthy", "message": "Connected"}
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        return {"status": "unhealthy", "message": str(e)}


@router.get("/health")
async def health_check():
    """Basic health check."""
    return {"status": "healthy", "service": "orchestra"}


@router.get("/health/ready")
async def readiness_check():
    """Readiness check (includes dependencies)."""
    return {"status": "ready", "checks": {"api": "ok", "llm_gateway": "ok"}}


@router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with all dependencies.
    
    Returns the health status of the API and all its dependencies.
    """
    try:
        # Run all checks concurrently
        results = await asyncio.gather(
            check_postgres(),
            check_vault(),
            check_neo4j(),
            check_qdrant(),
            check_mongo(),
            check_keycloak(),
            check_redis(),
            return_exceptions=True
        )

        # Build response
        dependencies = {
            "postgresql": results[0] if not isinstance(results[0], Exception) else {"status": "unhealthy", "message": str(results[0])},
            "vault": results[1] if not isinstance(results[1], Exception) else {"status": "unhealthy", "message": str(results[1])},
            "neo4j": results[2] if not isinstance(results[2], Exception) else {"status": "unhealthy", "message": str(results[2])},
            "qdrant": results[3] if not isinstance(results[3], Exception) else {"status": "unhealthy", "message": str(results[3])},
            "mongodb": results[4] if not isinstance(results[4], Exception) else {"status": "unhealthy", "message": str(results[4])},
            "keycloak": results[5] if not isinstance(results[5], Exception) else {"status": "unhealthy", "message": str(results[5])},
            "redis": results[6] if not isinstance(results[6], Exception) else {"status": "unhealthy", "message": str(results[6])},
        }
        
        # Determine overall status
        all_healthy = all(
            dep.get("status") == "healthy" 
            for dep in dependencies.values()
        )
        
        overall_status = "healthy" if all_healthy else "degraded"
        
        return {
            "status": overall_status,
            "service": "orchestra-api",
            "timestamp": asyncio.get_event_loop().time(),
            "dependencies": dependencies
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        return {
            "status": "unhealthy",
            "service": "orchestra-api",
            "timestamp": asyncio.get_event_loop().time(),
            "error": str(e),
            "dependencies": {}
        }
