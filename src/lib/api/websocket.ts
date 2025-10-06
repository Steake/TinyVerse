/**
 * WebSocket client for real-time simulation updates.
 * 
 * This module provides WebSocket connectivity to the backend for receiving
 * real-time simulation events and updates.
 */

import { WS_BASE_URL } from './config';

export type SimulationEvent = {
  type: 'agent_action' | 'simulation_step' | 'simulation_state' | 'agent_created' | 'agent_deleted';
  timestamp: string;
  data: any;
};

export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'error';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(event: SimulationEvent) => void>> = new Map();
  private stateListeners: Set<(state: WebSocketState) => void> = new Set();
  private state: WebSocketState = 'disconnected';

  constructor(url?: string) {
    this.url = url || WS_BASE_URL;
  }

  /**
   * Connect to the WebSocket server.
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.setState('connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.setState('connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: SimulationEvent = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.setState('error');
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.setState('disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.setState('error');
    }
  }

  /**
   * Disconnect from the WebSocket server.
   */
  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setState('disconnected');
  }

  /**
   * Subscribe to events of a specific type.
   */
  on(eventType: string, callback: (event: SimulationEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Subscribe to connection state changes.
   */
  onStateChange(callback: (state: WebSocketState) => void): () => void {
    this.stateListeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.stateListeners.delete(callback);
    };
  }

  /**
   * Send a message to the server.
   */
  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  /**
   * Get current connection state.
   */
  getState(): WebSocketState {
    return this.state;
  }

  private handleMessage(event: SimulationEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }

    // Also notify wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in wildcard listener:', error);
        }
      });
    }
  }

  private setState(state: WebSocketState): void {
    this.state = state;
    this.stateListeners.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`Attempting to reconnect in ${delay}ms...`);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
}

// Global WebSocket client instance
export const wsClient = new WebSocketClient();
