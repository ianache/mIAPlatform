"""Security utilities for JWT authentication."""

import httpx
from datetime import datetime, timedelta
from typing import Optional
import jwt
from jwt.algorithms import RSAAlgorithm
from jwt.exceptions import PyJWTError as JWTError
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
    settings = get_settings()
    jwks_url = settings.KEYCLOAK_JWKS_URL
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(jwks_url)
            response.raise_for_status()
            _jwks_cache = response.json()
    except Exception as e:
        logger.error(f"Failed to fetch JWKS from {jwks_url}: {e}")
        if _jwks_cache is None:
            raise HTTPException(status_code=503, detail="Keycloak JWKS unavailable")
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
            return RSAAlgorithm.from_jwk(key)

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


async def verify_token_raw(token: str) -> dict:
    """Verify a raw JWT string — used by WebSocket endpoints."""
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    return await verify_token(creds)


async def verify_token(credentials: HTTPAuthorizationCredentials) -> dict:
    """Verify JWT token and return payload."""
    settings = get_settings()
    token = credentials.credentials

    try:
        logger.info(f"Verifying token from {credentials.scheme}")
        
        jwks = await get_jwks()
        logger.info(f"JWKS keys count: {len(jwks.get('keys', []))}")
        
        signing_key = get_signing_key(token, jwks)
        logger.info(f"Signing key type: {type(signing_key)}")

        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            options={"verify_aud": False},
            issuer=f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_REALM}",
        )
        azp = payload.get("azp")
        if azp and azp != settings.KEYCLOAK_CLIENT_ID:
            raise HTTPException(status_code=401, detail="Token not issued for this client")
        logger.info(f"Token verified successfully, sub={payload.get('sub')}")
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
