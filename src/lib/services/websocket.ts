/**
 * WebSocket service for real-time simulation updates
 */

import { agentStore } from '../stores/agents';
import { worldStore } from '../stores/world';
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
        // Pull latest logs and project speech onto stage as bubbles
        this.fetchAndProjectLogs().catch((e) => {
          console.error('Failed to project logs to stage:', e);
        });
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
        // Optionally project logs periodically when state ticks in
        // Keep light to avoid spamming the API; only if simulation is running
        try {
          const running = Boolean(message?.data?.is_running);
          if (running) {
            this.fetchAndProjectLogs().catch(() => {});
          }
        } catch {
          // ignore
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
        const key = this.buildLogKey(log);
        if (this.hasSeen(key)) continue;

        const content: string = this.extractContent(log);
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
          this.markSeen(key);
          continue;
        }

        // Only treat dialogue-like entries as speech bubbles
        const kind = (log.action || log.action_type || '').toString().toUpperCase();
        const dialogueish = ['TALK', 'SAY', 'SPEAK', 'DIALOGUE', 'DIALOG', 'MESSAGE', 'CHAT', 'UTTER', 'UTTERANCE'];
        if (kind && !dialogueish.some(k => kind.includes(k))) {
          // Mark seen but skip bubble projection for non-dialogue events
          this.markSeen(key);
          continue;
        }

        // Resolve agent id
        let agentId: string | undefined = log.agentId || log.agent_id;
        if (!agentId) {
          const byName = (get(agentStore) || []).find((a: any) => a?.name && a.name === (log.agentName || log.agent_name));
          agentId = byName?.id;
        }
        if (!agentId) {
          // Cannot place bubble without an agent; mark seen and skip
          this.markSeen(key);
          continue;
        }

        // Ensure agent is known to the stage; place if missing
        const stage = get(stageStore) as any;
        const isActive = Array.isArray(stage?.activeAgents) && stage.activeAgents.includes(agentId);
        if (!isActive) {
          // Pick a random position within a central band to avoid (0,0)
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

        this.markSeen(key);
      }
    } finally {
      this.fetchingLogs = false;
    }
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
