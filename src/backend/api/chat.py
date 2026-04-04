"""Chat API endpoints with metadata injection for Google ADK."""

import logging
import json
import re
import os
from pathlib import Path
from datetime import datetime
from uuid import UUID, uuid4
from typing import AsyncGenerator, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
import secrets
import string

from src.backend.db.database import get_db
from src.backend.core.security import verify_token, security
from src.backend.models.chat import ChatSession, ChatMessage, ChatMetadataTemplate
from src.backend.models.chat_schemas import (
    ChatRequest, ChatMessageCreate, ChatMessageResponse, 
    ChatSessionCreate, ChatSessionResponse, ChatSessionDetailResponse,
    ChatStreamChunk, MetadataProperty
)
from src.backend.models.agent import Agent
from src.backend.models.workspace import Subproject, AgentArtifact
from src.backend.models.workspace_schemas import AgentArtifactResponse
from src.backend.models.registry_model import APIKeyRecord, RegistryModel as RegistryModelDB
from src.backend.api.ws_manager import event_manager
from src.backend.core.security import verify_token_raw
from src.backend.core.config import get_settings

# Fallback LiteLLM prefix when no matching registry entry exists
_PROVIDER_PREFIX_MAP: dict[str, str] = {
    "google": "gemini",
    "openai": "openai",
    "anthropic": "anthropic",
    "ollama": "ollama",
}

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)


def generate_session_code() -> str:
    """Generate a human-readable session code."""
    # Generate code like "CHAT-ABC123XYZ"
    chars = string.ascii_uppercase + string.digits
    random_part = ''.join(secrets.choice(chars) for _ in range(9))
    return f"CHAT-{random_part[:3]}{random_part[3:6]}{random_part[6:9]}"


def convert_metadata_to_dict(metadata_list: List[MetadataProperty]) -> Dict[str, Any]:
    """Convert list of metadata properties to dictionary."""
    return {prop.key: prop.value for prop in metadata_list}


def format_metadata_for_adk(metadata: Dict[str, Any]) -> str:
    """Format metadata for injection into Google ADK context."""
    if not metadata:
        return ""
    
    lines = ["\n=== CONTEXTO ADICIONAL ==="]
    for key, value in metadata.items():
        lines.append(f"{key}: {value}")
    lines.append("========================\n")
    return "\n".join(lines)


@router.websocket("/ws/{session_code}")
async def agent_events_ws(
    session_code: str,
    websocket: WebSocket,
    token: str = Query(...),
):
    """WebSocket endpoint — pushes agent intermediate steps to the client."""
    try:
        await verify_token_raw(token)
    except Exception:
        await websocket.close(code=1008)
        return

    await event_manager.connect(session_code, websocket)
    try:
        while True:
            await websocket.receive_text()   # keep-alive; ignore payload
    except WebSocketDisconnect:
        event_manager.disconnect(session_code, websocket)


@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_session(
    session_in: ChatSessionCreate,
    db: AsyncSession = Depends(get_db),
    credentials=Depends(security),
):
    """Create a new chat session."""
    try:
        token_data = await verify_token(credentials)
        tenant_id = token_data.get("tenant_id") or token_data.get("sub", "default-tenant")
        
        # Verify agent exists
        agent_result = await db.execute(
            select(Agent).where(Agent.id == session_in.agent_id, Agent.tenant_id == tenant_id)
        )
        if not agent_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Verify subproject exists
        subproject_result = await db.execute(
            select(Subproject).where(
                Subproject.id == session_in.subproject_id,
                Subproject.tenant_id == tenant_id
            )
        )
        if not subproject_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Subproject not found")
        
        # Generate unique session code
        session_code = generate_session_code()
        
        session = ChatSession(
            tenant_id=tenant_id,
            subproject_id=session_in.subproject_id,
            agent_id=session_in.agent_id,
            session_code=session_code,
        title=session_in.title or f"Chat {session_code}",
        session_metadata=session_in.session_metadata or {}
        )
        
        db.add(session)
        await db.commit()
        await db.refresh(session)
        
        return session
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating chat session: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_chat_sessions(
    subproject_id: UUID = None,
    agent_id: UUID = None,
    db: AsyncSession = Depends(get_db),
    credentials=Depends(security),
):
    """List chat sessions for tenant."""
    try:
        token_data = await verify_token(credentials)
        tenant_id = token_data.get("tenant_id") or token_data.get("sub", "default-tenant")
        
        query = select(ChatSession).where(
            ChatSession.tenant_id == tenant_id,
            ChatSession.status == "active"
        ).order_by(desc(ChatSession.updated_at))
        
        if subproject_id:
            query = query.where(ChatSession.subproject_id == subproject_id)
        if agent_id:
            query = query.where(ChatSession.agent_id == agent_id)
        
        result = await db.execute(query)
        sessions = result.scalars().all()
        
        return sessions
        
    except Exception as e:
        logger.error(f"Error listing sessions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions/{session_code}", response_model=ChatSessionDetailResponse)
