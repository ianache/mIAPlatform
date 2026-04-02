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
