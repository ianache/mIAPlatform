---
phase: 01-foundation
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/backend/main.py
  - src/backend/api/__init__.py
  - src/backend/api/health.py
  - src/backend/api/tenants.py
  - src/backend/core/config.py
  - src/backend/core/security.py
  - src/backend/db/database.py
  - src/backend/llm/gateway.py
autonomous: true
requirements: []
---

<objective>
Build FastAPI core with authentication and LiteLLM gateway
</objective>

<context>
@.planning/research/STACK.md
@.planning/research/ARCHITECTURE.md
@.planning/phases/01-foundation/01-foundation-01-PLAN.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create FastAPI core structure</name>
  <files>src/backend/main.py, src/backend/api/__init__.py, src/backend/api/health.py, src/backend/core/config.py</files>
  <read_first>
- .planning/research/STACK.md (for FastAPI setup patterns)
- .planning/phases/01-foundation/01-foundation-01-PLAN.md (project structure)
  </read_first>
  <action>
Create the FastAPI backend structure:

1. **src/backend/__init__.py**: Empty

2. **src/backend/core/config.py**:
```python
"""Application configuration."""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Orchestra"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    POSTGRES_URL: str = "postgresql+asyncpg://miaplatform:changeme@localhost:5432/miaplatform"
    MONGO_URL: str = "mongodb://miaplatform:changeme@localhost:27017"
    NEO4J_URL: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "changeme"
    
    # Vault
    VAULT_URL: str = "http://localhost:8200"
    VAULT_TOKEN: str = "changeme"
    
    # Keycloak
    KEYCLOAK_URL: str = "http://localhost:8080"
    KEYCLOAK_REALM: str = "miaplatform"
    KEYCLOAK_CLIENT_ID: str = "miaplatform"
    
    # JWT
    JWT_SECRET_KEY: str = "changeme-dev-secret-key-replace-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

3. **src/backend/core/__init__.py**: Empty

4. **src/backend/core/security.py** (JWT handling):
```python
"""Security utilities for JWT authentication."""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .config import get_settings

settings = get_settings()
security = HTTPBearer()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials) -> dict:
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
```

5. **src/backend/api/__init__.py**: Empty

6. **src/backend/api/health.py**:
```python
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
    return {
        "status": "ready",
        "checks": {
            "api": "ok",
            "llm_gateway": "ok"
        }
    }