async def get_chat_session(
    session_code: str,
    db: AsyncSession = Depends(get_db),
    credentials=Depends(security),
):
    """Get chat session with messages."""
    try:
        token_data = await verify_token(credentials)
        tenant_id = token_data.get("tenant_id") or token_data.get("sub", "default-tenant")
        
        result = await db.execute(
            select(ChatSession).where(
                ChatSession.session_code == session_code,
                ChatSession.tenant_id == tenant_id
            )
        )
        session = result.scalar_one_or_none()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return session
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


async def get_or_create_session(
    session_code: str,
    agent_id: str,
    tenant_id: str,
    db: AsyncSession
) -> tuple[ChatSession, Agent]:
    """Get existing session or create new one. Also validates agent."""
    # Convert agent_id string to UUID
    try:
        agent_uuid = UUID(agent_id)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid agent_id format: {agent_id}")
    
    # Verify agent by ID from database
    agent_result = await db.execute(
        select(Agent).where(Agent.id == agent_uuid, Agent.tenant_id == tenant_id)
    )
    agent = agent_result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent not found: {agent_id}")
    
    # Try to get existing session
    if session_code and session_code != "new":
        session_result = await db.execute(
            select(ChatSession).where(
                ChatSession.session_code == session_code,
                ChatSession.tenant_id == tenant_id
            )
        )
        session = session_result.scalar_one_or_none()
        
        if session:
            # Verify session belongs to this agent
            if str(session.agent_id) != str(agent.id):
                raise HTTPException(status_code=403, detail="Session does not belong to this agent")
            logger.info(f"Found existing session: {session.session_code}, subproject_id: {session.subproject_id}")
            return session, agent
    
    # Create new session
    # Need subproject - find or create default
    subproject_result = await db.execute(
        select(Subproject).where(Subproject.tenant_id == tenant_id).limit(1)
    )
    subproject = subproject_result.scalar_one_or_none()
    
    if not subproject:
        raise HTTPException(status_code=400, detail="No subproject available for chat session")
    
    new_session_code = generate_session_code()
    session = ChatSession(
        tenant_id=tenant_id,
        subproject_id=subproject.id,
        agent_id=agent.id,
        session_code=new_session_code,
        title=f"Chat with {agent.name}",
        metadata={}
    )
    
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return session, agent


async def get_conversation_context(
    session: ChatSession,
    db: AsyncSession,
    limit: int = 10
) -> List[ChatMessage]:
    """Get recent conversation history."""
    result = await db.execute(
        select(ChatMessage).where(
            ChatMessage.session_id == session.id
        ).order_by(desc(ChatMessage.sequence_number)).limit(limit)
    )
    messages = result.scalars().all()
    return list(reversed(messages))


async def save_message(
    session: ChatSession,
    role: str,
    content: str,
    message_metadata: Dict[str, Any],
    injected_metadata: Dict[str, Any],
    db: AsyncSession
) -> ChatMessage:
    """Save a message to the database."""
    # Get next sequence number
    result = await db.execute(
        select(func.max(ChatMessage.sequence_number)).where(
            ChatMessage.session_id == session.id
        )
    )
    max_seq = result.scalar() or 0
    
    message = ChatMessage(
        session_id=session.id,
        sequence_number=max_seq + 1,
        role=role,
        content=content,
        message_metadata=message_metadata,
        injected_metadata=injected_metadata
    )
    
    db.add(message)
    
    # Update session message count
    session.message_count = max_seq + 1
    await db.commit()
    await db.refresh(message)
    
    return message


