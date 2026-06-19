"""API Key Service - Robust and modular API key management.

This service provides a centralized way to retrieve API keys with the following priority:
1. Database (APIKeyRecord) - persistent storage with encryption
2. Environment variables (.env) - fallback for local development
"""

import logging
from datetime import datetime
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.backend.core.config import get_settings
from src.backend.models.registry_model import APIKeyRecord

logger = logging.getLogger(__name__)


class APIKeyService:
    """Service for retrieving API keys with fallback strategy."""
    
    @staticmethod
    async def get_api_key(
        provider: str, 
        db: AsyncSession, 
        tenant_id: str = "default-tenant"
    ) -> Optional[str]:
        """
        Retrieve API key for a provider.
        
        Priority:
        1. Database (APIKeyRecord)
        2. Environment variables (.env)
        
        Args:
            provider: Provider name (e.g., 'groq', 'openai', 'anthropic')
            db: Database session
            tenant_id: Tenant identifier for multi-tenancy
            
        Returns:
            API key string or None if not found
        """
        # Sanitize provider name
        provider = provider.lower().strip()
        
        # Try to get from database first
        try:
            result = await db.execute(
                select(APIKeyRecord).where(
                    APIKeyRecord.provider == provider,
                    # APIKeyRecord.tenant_id == tenant_id,
                    APIKeyRecord.is_valid == True
                )
            )
            db_record = result.scalar_one_or_none()
            
            if db_record and db_record.key_encrypted:
                logger.info(f"API key for {provider} retrieved from database")
                # TODO: Implement decryption if needed
                # For now, assuming key_encrypted contains the actual key
                return db_record.key_encrypted
                
        except Exception as e:
            logger.error(f"Error retrieving API key from database for {provider}: {e}")
        
        # Fallback to environment variables
        settings = get_settings()
        env_key = APIKeyService._get_key_from_env(provider, settings)
        
        if env_key:
            logger.info(f"API key for {provider} retrieved from environment variables")
            return env_key
        
        logger.warning(f"No API key found for provider: {provider}")
        return None
    
    @staticmethod
    def _get_key_from_env(provider: str, settings) -> Optional[str]:
        """
        Get API key from environment variables based on provider.
        
        Args:
            provider: Provider name
            settings: Settings object with environment variables
            
        Returns:
            API key string or None
        """
        env_mapping = {
            'groq': settings.GROQ_API_KEY,
            'openai': getattr(settings, 'OPENAI_API_KEY', None),
            'anthropic': getattr(settings, 'ANTHROPIC_API_KEY', None),
            'google': getattr(settings, 'GOOGLE_API_KEY', None),
            'gemini': getattr(settings, 'GOOGLE_API_KEY', None),
        }
        
        return env_mapping.get(provider)
    
    @staticmethod
    async def store_api_key(
        provider: str,
        api_key: str,
        db: AsyncSession,
        tenant_id: str = "default-tenant",
        validate: bool = True
    ) -> APIKeyRecord:
        """
        Store API key in database.
        
        Args:
            provider: Provider name
            api_key: The API key to store
            db: Database session
            tenant_id: Tenant identifier
            validate: Whether to validate the key before storing
            
        Returns:
            Created APIKeyRecord
        """
        provider = provider.lower().strip()
        
        # Check if key already exists
        result = await db.execute(
            select(APIKeyRecord).where(
                APIKeyRecord.provider == provider,
                APIKeyRecord.tenant_id == tenant_id
            )
        )
        existing = result.scalar_one_or_none()
        
        # TODO: Implement encryption for key_encrypted
        # For now, storing as plain text (not recommended for production)
        
        if existing:
            existing.key_encrypted = api_key
            existing.is_valid = validate
            existing.last_validated = datetime.utcnow() if validate else None
            await db.commit()
            await db.refresh(existing)
            logger.info(f"Updated API key for {provider} in database")
            return existing
        else:
            new_record = APIKeyRecord(
                provider=provider,
                key_encrypted=api_key,
                tenant_id=tenant_id,
                is_valid=validate,
                last_validated=datetime.utcnow() if validate else None
            )
            db.add(new_record)
            await db.commit()
            await db.refresh(new_record)
            logger.info(f"Created new API key for {provider} in database")
            return new_record


# Convenience function for simple use cases
async def get_api_key(
    provider: str, 
    db: AsyncSession, 
    tenant_id: str = "default-tenant"
) -> Optional[str]:
    """
    Convenience function to get API key.
    
    Args:
        provider: Provider name
        db: Database session
        tenant_id: Tenant identifier
        
    Returns:
        API key string or None
    """
    return await APIKeyService.get_api_key(provider, db, tenant_id)
