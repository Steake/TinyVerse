import type { ApiConfig, ApiResponse, QueryParams, SimulationAction, LogFilters } from './types';
import type { Agent, Location, SimulationLog } from '../stores/types';
import { ApiError } from './errors';
import { createConfig } from './config';
import { buildUrl, delay, isNetworkError, withTimeout } from './utils';

export class ApiClient {
  private config: ApiConfig;

  constructor(config?: Partial<ApiConfig>) {
    this.config = createConfig(config);
  }

  private async request<T>(
    method: string,
    path: string,
    options: {
      params?: QueryParams;
      body?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { params, body, headers = {} } = options;
    const url = buildUrl(this.config.baseUrl, path, params);

    const requestInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    };

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const response = await withTimeout(
          fetch(url, requestInit),
          this.config.timeout
        );

        if (!response.ok) {
          throw ApiError.fromResponse(response);
        }

        const data = await response.json();
        return data as ApiResponse<T>;
      } catch (error: any) {
        lastError = error;

        if (!isNetworkError(error) || attempt === this.config.retryAttempts) {
          throw error instanceof ApiError ? error : ApiError.networkError(error);
        }

        await delay(this.config.retryDelay * Math.pow(2, attempt));
      }
    }

    throw lastError;
  }

  // Agent endpoints
  async getAgents(params?: QueryParams): Promise<ApiResponse<Agent[]>> {
    return this.request<Agent[]>('GET', '/agents', { params });
  }

  async getAgent(id: string): Promise<ApiResponse<Agent>> {
    return this.request<Agent>('GET', `/agents/${id}`);
  }

  async createAgent(agent: Omit<Agent, 'id'>): Promise<ApiResponse<Agent>> {
    return this.request<Agent>('POST', '/agents', { body: agent });
  }

  async updateAgent(id: string, agent: Partial<Agent>): Promise<ApiResponse<Agent>> {
    return this.request<Agent>('PATCH', `/agents/${id}`, { body: agent });
  }

  async deleteAgent(id: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/agents/${id}`);
  }

  // Agent relationships
  async addRelationship(agentId: string, relationship: any): Promise<ApiResponse<Agent>> {
    return this.request<Agent>('POST', `/agents/${agentId}/relationships`, { body: relationship });
  }

  async removeRelationship(agentId: string, targetId: string): Promise<ApiResponse<Agent>> {
    return this.request<Agent>('DELETE', `/agents/${agentId}/relationships/${targetId}`);
  }

  // Agent bulk operations
  async importAgents(file: File): Promise<ApiResponse<Agent[]>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = buildUrl(this.config.baseUrl, '/agents/import');
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw ApiError.fromResponse(response);
    }
    
    return response.json();
  }

  async exportAgents(): Promise<Blob> {
    const url = buildUrl(this.config.baseUrl, '/agents/export');
    const response = await fetch(url);
    
    if (!response.ok) {
      throw ApiError.fromResponse(response);
    }
    
    return response.blob();
  }

  // Location endpoints
  async getLocations(params?: QueryParams): Promise<ApiResponse<Location[]>> {
    return this.request<Location[]>('GET', '/locations', { params });
  }

  async createLocation(location: Omit<Location, 'id'>): Promise<ApiResponse<Location>> {
    return this.request<Location>('POST', '/locations', { body: location });
  }

  async updateLocation(id: string, location: Partial<Location>): Promise<ApiResponse<Location>> {
    return this.request<Location>('PATCH', `/locations/${id}`, { body: location });
  }

  async deleteLocation(id: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/locations/${id}`);
  }

  // Connection endpoints
  async getConnections(params?: QueryParams): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('GET', '/world/connections', { params });
  }

  async createConnection(connection: any): Promise<ApiResponse<any>> {
    return this.request<any>('POST', '/world/connections', { body: connection });
  }

  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/world/connections/${id}`);
  }

  // Simulation endpoints
  async executeAction(action: SimulationAction): Promise<ApiResponse<SimulationLog>> {
    return this.request<SimulationLog>('POST', '/simulation/actions', { body: action });
  }

  async getLogs(filters?: LogFilters): Promise<ApiResponse<SimulationLog[]>> {
    return this.request<SimulationLog[]>('GET', '/simulation/logs', { params: filters as QueryParams });
  }

  async getSimulationStatus(): Promise<ApiResponse<{
    isRunning: boolean;
    currentTime: Date;
    speed: number;
  }>> {
    return this.request('GET', '/simulation/status');
  }

  async controlSimulation(action: 'start' | 'pause' | 'stop' | 'step', steps?: number): Promise<ApiResponse<void>> {
    return this.request<void>('POST', '/simulation/control', { 
      body: { action, steps } 
    });
  }

  // Story endpoints (placeholder - to be implemented with backend)
  story = {
    list: async (): Promise<ApiResponse<any[]>> => {
      return this.request<any[]>('GET', '/stories');
    },
    getStories: async (): Promise<ApiResponse<any[]>> => {
      return this.request<any[]>('GET', '/stories');
    },
    get: async (id: string): Promise<ApiResponse<any>> => {
      return this.request<any>('GET', `/stories/${id}`);
    },
    create: async (data: any): Promise<ApiResponse<any>> => {
      return this.request<any>('POST', '/stories', { body: data });
    },
    createStory: async (data: any): Promise<ApiResponse<any>> => {
      return this.request<any>('POST', '/stories', { body: data });
    },
    updateStory: async (id: string, data: any): Promise<ApiResponse<any>> => {
      return this.request<any>('PATCH', `/stories/${id}`, { body: data });
    },
    delete: async (id: string): Promise<ApiResponse<void>> => {
      return this.request<void>('DELETE', `/stories/${id}`);
    }
  };

  async getSimulationState(): Promise<ApiResponse<any>> {
    return this.request('GET', '/simulation/state');
  }

  // Utility methods
  setConfig(config: Partial<ApiConfig>): void {
    this.config = createConfig(config);
  }

  getConfig(): ApiConfig {
    return { ...this.config };
  }
}

export const api = new ApiClient();