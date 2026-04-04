"""Google ADK integration for agent chat.

Provides agent initialization with skills and tools loaded dynamically.
Uses LiteLLM for Google Gemini API access.
"""

import json
import logging
import os
import sys
from typing import AsyncGenerator, Dict, Any, List, Optional, Callable
import asyncio

from src.backend.core.config import get_settings
from src.backend.skills.loader import get_skills_loader, ToolDefinition

log_format = "%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s"
logging.basicConfig(
    level=logging.INFO,
    format=log_format,
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout) # Asegura que salgan por consola
    ]
)

logger = logging.getLogger(__name__)


class GoogleADKAgent:
    """Google ADK Agent wrapper with skill integration."""

    def __init__(
        self,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        litellm_prefix: Optional[str] = None,
        step_callback: Optional[Callable] = None,
    ):
        self.settings = get_settings()
        self.model = model or self.settings.GOOGLE_MODEL
        self.api_key = api_key or self.settings.GOOGLE_API_KEY
        self.litellm_prefix = litellm_prefix  # e.g. "gemini", "openai", "anthropic"
        self.step_callback = step_callback   # async (step_type, message, **kw) -> None
        self._tools: List[Dict[str, Any]] = []

    async def _emit(self, step_type: str, message: str, **kwargs) -> None:
        """Fire a step event to the callback if registered."""
        if self.step_callback:
            try:
                await self.step_callback(step_type=step_type, message=message, **kwargs)
            except Exception as e:
                logger.warning(f"Step callback error: {e}")

    async def initialize(self) -> bool:
        """Initialize the agent with skills."""
        try:
            # Load skills
            loader = get_skills_loader()
            self._tools = loader.get_tools_for_agent()

            if not self.api_key:
                logger.warning("No Google API key configured")
                return False

            logger.info(f"Agent initialized with {len(self._tools)} tools")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize Agent: {e}")
            return False

    async def chat_stream(
        self,
        message: str,
        system_prompt: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        event_callback: Optional[Callable[[str, Dict[str, Any]], None]] = None
    ) -> AsyncGenerator[str, None]:
        """Stream chat response from the agent using an agentic tool-use loop.
        
        Args:
            event_callback: Optional callback for agent events (step_type, data).
                          Called with events like ('thinking', {...}), ('tool_call', {...}), etc.
        """
        # Temporarily override step_callback if event_callback is provided
        original_callback = self.step_callback
        if event_callback:
            self.step_callback = event_callback
        
        try:
            if not self.api_key:
                logger.warning("No API key configured")
                async for chunk in self._fallback_stream(message, system_prompt or "", metadata or {}):
                    yield chunk
                return

            import litellm

            await self._emit("thinking", "Analizando solicitud...")

            # Build messages
            messages = []

            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})

            if context and context.get("history"):
                for role, content in context["history"]:
                    messages.append({"role": role, "content": content})

            full_message = message
            if metadata:
                metadata_str = "\n".join([f"- {k}: {v}" for k, v in metadata.items()])
                full_message = f"{message}\n\nContext:\n{metadata_str}"

            messages.append({"role": "user", "content": full_message})

            # Convert tools to LiteLLM format (only those with handlers)
            tools = [
                {
                    "type": "function",
                    "function": {
                        "name": tool['name'],
                        "description": tool.get('description', ''),
                        "parameters": tool.get('parameters', {})
                    }
                }
                for tool in self._tools if tool.get('handler')
            ]

            #model_name = f"{self.litellm_prefix}/{self.model}" if self.litellm_prefix else self.model
            model_name = "groq/openai/gpt-oss-120b"
            settings = get_settings()
            self.api_key = settings.GROQ_API_KEY
            logger.info(f"Model name: {model_name}")
            await self._emit("llm_request", f"Consultando modelo: {model_name}", model=model_name)

            # --- Phase 1: non-streaming call so tool_calls arrive complete ---
            first_response = await litellm.acompletion(
                model=model_name,
                messages=messages,
                api_key=self.api_key,
                tools=tools if tools else None,
                stream=False
            )

            first_msg = first_response.choices[0].message
            tool_calls = getattr(first_msg, 'tool_calls', None) or []

            if tool_calls:
                # Append assistant turn (with tool_calls) to history
                assistant_turn: Dict[str, Any] = {
                    "role": "assistant",
                    "content": first_msg.content or "",
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": "function",
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments,
                            },
                        }
                        for tc in tool_calls
                    ],
                }
                messages.append(assistant_turn)

                # Execute each tool and append results
                for tc in tool_calls:
                    func_name = tc.function.name
                    func_args = tc.function.arguments
                    logger.info(f"Tool call: {func_name}  args={func_args}")

                    tool_entry = next((t for t in self._tools if t.get('name') == func_name), None)
                    if tool_entry and tool_entry.get('handler'):
                        try:
                            args = json.loads(func_args) if func_args else {}
                            await self._emit("tool_call", f"Ejecutando: {func_name}", tool_name=func_name, tool_args=args)
                            result = await self._execute_tool(tool_entry['handler'], args)
                            await self._emit("tool_result", f"Completado: {func_name}", tool_name=func_name, result=str(result)[:300])
                            tool_content = str(result)
                        except Exception as e:
                            logger.error(f"Error executing tool {func_name}: {e}")
                            await self._emit("tool_error", f"Error en herramienta: {func_name}", tool_name=func_name, error=str(e))
                            tool_content = f"Error: {str(e)}"

                        messages.append({
                            "role": "tool",
                            "tool_call_id": tc.id,
                            "content": tool_content,
                        })
                    else:
                        logger.error(f"Tool not found: {func_name}. Available: {[t.get('name') for t in self._tools]}")
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tc.id,
                            "content": f"Error: tool '{func_name}' not found",
                        })

                # --- Phase 2: streaming call with tool results in context ---
                await self._emit("generating", "Generando respuesta...")
                final_response = await litellm.acompletion(
                    model=model_name,
                    messages=messages,
                    api_key=self.api_key,
                    stream=True,
                )
                async for chunk in final_response:
                    if chunk.choices and chunk.choices[0].delta:
                        delta = chunk.choices[0].delta
                        if hasattr(delta, 'content') and delta.content:
                            yield delta.content

            else:
                # No tool calls — stream the content from the first response directly
                await self._emit("generating", "Generando respuesta...")
                content = first_msg.content or ""
                if content:
                    yield content

        except Exception as e:
            logger.error(f"Error in chat stream: {e}")
            yield f"\n\nError: {str(e)}"
        finally:
            # Restore original callback
            self.step_callback = original_callback

    async def _execute_tool(self, handler: Callable, args: Dict[str, Any]) -> Any:
        """Execute a tool function."""
        if asyncio.iscoroutinefunction(handler):
            return await handler(**args)
        else:
            return handler(**args)

    async def _fallback_stream(
        self,
        message: str,
        system_prompt: str,
        metadata: Dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        """Fallback streaming when no API key."""
        logger.info("Using fallback chat mode (no API key)")

        yield "\n\n[Error: No hay API key configurada. "
        yield "Configure la API key del proveedor en la base de datos (mia.api_keys) o en variables de entorno.]"

    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get list of available tools."""
        return self._tools


# Global agent instance
_adk_agent: Optional[GoogleADKAgent] = None


async def get_adk_agent() -> GoogleADKAgent:
    """Get or create global ADK agent instance."""
    global _adk_agent

    if _adk_agent is None:
        _adk_agent = GoogleADKAgent()
        await _adk_agent.initialize()

    return _adk_agent


async def reload_adk_agent() -> GoogleADKAgent:
    """Reload ADK agent with fresh skills."""
    global _adk_agent

    from src.backend.skills.loader import reload_skills
    reload_skills()

    _adk_agent = None
    return await get_adk_agent()
