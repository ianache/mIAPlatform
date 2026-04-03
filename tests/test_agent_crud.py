"""Test agent CRUD API endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy import select

from src.backend.main import app
from src.backend.core.security import create_access_token
from src.backend.models.agent import Agent, Base
from src.backend.db.database import get_db


SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest.fixture(scope="function", autouse=True)
def setup_and_teardown():
    import asyncio

    async def create_tables():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def drop_tables():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)

    loop = asyncio.get_event_loop()
    loop.run_until_complete(create_tables())
    yield
    loop.run_until_complete(drop_tables())


@pytest.fixture
def client():
    async def override_get_db():
        async with TestSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers():
    token = create_access_token(data={"sub": "test-user", "tenant_id": "test-tenant"})
    return {"Authorization": f"Bearer {token}"}


def test_create_agent(client, auth_headers):
    """Test POST /api/v1/agents - Create an agent."""
    response = client.post(
        "/api/v1/agents",
        json={
            "name": "Test Agent",
            "provider": "openai",
            "model": "gpt-4",
            "temperature": 0.7,
            "system_prompt": "You are a helpful assistant.",
            "capabilities": ["web_search", "file_analysis"],
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Agent"
    assert data["provider"] == "openai"
    assert "id" in data


def test_list_agents(client, auth_headers):
    """Test GET /api/v1/agents - List all agents."""
    response = client.get("/api/v1/agents", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data


def test_get_agent(client, auth_headers):
    """Test GET /api/v1/agents/:id - Get a specific agent."""
    create_response = client.post(
        "/api/v1/agents",
        json={
            "name": "Get Test Agent",
            "provider": "anthropic",
            "model": "claude-3-5-sonnet-20241022",
            "temperature": 0.5,
        },
        headers=auth_headers,
    )
    agent_id = create_response.json()["id"]

    response = client.get(f"/api/v1/agents/{agent_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == agent_id
    assert data["name"] == "Get Test Agent"


def test_update_agent(client, auth_headers):
    """Test PATCH /api/v1/agents/:id - Update an agent."""
    create_response = client.post(
        "/api/v1/agents",
        json={
            "name": "Original Name",
            "provider": "openai",
            "model": "gpt-4o",
            "temperature": 0.5,
        },
        headers=auth_headers,
    )
    agent_id = create_response.json()["id"]

    response = client.patch(
        f"/api/v1/agents/{agent_id}",
        json={"name": "Updated Name", "temperature": 0.9},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["temperature"] == 0.9


def test_delete_agent(client, auth_headers):
    """Test DELETE /api/v1/agents/:id - Delete an agent."""
    create_response = client.post(
        "/api/v1/agents",
        json={
            "name": "Delete Me",
            "provider": "google",
            "model": "gemini-2.0-flash",
            "temperature": 0.5,
        },
        headers=auth_headers,
    )
    agent_id = create_response.json()["id"]

    response = client.delete(f"/api/v1/agents/{agent_id}", headers=auth_headers)
    assert response.status_code == 204

    get_response = client.get(f"/api/v1/agents/{agent_id}", headers=auth_headers)
    assert get_response.status_code == 404


def test_tenant_isolation(client):
    """Test that agents are isolated by tenant."""
    token1 = create_access_token(data={"sub": "user1", "tenant_id": "tenant-1"})
    token2 = create_access_token(data={"sub": "user2", "tenant_id": "tenant-2"})
    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}

    r1 = client.post(
        "/api/v1/agents",
        json={"name": "Tenant1 Agent", "provider": "openai", "model": "gpt-4"},
        headers=headers1,
    )
    assert r1.status_code == 201

    r2 = client.get("/api/v1/agents", headers=headers2)
    assert r2.status_code == 200
    items = r2.json()["items"]
    assert not any(a["name"] == "Tenant1 Agent" for a in items)