async def get_agent_api_key(agent: Agent, db: AsyncSession) -> str:
    """Get API key for agent's provider from database."""
    try:
        result = await db.execute(
            select(APIKeyRecord).where(
                APIKeyRecord.provider == agent.provider,
                APIKeyRecord.is_valid == True
            )
        )
        api_key_record = result.scalar_one_or_none()
        
        if api_key_record:
            # Return the encrypted key (in production, decrypt it)
            return api_key_record.key_encrypted
        
        # Fallback to environment variable
        from src.backend.core.config import get_settings
        settings = get_settings()
        return settings.GOOGLE_API_KEY
        
    except Exception as e:
        logger.error(f"Error getting API key for provider {agent.provider}: {e}")
        from src.backend.core.config import get_settings
        settings = get_settings()
        return settings.GOOGLE_API_KEY


async def create_artifact_from_response(
    session: ChatSession,
    full_response: str,
    model_name: str,
    api_key: str,
    db: AsyncSession,
    litellm_prefix: str | None = None,
):
    """Generate a named artifact from the agent's full response text."""
    artifact_id = uuid4()
    settings = get_settings()

    # --- 1. Generate name + summary via a quick LiteLLM call ---
    name = f"Agent Response {datetime.utcnow():%Y-%m-%d %H:%M}"
    summary = full_response[:200] if full_response else ""

    try:
        import litellm
        # TEMPORARY: force artifact summarisation through Groq instead of the
        # agent's provider (avoids vertex_ai ADC requirement for Gemini).
        artifact_model = settings.ARTIFACT_LLM_MODEL  # e.g. "groq/openai/gpt-oss-120b"
        # Resolve Groq API key: DB first, then env var
        groq_key = settings.GROQ_API_KEY
        try:
            groq_result = await db.execute(
                select(APIKeyRecord).where(
                    APIKeyRecord.provider == "groq",
                    APIKeyRecord.is_valid == True,
                )
            )
            groq_record = groq_result.scalar_one_or_none()
            if groq_record:
                groq_key = groq_record.key_encrypted
                logger.info(f"Artifact key source: DB (provider=groq)")
            else:
                logger.info(f"Artifact key source: settings.GROQ_API_KEY")
        except Exception:
            pass
        masked = (groq_key[:8] + "..." + groq_key[-4:]) if groq_key and len(groq_key) > 12 else "(empty)"
        logger.info(f"Artifact LLM → model={artifact_model}  key={masked}")
        prompt = (
            "Read the following agent response and return ONLY a JSON object with two fields:\n"
            '{"name": "<short descriptive title, max 8 words>", "summary": "<one sentence summary>"}\n\n'
            f"Agent response:\n{full_response[:3000]}"
        )
        meta_response = await litellm.acompletion(
            model=artifact_model,
            api_key=groq_key or None,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=120,
            temperature=0.3,
        )
        raw = meta_response.choices[0].message.content or ""
        match = re.search(r'\{.*?\}', raw, re.DOTALL)
        if match:
            parsed = json.loads(match.group())
            name = parsed.get("name", name)[:200]
            summary = parsed.get("summary", summary)
    except Exception as e:
        logger.warning(f"Artifact name/summary generation failed: {e}")

    # --- 2. Write markdown file ---
    uploads_path = settings.UPLOADS_PATH
    artifact_dir = Path(uploads_path) / "artifacts" / session.session_code
    artifact_dir.mkdir(parents=True, exist_ok=True)
    artifact_file = artifact_dir / f"{artifact_id}.md"
    try:
        artifact_file.write_text(full_response, encoding="utf-8")
    except Exception as e:
        logger.error(f"Failed to write artifact file: {e}")
        return None

    file_url = f"/uploads/artifacts/{session.session_code}/{artifact_id}.md"

    # --- 3. Persist to DB ---
    try:
        logger.info(f"Creating artifact - Session ID: {session.id}, Session subproject_id: {session.subproject_id}")
        artifact = AgentArtifact(
            id=artifact_id,
            session_id=session.id,
            subproject_id=session.subproject_id,
            execution_id=None,
            name=name,
            summary=summary,
            artifact_type="markdown",
            content=full_response[:5000],
            file_url=file_url,
        )
        logger.info(f"Artifact created with subproject_id: {artifact.subproject_id}")
        db.add(artifact)
        await db.commit()
        await db.refresh(artifact)
        return artifact
    except Exception as e:
        logger.error(f"Failed to persist artifact: {e}")
        return None


