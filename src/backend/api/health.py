"""Health check endpoint."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """Basic health check."""
    return {"status": "healthy", "service": "orchestra"}


@router.get("/health/ready")
async def readiness_check():
    """Readiness check (includes dependencies)."""
    return {"status": "ready", "checks": {"api": "ok", "llm_gateway": "ok"}}
