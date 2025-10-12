/**
 * WebSocket service for real-time simulation updates
 */

import { agentStore } from '../stores/agents';
import { worldStore } from '../stores/world';
import { simulationStore } from '../stores/simulation';
import { toastStore } from '../stores/toast';
import { stageStore } from '../stores/stage';
import { api } from '../api';
import { get } from 'svelte/store';
import type { Interaction } from '../utils/mock-data/grand-stage';

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
  // Track processed logs to avoid duplicate bubbles
  private seenLogKeys: string[] = [];
  private fetchingLogs = false;
  
  // Message queue for throttled display
  private messageQueue: Array<{ log: any; key: string }> = [];
  private isProcessingQueue = false;
  private messageDelay = 800; // ms between messages

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

      this.ws.onmessage = async (event) => {
        try {
          const message: WebSocketEvent = JSON.parse(event.data);
          await this.handleMessage(message);
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

  private async handleMessage(message: WebSocketEvent): Promise<void> {
    console.log('WebSocket message:', message);

    switch (message.type) {
      case 'agent_created':
      case 'agent_updated':
      case 'agent_deleted':
        // Refresh agents from backend
        agentStore.fetchAgents();
        break;

      case 'agent_moved':
        // Update agent position on stage
        if (message.data?.agent_id && message.data?.position) {
          stageStore.updateAgentPosition(
            message.data.agent_id,
            message.data.position.x,
            message.data.position.y
          );
        }
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
        // Refresh simulation state and sync to simulationStore
        await worldStore.fetchSimulationState();
        // Sync worldStore.simulationState to simulationStore for consistent UI state
        const worldState = get(worldStore);
        if (worldState?.simulationState) {
          simulationStore.syncFromBackend(worldState.simulationState);
        }
        toastStore.info(`Simulation step: ${message.data.step}`);
        // Prefer dialogue WS events; keep logs fetch as fallback if no dialogue is emitted
        // this.fetchAndProjectLogs(); // commented out once backend reliably emits 'dialogue'
        break;

      case 'simulation_started':
        // Sync state on start to ensure UI reflects backend
        await worldStore.fetchSimulationState();
        const startState = get(worldStore);
        if (startState?.simulationState) {
          simulationStore.syncFromBackend(startState.simulationState);
        }
        toastStore.success('Simulation started');
        break;

      case 'simulation_paused':
        // Sync state on pause to ensure UI reflects backend
        await worldStore.fetchSimulationState();
        const pauseState = get(worldStore);
        if (pauseState?.simulationState) {
          simulationStore.syncFromBackend(pauseState.simulationState);
        }
        toastStore.info('Simulation paused');
        break;

      case 'simulation_stopped':
        toastStore.warning('Simulation stopped');
        break;

      case 'state':
        worldStore.update((current) => ({ ...current, simulationState: message.data ?? null }));
        break;

      case 'dialogue':
        // Direct dialogue push from backend: { entries: [...] }
        try {
          const entries = (message?.data?.entries ?? []) as any[];
          if (Array.isArray(entries) && entries.length > 0) {
            this.projectEntries(entries);
          }
        } catch (e) {
          console.error('Failed to handle dialogue event:', e);
        }
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
    // Clear any pending messages in queue
    this.messageQueue = [];
    this.isProcessingQueue = false;
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
  
  /**
   * Set the delay between speech bubble displays (in milliseconds).
   * Lower values = faster display, higher values = more readable.
   */
  setMessageDelay(delayMs: number): void {
    this.messageDelay = Math.max(100, Math.min(3000, delayMs));
  }
  
  /**
   * Get current queue size (useful for UI feedback).
   */
  getQueueSize(): number {
    return this.messageQueue.length;
  }

  /**
   * Fetch recent simulation logs and convert new TALK-like entries into
   * transient stage interactions (speech bubbles).
   */
  private async fetchAndProjectLogs(limit = 25): Promise<void> {
    if (this.fetchingLogs) return;
    this.fetchingLogs = true;
    try {
      const res = await api.getLogs({ limit });
      const logs: any[] = (res as any)?.data ?? [];
      if (!Array.isArray(logs) || logs.length === 0) return;

      // Process oldest-first so bubbles appear in chronological order
      const ordered = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      for (const log of ordered) {
        this.projectEntries([log]);
      }
    } finally {
      this.fetchingLogs = false;
    }
  }

  private projectEntries(entries: any[]) {
    const ordered = [...entries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Add entries to queue for throttled display
    for (const log of ordered) {
      const key = this.buildLogKey(log);
      if (this.hasSeen(key)) continue;
      
      this.messageQueue.push({ log, key });
      this.markSeen(key);
    }
    
    // Start processing queue if not already running
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }
  
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;
    
    while (this.messageQueue.length > 0) {
      const item = this.messageQueue.shift();
      if (!item) break;
      
      await this.displayMessage(item.log, item.key);
      
      // Add delay between messages for staggered effect
      if (this.messageQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.messageDelay));
      }
    }
    
    this.isProcessingQueue = false;
  }
  
  private async displayMessage(log: any, key: string): Promise<void> {
    const content: string = this.extractContent(log);
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return;
    }

    // Resolve agent id
    let agentId: string | undefined = (log.agentId || log.agent_id) as string | undefined;
    if (!agentId) {
      const byName = (get(agentStore) || []).find((a: any) => a?.name && a.name === (log.agentName || log.agent_name));
      agentId = byName?.id;
    }
    if (!agentId) {
      return;
    }

    const stage = get(stageStore) as any;
    const isActive = Array.isArray(stage?.activeAgents) && stage.activeAgents.includes(agentId);
    if (!isActive) {
      const x = 100 + Math.random() * 600;
      const y = 120 + Math.random() * 360;
      stageStore.addAgent(agentId, { x, y });
    }

    const interaction: Interaction = {
      id: this.makeInteractionId(agentId, key),
      type: 'conversation',
      participants: [agentId],
      content: content.trim(),
      startTime: new Date(log.timestamp || Date.now()),
      duration: this.estimateDurationMs(content),
      mood: 'neutral'
    };
    stageStore.addInteraction(interaction);
  }

  private extractContent(log: any): string {
    // Backend may return varying shapes; normalize text content
    return (
      log?.content ||
      log?.data?.content ||
      log?.data?.text ||
      log?.metadata?.rendering ||
      ''
    );
  }

  private estimateDurationMs(text: string): number {
    const len = Math.max(1, text.trim().length);
    const base = 2200; // 2.2s base
    const perChar = 45; // ~45ms per character
    const est = base + perChar * Math.min(140, len);
    return Math.max(1600, Math.min(8000, est));
  }

  private buildLogKey(log: any): string {
    const ts = new Date(log?.timestamp || Date.now()).toISOString();
    const who = log?.agentId || log?.agent_id || log?.agentName || log?.agent_name || 'unknown';
    const act = (log?.action || log?.action_type || '').toString();
    const content = this.extractContent(log)?.slice(0, 120) || '';
    return `${ts}|${who}|${act}|${content}`;
  }

  private hasSeen(key: string): boolean {
    return this.seenLogKeys.includes(key);
  }

  private markSeen(key: string): void {
    this.seenLogKeys.push(key);
    // Bound the memory footprint
    const MAX = 500;
    if (this.seenLogKeys.length > MAX) {
      this.seenLogKeys.splice(0, this.seenLogKeys.length - Math.floor(MAX * 0.7));
    }
  }

  private makeInteractionId(agentId: string, key: string): string {
    // Generate a stable-ish id from inputs
    const hash = Array.from(key).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
    return `ws-int-${agentId}-${Math.abs(hash)}`;
  }
}

// Singleton instance
export const wsService = new WebSocketService();