async def stream_chat_response(
    session: ChatSession,
    agent: Agent,
    user_message: str,
    injected_metadata: Dict[str, Any],
    db: AsyncSession
) -> AsyncGenerator[str, None]:
    """Stream chat response with metadata injection using Google ADK."""
    response_content = []
    assistant_message_id = None
    
    try:
        # Get conversation history
        history = await get_conversation_context(session, db)
        
        # Build system prompt with metadata
        system_prompt = str(agent.system_prompt) if agent.system_prompt else "You are a helpful AI assistant."
        
        # Inject metadata into context
        metadata_context = format_metadata_for_adk(injected_metadata)
        if metadata_context:
            system_prompt += f"\n\n{metadata_context}"
        
        # Save user message
        await save_message(
            session, "user", user_message,
            {"timestamp": "user"}, injected_metadata, db
        )
        
        # Get API key for agent's provider
        api_key = await get_agent_api_key(agent, db)
        
        # Resolve registry entry: prefer registry_model_id FK, fall back to string match
        if agent.registry_model_id:
            reg_result = await db.execute(
                select(RegistryModelDB).where(
                    RegistryModelDB.id == agent.registry_model_id,
                )
            )
        else:
            reg_result = await db.execute(
                select(RegistryModelDB).where(
                    RegistryModelDB.model_id == agent.model,
                    RegistryModelDB.provider == agent.provider,
                    RegistryModelDB.tenant_id == session.tenant_id,
                ).limit(1)
            )
        registry_entry = reg_result.scalar_one_or_none()

        # Derive model_id and litellm_prefix from registry; fall back to agent fields
        resolved_model = (
            (registry_entry.model_id or registry_entry.name)
            if registry_entry else str(agent.model)
        )
        litellm_prefix: str | None = (
            registry_entry.litellm_prefix
            if registry_entry and registry_entry.litellm_prefix
            else _PROVIDER_PREFIX_MAP.get(str(agent.provider))
        )
        logger.info(
            f"Resolved model='{resolved_model}' litellm_prefix='{litellm_prefix}' "
            f"(registry_id={'set' if agent.registry_model_id else 'unset'}) "
            f"provider={agent.provider}"
        )

        # Build step_callback that broadcasts to WebSocket clients for this session
        _session_code = session.session_code
        async def _step_callback(step_type: str, message: str, **kwargs):
            from datetime import datetime
            await event_manager.broadcast(_session_code, {
                "type": "step", "step_type": step_type,
                "message": message, "timestamp": datetime.utcnow().isoformat(), **kwargs,
            })

        # Initialize ADK Agent with provider-agnostic LiteLLM prefix
        from src.backend.skills.adk_agent import GoogleADKAgent
        adk_agent = GoogleADKAgent(
            model=resolved_model,
            api_key=api_key,
            litellm_prefix=litellm_prefix,
            step_callback=_step_callback,
        )
        
        # Load only the skills specified in agent capabilities
        from src.backend.skills.loader import get_skills_loader
        loader = get_skills_loader()
        all_tools = loader.get_tools_for_agent()
        
        # Filter tools based on agent capabilities
        agent_capabilities = agent.capabilities or []
        if agent_capabilities:
            filtered_tools = []
            for tool in all_tools:
                # Check if tool's skill is in agent capabilities
                tool_skill_name = tool.get('name', '').split('.')[0] if '.' in tool.get('name', '') else tool.get('name', '')
                if tool_skill_name in agent_capabilities:
                    filtered_tools.append(tool)
            adk_agent._tools = filtered_tools
            logger.info(f"Agent {agent.name} using {len(filtered_tools)} tools from capabilities: {agent_capabilities}")
        else:
            adk_agent._tools = all_tools
            logger.info(f"Agent {agent.name} using all {len(all_tools)} available tools")
        
        # Initialize the agent
        await adk_agent.initialize()
        
        # Create a queue to collect agent events
        from asyncio import Queue
        agent_events: Queue = Queue()
        
        async def agent_event_callback(step_type: str, **kwargs):
            """Callback to capture agent events and put them in the queue."""
            await agent_events.put({
                "type": "step",
                "step_type": step_type,
                **kwargs
            })
        
        # Stream response from ADK agent with event callback
        sequence_number = 0
        async for chunk in adk_agent.chat_stream(
            message=user_message,
            system_prompt=system_prompt,
            context={"history": [(h.role, h.content) for h in history]},
            metadata=injected_metadata,
            event_callback=agent_event_callback
        ):
            # First, emit any pending agent events
            while not agent_events.empty():
                try:
                    event = agent_events.get_nowait()
                    event_chunk = ChatStreamChunk(
                        type="step",
                        content=json.dumps(event)
                    )
                    yield f"data: {json.dumps(event_chunk.model_dump())}\n\n"
                except:
                    break
            
            response_content.append(chunk)
            
            stream_chunk = ChatStreamChunk(
                type="content",
                content=chunk,
                sequence_number=sequence_number
            )
            sequence_number += 1
            yield f"data: {json.dumps(stream_chunk.model_dump())}\n\n"
        
        # Emit any remaining events after stream completes
        while not agent_events.empty():
            try:
                event = agent_events.get_nowait()
                event_chunk = ChatStreamChunk(
                    type="step",
                    content=json.dumps(event)
                )
                yield f"data: {json.dumps(event_chunk.model_dump())}\n\n"
            except:
                break
        
        # Save assistant message after streaming is complete
        full_response = "".join(response_content)
        assistant_message = await save_message(
            session, "assistant", full_response,
            {"model": str(agent.model), "provider": str(agent.provider)},
            {}, db
        )
        assistant_message_id = str(assistant_message.id)

        # Create artifact and emit SSE event before done
        if full_response.strip():
            artifact = await create_artifact_from_response(
                session, full_response, resolved_model, api_key, db,
                litellm_prefix=litellm_prefix,
            )
            if artifact:
                artifact_chunk = ChatStreamChunk(
                    type="artifact",
                    content=json.dumps({
                        "id": str(artifact.id),
                        "name": artifact.name,
                        "summary": artifact.summary,
                        "file_url": artifact.file_url,
                        "artifact_type": artifact.artifact_type,
                        "created_at": artifact.created_at.isoformat(),
                    })
                )
                yield f"data: {json.dumps(artifact_chunk.model_dump())}\n\n"

        # Send completion with message ID
        done_chunk = ChatStreamChunk(
            type="done",
            content=assistant_message_id
        )
        yield f"data: {json.dumps(done_chunk.model_dump())}\n\n"
        
    except Exception as e:
        logger.error(f"Error in chat streaming: {e}", exc_info=True)
        error_chunk = ChatStreamChunk(type="error", content=str(e))
        yield f"data: {json.dumps(error_chunk.model_dump())}\n\n"


