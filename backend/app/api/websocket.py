"""
WebSocket endpoint for real-time simulation updates.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import asyncio
import json
from app.services import adapter


router = APIRouter(tags=["websocket"])


class ConnectionManager:
    """Manages WebSocket connections."""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send a message to a specific client."""
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        """Broadcast a message to all connected clients."""
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error broadcasting to client: {e}")
    
    async def broadcast_json(self, message: dict):
        """Broadcast a JSON message to all connected clients."""
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error broadcasting to client: {e}")


# Create global connection manager
manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time simulation updates.
    
    Clients can connect to receive:
    - Simulation state changes
    - Agent actions and interactions
    - Simulation events
    """
    await manager.connect(websocket)
    
    try:
        # Send initial state
        state = adapter.get_simulation_state()
        await websocket.send_json({
            "type": "state",
            "data": state
        })
        
        # Keep connection alive and send updates
        while True:
            try:
                # Wait for client messages (could be commands)
                data = await asyncio.wait_for(websocket.receive_text(), timeout=1.0)
                message = json.loads(data)
                
                # Handle client commands
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                
            except asyncio.TimeoutError:
                # Send periodic state updates
                state = adapter.get_simulation_state()
                await websocket.send_json({
                    "type": "state",
                    "data": state
                })
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON"
                })
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)


async def broadcast_simulation_event(event_type: str, data: dict):
    """
    Broadcast a simulation event to all connected clients.
    
    Args:
        event_type: Type of event (agent_action, simulation_step, etc.)
        data: Event data
    """
    message = {
        "type": event_type,
        "timestamp": asyncio.get_event_loop().time(),
        "data": data
    }
    await manager.broadcast_json(message)
