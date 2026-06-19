from fastapi import APIRouter, Depends, HTTPException, status, Request, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import logging
import asyncio
import json
from datetime import datetime

from src.backend.db.database import get_db
from src.backend.core.security import verify_token, security, verify_token_raw
from src.backend.core.cache import cache_get, cache_set, cache_delete, cache_invalidate_pattern
from src.backend.core.config import get_settings
from src.backend.models.flow import Flow
from src.backend.models.flow_run import FlowRun
from src.backend.models.flow_schemas import (
    FlowCreate,
    FlowUpdate,
    FlowResponse,
    FlowListResponse,
)
from src.backend.api.ws_manager import event_manager

router = APIRouter(prefix="/library/flows", tags=["library"])
logger = logging.getLogger(__name__)


async def get_current_tenant(request: Request, credentials=Depends(security)):
    auth_header = request.headers.get("Authorization", "")
    logger.info(f"Authorization present: {bool(auth_header)}")
    try:
        token_data = await verify_token(credentials)
        tenant_id = token_data.get("tenant_id")
        if not tenant_id:
            tenant_id = token_data.get("sub", "default-tenant")
            logger.warning(f"No tenant_id, using sub: {tenant_id}")
        return tenant_id
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Authentication required")


@router.post("", response_model=FlowResponse, status_code=status.HTTP_201_CREATED)
async def create_flow(
    request: Request,
    flow_in: FlowCreate,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    flow = Flow(**flow_in.model_dump(), tenant_id=tenant_id)
    db.add(flow)
    await db.commit()
    await db.refresh(flow)
    await cache_invalidate_pattern(f"{tenant_id}:flows:*")
    return flow


@router.get("", response_model=FlowListResponse)
async def list_flows(
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    cache_key = f"{tenant_id}:flows:list"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    result = await db.execute(select(Flow).where(Flow.tenant_id == tenant_id))
    flows = result.scalars().all()
    data = {
        "items": [FlowResponse.model_validate(f).model_dump(mode="json") for f in flows],
        "total": len(flows),
    }
    await cache_set(cache_key, data, ttl=get_settings().REDIS_TTL)
    return data


@router.get("/{flow_id}", response_model=FlowResponse)
async def get_flow(
    flow_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    cache_key = f"{tenant_id}:flows:{flow_id}"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    result = await db.execute(
        select(Flow).where(Flow.id == flow_id, Flow.tenant_id == tenant_id)
    )
    flow = result.scalar_one_or_none()
    if not flow:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flow not found")

    data = FlowResponse.model_validate(flow).model_dump(mode="json")
    await cache_set(cache_key, data, ttl=get_settings().REDIS_TTL)
    return data


@router.patch("/{flow_id}", response_model=FlowResponse)
async def update_flow(
    flow_id: UUID,
    flow_in: FlowUpdate,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    result = await db.execute(
        select(Flow).where(Flow.id == flow_id, Flow.tenant_id == tenant_id)
    )
    flow = result.scalar_one_or_none()
    if not flow:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flow not found")

    for field, value in flow_in.model_dump(exclude_unset=True).items():
        setattr(flow, field, value)

    await db.commit()
    await db.refresh(flow)
    await cache_delete(f"{tenant_id}:flows:{flow_id}")
    await cache_delete(f"{tenant_id}:flows:list")
    return flow


@router.delete("/{flow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flow(
    flow_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    result = await db.execute(
        select(Flow).where(Flow.id == flow_id, Flow.tenant_id == tenant_id)
    )
    flow = result.scalar_one_or_none()
    if not flow:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flow not found")

    await db.delete(flow)
    await db.commit()
    await cache_delete(f"{tenant_id}:flows:{flow_id}", f"{tenant_id}:flows:list")
    return None


@router.post("/{flow_id}/execute", status_code=status.HTTP_202_ACCEPTED)
async def execute_flow(
    flow_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Execute a flow: creates flow_run record and enqueues BullMQ job."""
    # Verify flow exists for tenant
    result = await db.execute(
        select(Flow).where(Flow.id == flow_id, Flow.tenant_id == tenant_id)
    )
    flow = result.scalar_one_or_none()
    if not flow:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flow not found")

    # Create flow_run row
    flow_run = FlowRun(
        flow_id=flow_id,
        tenant_id=tenant_id,
        status="running",
        trigger="manual",
    )
    db.add(flow_run)
    await db.commit()
    await db.refresh(flow_run)

    # Enqueue BullMQ job
    settings = get_settings()
    redis_url = settings.REDIS_URL
    # Parse Redis connection from URL
    redis_host = redis_url.split("://")[-1].split(":")[0]
    redis_port = 6379
    redis_password = settings.REDIS_PASSWORD

    from bullmq import Queue
    queue = Queue("execute_flow", opts={
        "connection": {
            "host": redis_host,
            "port": redis_port,
            "password": redis_password,
        }
    })
    await queue.add("execute_flow", {
        "flowId": str(flow_id),
        "tenantId": tenant_id,
        "runId": str(flow_run.id),
    })
    await queue.close()

    return {"run_id": str(flow_run.id), "status": "running"}


@router.get("/{flow_id}/runs")
async def list_flow_runs(
    flow_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """List flow runs for a flow (paginated, excludes full log)."""
    # Verify flow exists for tenant
    result = await db.execute(
        select(Flow).where(Flow.id == flow_id, Flow.tenant_id == tenant_id)
    )
    flow = result.scalar_one_or_none()
    if not flow:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flow not found")

    result = await db.execute(
        select(FlowRun)
        .where(FlowRun.flow_id == flow_id, FlowRun.tenant_id == tenant_id)
        .order_by(FlowRun.started_at.desc())
        .limit(50)
    )
    runs = result.scalars().all()
    return {
        "items": [
            {
                "id": str(r.id),
                "flow_id": str(r.flow_id),
                "status": r.status,
                "trigger": r.trigger,
                "started_at": r.started_at.isoformat() if r.started_at else None,
                "finished_at": r.finished_at.isoformat() if r.finished_at else None,
                "final_output": r.final_output,
            }
            for r in runs
        ],
        "total": len(runs),
    }


@router.get("/{flow_id}/runs/{run_id}")
async def get_flow_run(
    flow_id: UUID,
    run_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    """Get a single flow run with full log."""
    result = await db.execute(
        select(FlowRun).where(
            FlowRun.id == run_id,
            FlowRun.flow_id == flow_id,
            FlowRun.tenant_id == tenant_id,
        )
    )
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flow run not found")

    return {
        "id": str(run.id),
        "flow_id": str(run.flow_id),
        "tenant_id": run.tenant_id,
        "status": run.status,
        "trigger": run.trigger,
        "started_at": run.started_at.isoformat() if run.started_at else None,
        "finished_at": run.finished_at.isoformat() if run.finished_at else None,
        "log": run.log,
        "final_output": run.final_output,
    }


# WebSocket router for flow run events
ws_router = APIRouter(tags=["flow_runs"])


@ws_router.websocket("/library/runs/ws/{run_id}")
async def flow_run_websocket(
    websocket: WebSocket,
    run_id: str,
    token: str = Query(...),
):
    """WebSocket endpoint for flow run real-time events."""
    try:
        await verify_token_raw(token)
    except Exception:
        await websocket.close(code=4001)
        return

    await event_manager.connect(f"run:{run_id}", websocket)
    try:
        while True:
            # Keep connection alive - wait for any client message
            data = await websocket.receive_text()
            # Echo or ignore - we just need to keep the connection open
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        event_manager.disconnect(f"run:{run_id}", websocket)
    except Exception:
        event_manager.disconnect(f"run:{run_id}", websocket)


async def subscribe_flow_run_events():
    """Redis subscriber for flow_run:* channel events - relays to WebSocket clients (with auto-reconnect)."""
    import redis.asyncio as redis

    settings = get_settings()
    redis_url = settings.REDIS_URL
    redis_host = redis_url.split("://")[-1].split(":")[0]
    redis_port = 6379
    redis_password = settings.REDIS_PASSWORD

    logger.info("Starting flow run subscriber task...")

    while True:
        try:
            logger.info("Connecting to Redis for pub/sub...")
            pubsub_conn = redis.Redis(
                host=redis_host,
                port=redis_port,
                password=redis_password,
                decode_responses=True,
            )

            pubsub = pubsub_conn.pubsub()
            await pubsub.psubscribe("flow_run:*")
            logger.info("Subscribed to flow_run:* channel successfully")

            try:
                async for message in pubsub.listen():
                    if message["type"] == "pmessage":
                        channel = message["channel"]  # e.g., "flow_run:{run_id}"
                        try:
                            event = json.loads(message["data"])
                        except json.JSONDecodeError:
                            logger.warning(f"Invalid JSON in flow_run event: {message['data']}")
                            continue

                        # Extract run_id from channel name
                        if ":" in channel:
                            run_id = channel.split(":", 1)[1]
                            # Broadcast to WebSocket clients
                            await event_manager.broadcast(f"run:{run_id}", event)

                            # Update flow_runs status in DB if terminal event
                            if event.get("type") in ("run_complete", "run_failed"):
                                from src.backend.db.database import get_session_maker
                                SessionLocal = get_session_maker()
                                async with SessionLocal() as db:
                                    result = await db.execute(
                                        select(FlowRun).where(FlowRun.id == UUID(run_id))
                                    )
                                    flow_run = result.scalar_one_or_none()
                                    if flow_run:
                                        flow_run.status = "success" if event.get("type") == "run_complete" else "failed"
                                        if event.get("finished_at"):
                                            flow_run.finished_at = datetime.fromisoformat(event["finished_at"])
                                        if event.get("final_output"):
                                            flow_run.final_output = event["final_output"]
                                        await db.commit()
                        else:
                            logger.warning(f"Unexpected channel format: {channel}")
            finally:
                try:
                    await pubsub.unsubscribe("flow_run:*")
                except Exception:
                    pass
                await pubsub_conn.close()
                logger.info("Redis pub/sub connection closed")

        except asyncio.CancelledError:
            logger.info("Flow run subscriber task cancelled")
            break
        except Exception as e:
            logger.error(f"Error in subscribe_flow_run_events: {e}. Retrying in 5 seconds...")
            try:
                await asyncio.sleep(5)
            except asyncio.CancelledError:
                logger.info("Flow run subscriber task cancelled during retry sleep")
                break
