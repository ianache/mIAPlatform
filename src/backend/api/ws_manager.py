"""In-memory WebSocket manager for per-session agent event broadcasting."""
from collections import defaultdict
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)


class AgentEventManager:
    def __init__(self):
        self._connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, session_code: str, ws: WebSocket) -> None:
        await ws.accept()
        self._connections[session_code].append(ws)
        logger.info(f"WS connected: session={session_code} total={len(self._connections[session_code])}")

    def disconnect(self, session_code: str, ws: WebSocket) -> None:
        conns = self._connections.get(session_code, [])
        if ws in conns:
            conns.remove(ws)
            logger.info(f"WS disconnected: session={session_code}")

    async def broadcast(self, session_code: str, event: dict) -> None:
        """Send event to all WebSocket clients subscribed to this session."""
        dead: list[WebSocket] = []
        for ws in list(self._connections.get(session_code, [])):
            try:
                await ws.send_json(event)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(session_code, ws)


# Singleton used across the app
event_manager = AgentEventManager()
