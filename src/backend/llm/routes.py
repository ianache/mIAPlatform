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
    credentials=Depends(security),
):
    """Send chat request to LLM via LiteLLM gateway."""
    # Verify token
    token_data = verify_token(credentials)

    # Validate model
    if not await llm_gateway.validate_model(request.model):
        raise HTTPException(
            status_code=400, detail=f"Model {request.model} not available"
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
            },
        )
    except LLMGatewayError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/models")
async def list_models(credentials=Depends(security)):
    """List available LLM models."""
    verify_token(credentials)
    return {"models": llm_gateway.list_models()}
