/**
 * WebSocket service for real-time simulation updates
 */

import { agentStore } from '../stores/agents';
import { worldStore } from '../stores/world';
import { toastStore } from '../stores/toast';

export type WebSocketEvent = {
  type: string;
  data: any;
  timestamp: string;
};

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private url: string;

  constructor(url: string = 'ws://localhost:8000/ws') {
    this.url = url;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        toastStore.success('Connected to simulation server');
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketEvent = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      toastStore.error('Failed to connect to simulation server');
    }
  }

  private handleMessage(message: WebSocketEvent): void {
    console.log('WebSocket message:', message);

    switch (message.type) {
      case 'agent_created':
      case 'agent_updated':
      case 'agent_deleted':
        // Refresh agents from backend
        agentStore.fetchAgents();
        break;

      case 'location_created':
      case 'location_updated':
      case 'location_deleted':
        // Refresh locations from backend
        worldStore.fetchLocations();
        break;

      case 'connection_created':
      case 'connection_deleted':
        // Refresh connections from backend
        worldStore.fetchConnections();
        break;

      case 'simulation_step':
        // Refresh simulation state
        worldStore.fetchSimulationState();
        toastStore.info(`Simulation step: ${message.data.step}`);
        break;

      case 'simulation_started':
        toastStore.success('Simulation started');
        break;

      case 'simulation_paused':
        toastStore.info('Simulation paused');
        break;

      case 'simulation_stopped':
        toastStore.warning('Simulation stopped');
        break;

      case 'state':
        worldStore.update((current) => ({ ...current, simulationState: message.data ?? null }));
        break;

      case 'error':
        toastStore.error(message.data.message || 'Simulation error occurred');
        break;

      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      toastStore.error('Lost connection to simulation server');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(type: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const wsService = new WebSocketService();
