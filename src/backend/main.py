"""Orchestra - Multi-Agent AI Platform API."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.backend.api import health
from src.backend.llm import routes as llm_router
from src.backend.api import tenants


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
app.include_router(llm_router.router, prefix="/api/v1/llm")
app.include_router(tenants.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint."""
    return {"service": "Orchestra", "version": "1.0.0", "status": "running"}
