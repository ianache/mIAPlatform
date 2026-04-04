"""Chat schemas for API requests and responses."""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime


class MetadataProperty(BaseModel):
    """Single metadata property with key-value pair."""
    key: str = Field(..., min_length=1, max_length=100)
    value: Any


class ChatRequest(BaseModel):
    """Request model for chat endpoint with metadata injection."""
    session_code: str = Field(..., min_length=1, max_length=50, description="Código de sesión de chat")
    agent_code: str = Field(..., min_length=1, max_length=50, description="Código del agente registrado en BD")
    message: str = Field(..., min_length=1, description="Mensaje del usuario")
    metadata: List[MetadataProperty] = Field(default=[], description="Metadatos a inyectar en la inferencia")
    stream: bool = Field(default=True, description="Si debe retornar respuesta en streaming")


class ChatMessageCreate(BaseModel):
    """Create a new chat message."""
    role: str = Field(..., pattern="^(user|assistant|system|tool)$")
    content: str
    metadata: Optional[Dict[str, Any]] = None
    injected_metadata: Optional[Dict[str, Any]] = None
    tool_calls: Optional[List[Dict]] = None
    tool_results: Optional[List[Dict]] = None


class ChatMessageResponse(BaseModel):
    """Response model for chat messages."""
    id: UUID
    session_id: UUID
    sequence_number: int
    role: str
    content: str
    metadata: Dict[str, Any]
    injected_metadata: Dict[str, Any]
    tool_calls: Optional[List[Dict]]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ChatSessionCreate(BaseModel):
    """Create a new chat session."""
    subproject_id: UUID
    agent_id: UUID
    title: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ChatSessionResponse(BaseModel):
    """Response model for chat sessions."""
    id: UUID
    tenant_id: str
    subproject_id: UUID
    agent_id: UUID
    session_code: str
    title: Optional[str]
    status: str
    metadata: Dict[str, Any]
    message_count: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ChatSessionDetailResponse(ChatSessionResponse):
    """Detailed session with messages."""
    messages: List[ChatMessageResponse] = []


class ChatStreamChunk(BaseModel):
    """Streaming response chunk."""
    type: str = Field(..., pattern="^(content|tool_call|tool_result|metadata|error|done)$")
    content: Optional[str] = None
    tool_call: Optional[Dict[str, Any]] = None
    tool_result: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    sequence_number: Optional[int] = None


class ChatMetadataTemplateCreate(BaseModel):
    """Create metadata injection template."""
    agent_id: UUID
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    configuration: Dict[str, Any]  # Template configuration


class ChatMetadataTemplateResponse(BaseModel):
    """Response for metadata template."""
    id: UUID
    agent_id: UUID
    name: str
    description: Optional[str]
    configuration: Dict[str, Any]
    is_active: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ChatContext(BaseModel):
    """Chat context for agent inference."""
    session_code: str
    agent_code: str
    agent_config: Dict[str, Any]
    conversation_history: List[ChatMessageResponse]
    injected_metadata: Dict[str, Any]
    system_prompt: Optional[str] = None
