from fastapi import WebSocket


class WebSocketManager:
    def __init__(self) -> None:
        self._connections: dict[str, WebSocket] = {}
        self._roles: dict[str, str] = {}

    async def connect(self, user_id: str, websocket: WebSocket, role: str | None = None) -> None:
        await websocket.accept()
        self._connections[user_id] = websocket
        if role:
            self._roles[user_id] = role

    def disconnect(self, user_id: str) -> None:
        self._connections.pop(user_id, None)
        self._roles.pop(user_id, None)

    async def broadcast(self, user_id: str, payload: dict) -> None:
        ws = self._connections.get(user_id)
        if ws is not None:
            await ws.send_json(payload)

    async def broadcast_to_role(self, role: str, payload: dict) -> None:
        for user_id, user_role in list(self._roles.items()):
            if user_role == role:
                await self.broadcast(user_id, payload)


ws_manager = WebSocketManager()