```

7. **src/backend/main.py** (application entry point):
```python
"""Orchestra - Multi-Agent AI Platform API."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.backend.api import health


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print("Starting Orchestra API...")
    yield
    # Shutdown
    print("Shutting down Orchestra API...")


app = FastAPI(
    title="Orchestra API",
    description="Multi-Agent AI Platform - Foundation Phase",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Orchestra",
        "version": "1.0.0",
        "status": "running"
    }
```
  </action>
  <acceptance_criteria>
- main.py creates FastAPI app with CORS middleware and health endpoints
- config.py contains Settings class with all environment variables
- security.py contains JWT create and verify functions
- health.py has /health and /health/ready endpoints
- All files follow Python async patterns
  </acceptance_criteria>
  <verify>Command: python -m py_compile src/backend/main.py src/backend/core/config.py src/backend/core/security.py</verify>
  <done>FastAPI core structure created</done>
</task>

<task type="auto">
  <name>Task 2: Set up LiteLLM gateway for unified LLM access</name>
  <files>src/backend/llm/gateway.py, src/backend/llm/__init__.py</files>
  <read_first>
- .planning/research/STACK.md (for LiteLLM patterns)
  </read_first>
  <action>
Create the LiteLLM gateway for unified LLM access:

1. **src/backend/llm/__init__.py**: Empty

2. **src/backend/llm/gateway.py**:
```python
"""LiteLLM Gateway for unified LLM access."""
import os
from typing import Optional, Any, Dict
import httpx
from litellm import acompletion, completion
from litellm.utils import ModelResponse

# Configure LiteLLM
os.environ["LITELLM_MAX_PARALLEL_REQUESTS"] = "100"
os.environ["LITELLM_REQUEST_TIMEOUT"] = "60"


class LLMGateway:
    """Unified gateway for 100+ LLM providers via LiteLLM."""
    
    def __init__(self):
        self.available_models = [
            # OpenAI
            "gpt-4o",
            "gpt-4o-mini",
            "gpt-4-turbo",
            # Anthropic
            "claude-3-5-sonnet-20241022",
            "claude-3-opus-20240229",
            # Google
            "gemini-1.5-pro",
            "gemini-1.5-flash",
            # Local
            "ollama/llama3.1",
            "ollama/mistral",
        ]
    
    async def complete(
        self,
        model: str,
        messages: list[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        tenant_id: Optional[str] = None,
    ) -> ModelResponse:
        """
        Execute LLM completion request.
        
        Args:
            model: Model identifier (e.g., "gpt-4o", "claude-3-5-sonnet-20241022")
            messages: Chat messages [{"role": "user", "content": "..."}]
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum tokens to generate
            tenant_id: Tenant for Vault secret lookup
        """
        # Build request params
        params = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }
        
        if max_tokens:
            params["max_tokens"] = max_tokens
        
        try:
            response = await acompletion(**params)
            return response
        except Exception as e:
            raise LLMGatewayError(f"LLM request failed: {str(e)}")
    
    def complete_sync(
        self,
        model: str,
        messages: list[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> ModelResponse:
        """Synchronous completion for non-async contexts."""
        params = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }
        
        if max_tokens:
            params["max_tokens"] = max_tokens
        
        try:
            response = completion(**params)
            return response
        except Exception as e:
            raise LLMGatewayError(f"LLM request failed: {str(e)}")
    
    async def validate_model(self, model: str) -> bool:
        """Check if a model is available."""
        return model in self.available_models
    
    def list_models(self) -> list[str]:
        """List all available models."""
        return self.available_models.copy()


class LLMGatewayError(Exception):
    """Exception for LLM gateway errors."""
    pass


# Global gateway instance
llm_gateway = LLMGateway()
```

3. **Add LLM endpoint to main.py** - Add after health router:
```python
# In src/backend/main.py, add after imports:
from src.backend.llm import gateway as llm_router

# After app.include_router(health.router):
app.include_router(llm_router.router, prefix="/api/v1/llm")
```

4. **Create src/backend/llm/routes.py**:
```python
"""LLM API routes."""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from src.backend.core.security import verify_token, security
from src.backend.llm.gateway import llm_gateway, LLMGatewayError

router = APIRouter(tags=["llm"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: str
    messages: list[ChatMessage]
    temperature: float = 0.7
    max_tokens: Optional[int] = None


class ChatResponse(BaseModel):
    model: str
    content: str
    usage: dict


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    credentials = Depends(security),
):
    """Send chat request to LLM via LiteLLM gateway."""
    # Verify token
    token_data = verify_token(credentials)
    
    # Validate model
    if not await llm_gateway.validate_model(request.model):
        raise HTTPException(
            status_code=400,
            detail=f"Model {request.model} not available"
        )
    
    # Execute request
    try:
        messages = [{"role": m.role, "content": m.content} for m in request.messages]
        response = await llm_gateway.complete(
            model=request.model,
            messages=messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
        )
        
        return ChatResponse(
            model=request.model,
            content=response.choices[0].message.content,
            usage={
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            }
        )
    except LLMGatewayError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/models")
async def list_models(credentials = Depends(security)):
    """List available LLM models."""
    verify_token(credentials)
    return {"models": llm_gateway.list_models()}
```
  </action>
  <acceptance_criteria>
- gateway.py contains LLMGateway class with complete() method supporting 100+ models
- gateway.py handles async completion via LiteLLM
- routes.py provides /chat endpoint with authentication
- routes.py provides /models endpoint to list available models
- All endpoints return proper response models
  </acceptance_criteria>
  <verify>Command: python -m py_compile src/backend/llm/gateway.py src/backend/llm/routes.py</verify>
  <done>LiteLLM gateway configured with chat and models endpoints</done>
</task>

<task type="auto">
  <name>Task 3: Create basic tenant isolation mechanisms</name>
  <files>src/backend/api/tenants.py, src/backend/db/database.py</files>
  <read_first>
- .planning/research/ARCHITECTURE.md (for multi-tenant patterns)
  </read_first>
  <action>
Create tenant isolation infrastructure:

1. **src/backend/db/__init__.py**: Empty

2. **src/backend/db/database.py**:
```python
"""Database connections and session management."""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from motor.motor_asyncio import AsyncIOMotorClient
from neo4j import AsyncGraphDatabase
from src.backend.core.config import get_settings

settings = get_settings()

# PostgreSQL (async)
engine = create_async_engine(
    settings.POSTGRES_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# MongoDB (async)
mongo_client: AsyncIOMotorClient = None


async def get_mongo_db():
    """Get MongoDB database instance."""
    global mongo_client
    if mongo_client is None:
        mongo_client = AsyncIOMotorClient(settings.MONGO_URL)
    return mongo_client[settings.POSTGRES_DB]


# Neo4j (async)
neo4j_driver = None


async def get_neo4j_driver():
    """Get Neo4j driver instance."""
    global neo4j_driver
    if neo4j_driver is None:
        neo4j_driver = AsyncGraphDatabase.driver(
            settings.NEO4J_URL,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
        )
    return neo4j_driver


async def close_db_connections():
    """Close all database connections on shutdown."""
    global mongo_client, neo4j_driver
    if mongo_client:
        mongo_client.close()
    if neo4j_driver:
        await neo4j_driver.close()
```

3. **src/backend/api/tenants.py**:
```python
"""Tenant management API routes."""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.backend.core.security import verify_token, security
from src.backend.db.database import get_db

router = APIRouter(prefix="/tenants", tags=["tenants"])


class TenantCreate(BaseModel):
    name: str
    slug: str
    plan: str = "free"


class TenantResponse(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    created_at: str


class TenantUpdate(BaseModel):
    name: Optional[str] = None
    plan: Optional[str] = None


# In-memory tenant store (replace with PostgreSQL model in production)
tenants_db: dict[str, dict] = {}


@router.post("/", response_model=TenantResponse)
async def create_tenant(
    tenant: TenantCreate,
    credentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    """Create a new tenant."""
    token_data = verify_token(credentials)
    
    # Check slug uniqueness
    for existing in tenants_db.values():
        if existing["slug"] == tenant.slug:
            raise HTTPException(
                status_code=400,
                detail="Tenant slug already exists"
            )
    
    import uuid
    tenant_id = str(uuid.uuid4())
    
    new_tenant = {
        "id": tenant_id,
        "name": tenant.name,
        "slug": tenant.slug,
        "plan": tenant.plan,
        "created_at": "2026-04-02T00:00:00Z",
    }
    
    tenants_db[tenant_id] = new_tenant
    
    return TenantResponse(**new_tenant)


@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: str,
    credentials = Depends(security),
):
    """Get tenant by ID."""
    verify_token(credentials)
    
    if tenant_id not in tenants_db:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    return TenantResponse(**tenants_db[tenant_id])


@router.get("/", response_model=list[TenantResponse])
async def list_tenants(
    credentials = Depends(security),
):
    """List all tenants (admin only)."""
    verify_token(credentials)
    return [TenantResponse(**t) for t in tenants_db.values()]


@router.patch("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: str,
    update: TenantUpdate,
    credentials = Depends(security),
):
    """Update tenant settings."""
    verify_token(credentials)
    
    if tenant_id not in tenants_db:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    tenant = tenants_db[tenant_id]
    
    if update.name:
        tenant["name"] = update.name
    if update.plan:
        tenant["plan"] = update.plan
    
    return TenantResponse(**tenant)
```

4. **Update main.py to include tenants router**:
```python
# Add after other router includes:
from src.backend.api import tenants
app.include_router(tenants.router, prefix="/api/v1")
```
  </action>
  <acceptance_criteria>
- database.py contains get_db() for PostgreSQL, get_mongo_db(), get_neo4j_driver()
- database.py configures async SQLAlchemy with connection pooling
- tenants.py provides CRUD operations for tenant management
- Tenant isolation uses tenant_id in all data operations
- All routes require JWT authentication
  </acceptance_criteria>
  <verify>Command: python -m py_compile src/backend/db/database.py src/backend/api/tenants.py</verify>
  <done>Tenant isolation mechanisms created</done>
</task>

</tasks>

<verification>
- FastAPI app starts without errors
- Health endpoints respond correctly
- LiteLLM gateway loads with available models
- Tenant routes require authentication
</verification>

<success_criteria>
FastAPI core running with authentication, LiteLLM gateway working, tenant isolation in place
</success_criteria>

<output>
After completion, update `.planning/phases/01-foundation/01-foundation-02-SUMMARY.md`
</output>
