"""Pytest fixtures for testing with mock data."""

import pytest
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
from uuid import uuid4

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy import select

from src.backend.core.security import create_access_token
from src.backend.models.agent import Agent, Base


SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest.fixture(scope="function")
async def db_session():
    """Create a fresh async database session for each test."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
def auth_headers():
    """Generate valid auth headers with JWT token."""
    token = create_access_token(data={"sub": "test-user", "tenant_id": "test-tenant"})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def tenant_id():
    """Return test tenant ID."""
    return "test-tenant"


@pytest.fixture
def sample_agent_data():
    """Return sample agent data for tests."""
    return {
        "name": "Test Agent",
        "provider": "openai",
        "model": "gpt-4",
        "temperature": 0.7,
        "system_prompt": "You are a helpful assistant.",
        "capabilities": ["web_search", "file_analysis"],
    }