@router.post("/send")
async def send_chat_message(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    credentials=Depends(security),
):
    """Send a message to the chat with metadata injection.
    
    This endpoint:
    1. Validates session_code and agent_code
    2. Converts metadata list to dictionary
    3. Injects metadata into the inference context
    4. Streams the response back
    """
    try:
        token_data = await verify_token(credentials)
        tenant_id = token_data.get("tenant_id") or token_data.get("sub", "default-tenant")
        
        # Get or create session and validate agent
        session, agent = await get_or_create_session(
            request.session_code,
            request.agent_id,
            tenant_id,
            db
        )
        
        # Convert metadata list to dictionary
        injected_metadata = convert_metadata_to_dict(request.metadata)
        logger.info(f"Chat request - Session: {session.session_code}, Agent: {agent.name}")
        logger.info(f"Injected metadata: {injected_metadata}")
        
        if request.stream:
            # Return streaming response
            return StreamingResponse(
                stream_chat_response(
                    session, agent, request.message, injected_metadata, db
                ),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Session-Code": session.session_code
                }
            )
        else:
            # Non-streaming response
            history = await get_conversation_context(session, db)
            
            # Build system prompt with metadata
            system_prompt = agent.system_prompt or "You are a helpful AI assistant."
            metadata_context = format_metadata_for_adk(injected_metadata)
            if metadata_context:
                system_prompt += f"\n\n{metadata_context}"
            
            # Save user message
            await save_message(
                session, "user", request.message,
                {}, injected_metadata, db
            )
            
            # Simulate response (integrate with ADK here)
            response_text = f"Recibido: {request.message}\n\nMetadatos inyectados:\n"
            for key, value in injected_metadata.items():
                response_text += f"- {key}: {value}\n"
            
            # Save assistant message
            message = await save_message(
                session, "assistant", response_text,
                {"model": agent.model}, {}, db
            )
            
            return ChatMessageResponse.model_validate(message)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.get("/sessions/{session_code}/messages", response_model=List[ChatMessageResponse])
