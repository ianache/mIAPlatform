"""Chat API endpoints with metadata injection for Google ADK."""

import logging
import json
from typing import AsyncGenerator, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from uuid import UUID
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
from src.backend.models.workspace import Subproject

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
            metadata=session_in.metadata or {}
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
    agent_code: str,
    tenant_id: str,
    db: AsyncSession
) -> tuple[ChatSession, Agent]:
    """Get existing session or create new one. Also validates agent."""
    # First verify agent by code (using session_code format as agent identifier for now)
    # In production, agent_code should be a separate field or identifier
    agent_result = await db.execute(
        select(Agent).where(Agent.tenant_id == tenant_id)
    )
    agents = agent_result.scalars().all()
    
    # Try to find agent - for now we'll use a simple matching or first available
    # In production, implement proper agent_code field
    agent = None
    for a in agents:
        if str(a.id).startswith(agent_code) or a.name.lower().replace(" ", "-") == agent_code.lower():
            agent = a
            break
    
    if not agent and agents:
        # Fallback to first agent for development
        agent = agents[0]
    
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent not found: {agent_code}")
    
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
    metadata: Dict[str, Any],
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
        metadata=metadata,
        injected_metadata=injected_metadata
    )
    
    db.add(message)
    
    # Update session message count
    session.message_count = max_seq + 1
    await db.commit()
    await db.refresh(message)
    
    return message


async def stream_chat_response(
    session: ChatSession,
    agent: Agent,
    user_message: str,
    injected_metadata: Dict[str, Any],
    db: AsyncSession
) -> AsyncGenerator[str, None]:
    """Stream chat response with metadata injection."""
    try:
        # Get conversation history
        history = await get_conversation_context(session, db)
        
        # Build system prompt with metadata
        system_prompt = agent.system_prompt or "You are a helpful AI assistant."
        
        # Inject metadata into context
        metadata_context = format_metadata_for_adk(injected_metadata)
        if metadata_context:
            system_prompt += f"\n\n{metadata_context}"
        
        # Save user message
        await save_message(
            session, "user", user_message,
            {"timestamp": "user"}, injected_metadata, db
        )
        
        # Here you would integrate with Google ADK
        # For now, simulate streaming response
        response_content = []
        
        # Simulate streaming chunks
        chunks = [
            "Entendido. ",
            "Procesando tu solicitud ",
            "con los metadatos proporcionados. ",
            "\n\n",
            "**Metadatos inyectados:**\n",
        ]
        
        for key, value in injected_metadata.items():
            chunks.append(f"- {key}: {value}\n")
        
        chunks.append("\n¿En qué más puedo ayudarte?")
        
        for i, chunk in enumerate(chunks):
            response_content.append(chunk)
            
            stream_chunk = ChatStreamChunk(
                type="content",
                content=chunk,
                sequence_number=i
            )
            yield f"data: {json.dumps(stream_chunk.model_dump())}\n\n"
        
        # Save assistant message
        full_response = "".join(response_content)
        await save_message(
            session, "assistant", full_response,
            {"model": agent.model, "provider": agent.provider},
            {}, db
        )
        
        # Send completion
        done_chunk = ChatStreamChunk(type="done")
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
            request.agent_code,
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
