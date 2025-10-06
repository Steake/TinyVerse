# WebSocket Integration Guide

## Overview

The TinyVerse backend provides real-time updates via WebSocket connections. This allows the frontend to receive simulation events, state changes, and agent actions in real-time without polling.

## Connection

### Backend WebSocket Endpoint

The WebSocket server is available at:
- **Development**: `ws://localhost:8000/ws`
- **Production**: `wss://your-domain.com/ws`

### Frontend WebSocket Client

A pre-configured WebSocket client is available for use in the frontend:

```typescript
import { wsClient } from '$lib/api/client';

// Connect to the WebSocket server
await wsClient.connect();

// Listen for events
wsClient.on((event) => {
  console.log('Received event:', event);
  
  switch (event.type) {
    case 'state':
      // Handle simulation state update
      updateSimulationState(event.data);
      break;
    case 'event':
      // Handle simulation event (agent action, interaction, etc.)
      logSimulationEvent(event.data);
      break;
    case 'error':
      // Handle error
      console.error('WebSocket error:', event.message);
      break;
  }
});

// Disconnect when done
wsClient.disconnect();
```

## Event Types

### State Events

Sent periodically to update the current simulation state.

```json
{
  "type": "state",
  "data": {
    "is_running": true,
    "current_step": 10,
    "agents_count": 3,
    "world_name": "TinyVerse Simulation"
  }
}
```

### Simulation Events

Sent when agents perform actions or interactions occur.

```json
{
  "type": "event",
  "data": {
    "timestamp": "2025-01-01T12:00:00Z",
    "agent_id": "agent-123",
    "agent_name": "Alice",
    "action_type": "action",
    "content": "Alice is thinking about the problem...",
    "metadata": {
      "location": "office",
      "step": 10
    }
  }
}
```

### Error Events

Sent when an error occurs.

```json
{
  "type": "error",
  "message": "Failed to process simulation step"
}
```

### Pong Events

Response to ping messages (keep-alive).

```json
{
  "type": "pong"
}
```

## Client Commands

### Ping

Send a ping to keep the connection alive:

```typescript
wsClient.ping();
```

## Advanced Usage

### Custom Event Handlers

You can add multiple event handlers:

```typescript
const handler1 = (event) => {
  // Handle state updates
  if (event.type === 'state') {
    updateUI(event.data);
  }
};

const handler2 = (event) => {
  // Log all events
  console.log('[WebSocket]', event);
};

wsClient.on(handler1);
wsClient.on(handler2);

// Remove a handler when no longer needed
wsClient.off(handler1);
```

### Connection Status

Check if the WebSocket is connected:

```typescript
if (wsClient.isConnected()) {
  console.log('WebSocket is connected');
} else {
  console.log('WebSocket is disconnected');
}
```

### Reconnection

The WebSocket client automatically attempts to reconnect if the connection is lost. It uses exponential backoff with a maximum of 5 attempts.

## Example: Real-time Simulation Monitoring

```typescript
import { wsClient } from '$lib/api/client';
import { writable } from 'svelte/store';

// Create a store for simulation state
const simulationState = writable({
  is_running: false,
  current_step: 0,
  agents_count: 0,
  world_name: ''
});

// Create a store for simulation events
const simulationEvents = writable([]);

// Connect and listen for updates
async function startMonitoring() {
  await wsClient.connect();
  
  wsClient.on((event) => {
    if (event.type === 'state') {
      simulationState.set(event.data);
    } else if (event.type === 'event') {
      simulationEvents.update(events => [event.data, ...events].slice(0, 100));
    }
  });
}

// Stop monitoring
function stopMonitoring() {
  wsClient.disconnect();
}

// In your Svelte component
onMount(() => {
  startMonitoring();
  return () => stopMonitoring();
});
```

## Environment Configuration

Configure the WebSocket URL in your `.env` file:

```bash
# Frontend (.env)
VITE_WS_BASE_URL=ws://localhost:8000/ws

# Production
VITE_WS_BASE_URL=wss://api.tinyverse.example.com/ws
```

## Backend Implementation

The WebSocket endpoint is implemented in `backend/app/api/websocket.py`:

- Accepts WebSocket connections at `/ws`
- Broadcasts simulation state updates every second
- Handles client ping/pong for keep-alive
- Manages multiple concurrent connections
- Automatically cleans up on disconnect

## Broadcasting Events

Backend services can broadcast events to all connected clients:

```python
from app.api.websocket import broadcast_simulation_event

# Broadcast an event to all clients
await broadcast_simulation_event({
    "timestamp": datetime.utcnow(),
    "agent_id": "agent-123",
    "agent_name": "Alice",
    "action_type": "action",
    "content": "Alice performed an action"
})
```

## Troubleshooting

### Connection Refused

- Ensure the backend server is running
- Check that the WebSocket URL is correct
- Verify CORS settings allow WebSocket connections

### Connection Drops

- The client will automatically attempt to reconnect
- Check network stability
- Ensure the backend server is not restarting

### No Events Received

- Verify the simulation is running
- Check that agents exist in the simulation
- Review backend logs for errors

## Best Practices

1. **Connect on mount, disconnect on unmount**: Always clean up WebSocket connections
2. **Handle all event types**: Implement handlers for state, event, and error types
3. **Limit stored events**: Keep a maximum number of recent events in memory
4. **Show connection status**: Display WebSocket connection status to users
5. **Graceful degradation**: Handle scenarios where WebSocket is unavailable

## Security Considerations

- Use `wss://` (WebSocket Secure) in production
- Implement authentication/authorization if needed
- Validate all incoming messages
- Rate limit connections to prevent abuse

---

*Last Updated: 2025*