async def get_session_messages(
    session_code: str,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    credentials=Depends(security),
):
    """Get messages for a chat session."""
    try:
        token_data = await verify_token(credentials)
        tenant_id = token_data.get("tenant_id") or token_data.get("sub", "default-tenant")
        
        # Get session
        session_result = await db.execute(
            select(ChatSession).where(
                ChatSession.session_code == session_code,
                ChatSession.tenant_id == tenant_id
            )
        )
        session = session_result.scalar_one_or_none()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get messages
        result = await db.execute(
            select(ChatMessage).where(
                ChatMessage.session_id == session.id
            ).order_by(ChatMessage.sequence_number).offset(offset).limit(limit)
        )
        messages = result.scalars().all()
        
        return messages
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting messages: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions/{session_code}/artifacts", response_model=List[AgentArtifactResponse])
async def get_session_artifacts(
    session_code: str,
    db: AsyncSession = Depends(get_db),
    credentials=Depends(security),
):
    """Get artifacts produced during a chat session."""
    try:
        token_data = await verify_token(credentials)
        tenant_id = token_data.get("tenant_id") or token_data.get("sub", "default-tenant")

        session_result = await db.execute(
            select(ChatSession).where(
                ChatSession.session_code == session_code,
                ChatSession.tenant_id == tenant_id
            )
        )
        session = session_result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        result = await db.execute(
            select(AgentArtifact)
            .where(AgentArtifact.session_id == session.id)
            .order_by(desc(AgentArtifact.created_at))
        )
        return result.scalars().all()

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching session artifacts: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/subprojects/{subproject_id}/artifacts", response_model=List[AgentArtifactResponse])
async def get_subproject_artifacts(
    subproject_id: str,
    db: AsyncSession = Depends(get_db),
    credentials=Depends(security),
):
    """Get all artifacts for a subproject across all sessions.
    
    Searches by both subproject_id (for newer artifacts) and session_id (for backward compatibility).
    """
    try:
        token_data = await verify_token(credentials)
        tenant_id = token_data.get("tenant_id") or token_data.get("sub", "default-tenant")
        
        from uuid import UUID
        
        subproject_uuid = UUID(subproject_id)
        
        # Method 1: Get all sessions for this subproject
        sessions_result = await db.execute(
            select(ChatSession.id).where(
                ChatSession.subproject_id == subproject_uuid,
                ChatSession.tenant_id == tenant_id
            )
        )
        session_ids = [row[0] for row in sessions_result.all()]
        
        logger.info(f"Found {len(session_ids)} sessions for subproject {subproject_id}")
        
        # Method 2: Get artifacts by subproject_id OR session_id
        if session_ids:
            result = await db.execute(
                select(AgentArtifact)
                .where(
                    (AgentArtifact.subproject_id == subproject_uuid) |
                    (AgentArtifact.session_id.in_(session_ids))
                )
                .order_by(desc(AgentArtifact.created_at))
            )
        else:
            # Fallback: only search by subproject_id
            result = await db.execute(
                select(AgentArtifact)
                .where(AgentArtifact.subproject_id == subproject_uuid)
                .order_by(desc(AgentArtifact.created_at))
            )
        
        artifacts = result.scalars().all()
        logger.info(f"Found {len(artifacts)} artifacts for subproject {subproject_id}")
        
        return artifacts

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching subproject artifacts: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/sessions/{session_code}", status_code=status.HTTP_204_NO_CONTENT)
async def close_chat_session(
    session_code: str,
    db: AsyncSession = Depends(get_db),
    credentials=Depends(security),
):
    """Close a chat session."""
    try:
        token_data = await verify_token(credentials)
        tenant_id = token_data.get("tenant_id") or token_data.get("sub", "default-tenant")
        
        result = await db.execute(
            select(ChatSession).where(
                ChatSession.session_code == session_code,
                ChatSession.tenant_id == tenant_id
            )
        )
        session = result.scalar_one_or_none()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session.status = "closed"
        await db.commit()
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error closing session: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
