// re-export the api client
export { api } from './client';

// re-export the websocket client
export { wsClient, WebSocketClient } from './websocket';
export type { SimulationEvent, WebSocketState } from './websocket';

// re-export configuration
export { API_BASE_URL, WS_BASE_URL } from './config';
