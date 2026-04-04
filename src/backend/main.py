"""Orchestra - Multi-Agent AI Platform API."""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from src.backend.api import health
from src.backend.llm import routes as llm_router
from src.backend.api import tenants, agents, registry, upload, skills, workspace, chat
from src.backend.core.cache import init_redis, close_redis
from src.backend.core.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    print("Starting Orchestra API...")
    await init_redis()
    yield
    await close_redis()
    print("Shutting down Orchestra API...")


app = FastAPI(
    title="Orchestra API",
    description="Multi-Agent AI Platform - Foundation Phase",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=False,
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
app.include_router(llm_router.router, prefix="/api/v1/llm")
app.include_router(tenants.router, prefix="/api/v1")
app.include_router(agents.router, prefix="/api/v1")
app.include_router(registry.router, prefix="/api/v1")
app.include_router(upload.router, prefix="/api/v1")
app.include_router(skills.router, prefix="/api/v1")
app.include_router(workspace.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")

# Static file serving for uploads (artifacts, avatars, etc.)
_uploads_dir = get_settings().UPLOADS_PATH
os.makedirs(_uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=_uploads_dir), name="uploads")


@app.get("/")
async def root():
    """Root endpoint."""
    return {"service": "Orchestra", "version": "1.0.0", "status": "running"}
