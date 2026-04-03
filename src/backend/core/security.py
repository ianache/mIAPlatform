"""Security utilities for JWT authentication."""

import httpx
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt, jwk
from jose.exceptions import JWKError
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

logger = logging.getLogger(__name__)


def get_settings():
    from src.backend.core.config import get_settings as _get_settings

    return _get_settings()


security = HTTPBearer()

_jwks_cache = None


async def get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        settings = get_settings()
        jwks_url = settings.KEYCLOAK_JWKS_URL
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(jwks_url)
                _jwks_cache = response.json()
            except Exception as e:
                logger.error(f"Failed to fetch JWKS: {e}")
                raise HTTPException(status_code=500, detail="Failed to fetch JWKS")
    return _jwks_cache


def get_signing_key(token: str, jwks: dict):
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token header")

    kid = unverified_header.get("kid")
    if not kid:
        raise HTTPException(status_code=401, detail="Token missing key ID")

    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return jwk.construct(key)

    raise HTTPException(status_code=401, detail="Signing key not found")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    settings = get_settings()
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )


async def verify_token(credentials: HTTPAuthorizationCredentials) -> dict:
    """Verify JWT token and return payload."""
    settings = get_settings()
    token = credentials.credentials

    try:
        jwks = await get_jwks()
        signing_key = get_signing_key(token, jwks)

        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            audience=settings.KEYCLOAK_CLIENT_ID,
            issuer=f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_REALM}",
        )
        return payload
    except JWTError as e:
        logger.error(f"JWT Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed",
            headers={"WWW-Authenticate": "Bearer"},
        )
