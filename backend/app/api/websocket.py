"""
WebSocket API endpoints for real-time simulation updates.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Set
import json
import asyncio


router = APIRouter(tags=["websocket"])


# Store active WebSocket connections
active_connections: Set[WebSocket] = set()


class ConnectionManager:
    """Manages WebSocket connections."""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.add(websocket)
        
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connection_established",
            "timestamp": asyncio.get_event_loop().time(),
            "data": {"message": "Connected to TinyVerse simulation"}
        })
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        self.active_connections.discard(websocket)
    
    async def broadcast(self, message: dict):
        """Broadcast a message to all connected clients."""
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending message to client: {e}")
                disconnected.add(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
    
    async def send_to(self, websocket: WebSocket, message: dict):
        """Send a message to a specific client."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending message to client: {e}")
            self.disconnect(websocket)


# Global connection manager
manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time simulation updates.
    
    Clients can connect to receive real-time updates about:
    - Agent actions and interactions
    - Simulation state changes
    - New agents or locations created
    - Simulation step completions
    """
    await manager.connect(websocket)
    
    try:
        while True:
            # Receive messages from client
            data = await websocket.receive_text()
            
            # Parse and handle client messages
            try:
                message = json.loads(data)
                
                # Echo back for now (can be extended for client commands)
                await manager.send_to(websocket, {
                    "type": "echo",
                    "timestamp": asyncio.get_event_loop().time(),
                    "data": message
                })
            except json.JSONDecodeError:
                await manager.send_to(websocket, {
                    "type": "error",
                    "timestamp": asyncio.get_event_loop().time(),
                    "data": {"message": "Invalid JSON"}
                })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Client disconnected")


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
    await manager.broadcast(message)
