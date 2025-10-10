import type {
  ApiConfig,
  ApiResponse,
  QueryParams,
  SimulationAction,
  LogFilters,
  SimulationLogDTO,
  SimulationControlResponseDTO,
  SimulationStateDTO,
  AutofillRequestPayload,
  AutofillResponsePayload,
  FacultyAssignPayload,
  FacultyUpdatePayload,
  ToolAssignPayload,
  ToolUpdatePayload,
  EpisodicMemoryParams,
  SemanticMemoryParams,
  SemanticMemoryQueryPayload,
  SemanticMemorySummaryPayload,
  SemanticMemoryIngestPayload,
  ScenarioAutofillRequestPayload,
  ScenarioAutofillResponsePayload,
} from './types';
import type {
  Agent,
  Location,
  MentalFaculty,
  MentalFacultyDefinition,
  ToolDefinition,
  ToolInstance,
  MemoryEntry
} from '../stores/types';
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
      timeoutMs?: number;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { params, body, headers = {}, timeoutMs } = options;
    const url = buildUrl(this.config.baseUrl, path, params);
    const timeout = timeoutMs ?? this.config.timeout;

    const requestInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    };

    let lastError: ApiError | null = null;
    
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      const attemptStartedAt = Date.now();
      try {
        const response = await withTimeout(
          fetch(url, requestInit),
          timeout
        );

        if (!response.ok) {
          throw ApiError.fromResponse(response);
        }

        const rawBody = await response.text();

        if (!rawBody) {
          return { data: undefined as T };
        }

        let payload: unknown;
        try {
          payload = JSON.parse(rawBody);
        } catch (parseError) {
          console.warn('Received non-JSON response', parseError);
          return { data: rawBody as T };
        }

        if (payload && typeof payload === 'object' && 'data' in payload) {
          return payload as ApiResponse<T>;
        }

        return { data: payload as T };
      } catch (error: any) {
        const durationMs = Date.now() - attemptStartedAt;
        const details = {
          url,
          method,
          durationMs,
          timeoutMs: timeout,
          attempt
        };

        let normalizedError: ApiError;

        if (error instanceof ApiError) {
          normalizedError = new ApiError(
            error.code,
            error.message,
            error.status,
            { ...(error.details ?? {}), ...details }
          );
        } else if (typeof error?.message === 'string' && error.message.includes('Timeout')) {
          normalizedError = ApiError.timeoutError(timeout, {
            ...details,
            originalError: error.message
          });
        } else {
          normalizedError = ApiError.networkError(error, details);
        }

        lastError = normalizedError;

        const retryable =
          (normalizedError.code === 'NETWORK_ERROR' || normalizedError.code === 'TIMEOUT') &&
          attempt < this.config.retryAttempts;

        if (!retryable) {
          throw normalizedError;
        }

        await delay(this.config.retryDelay * Math.pow(2, attempt));
      }
    }

    throw lastError ?? ApiError.networkError(new Error('Network request failed'));
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

  async autofill(payload: AutofillRequestPayload): Promise<ApiResponse<AutofillResponsePayload>> {
    const timeoutMs = this.config.autofillTimeoutMs ?? Math.max(this.config.timeout, 120000);
    return this.request<AutofillResponsePayload>('POST', '/autofill', { body: payload, timeoutMs });
  }

  async autofillScenario(payload: ScenarioAutofillRequestPayload): Promise<ApiResponse<ScenarioAutofillResponsePayload>> {
    const timeoutMs = this.config.autofillTimeoutMs ?? Math.max(this.config.timeout, 120000);
    return this.request<ScenarioAutofillResponsePayload>('POST', '/autofill_scenario', { body: payload, timeoutMs });
  }

  async getFacultyDefinitions(): Promise<ApiResponse<MentalFacultyDefinition[]>> {
    return this.request<MentalFacultyDefinition[]>('GET', '/agents/faculties/definitions');
  }

  async getAgentFaculties(agentId: string): Promise<ApiResponse<MentalFaculty[]>> {
    return this.request<MentalFaculty[]>('GET', `/agents/${agentId}/faculties`);
  }

  async assignFaculty(agentId: string, payload: FacultyAssignPayload): Promise<ApiResponse<MentalFaculty>> {
    return this.request<MentalFaculty>('POST', `/agents/${agentId}/faculties`, { body: payload });
  }

  async updateFaculty(agentId: string, facultyId: string, payload: FacultyUpdatePayload): Promise<ApiResponse<MentalFaculty>> {
    return this.request<MentalFaculty>('PATCH', `/agents/${agentId}/faculties/${facultyId}`, { body: payload });
  }

  async deleteFaculty(agentId: string, facultyId: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/agents/${agentId}/faculties/${facultyId}`);
  }

  async getToolDefinitions(): Promise<ApiResponse<ToolDefinition[]>> {
    return this.request<ToolDefinition[]>('GET', '/agents/tools/definitions');
  }

  async getAgentTools(agentId: string): Promise<ApiResponse<ToolInstance[]>> {
    return this.request<ToolInstance[]>('GET', `/agents/${agentId}/tools`);
  }

  async assignTool(agentId: string, payload: ToolAssignPayload): Promise<ApiResponse<ToolInstance>> {
    return this.request<ToolInstance>('POST', `/agents/${agentId}/tools`, { body: payload });
  }

  async updateTool(agentId: string, toolId: string, payload: ToolUpdatePayload): Promise<ApiResponse<ToolInstance>> {
    return this.request<ToolInstance>('PATCH', `/agents/${agentId}/tools/${toolId}`, { body: payload });
  }

  async deleteTool(agentId: string, toolId: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/agents/${agentId}/tools/${toolId}`);
  }

  async getEpisodicMemory(agentId: string, params: EpisodicMemoryParams = {}): Promise<ApiResponse<MemoryEntry[]>> {
    const query: QueryParams = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query[key] = value as any;
      }
    });
    return this.request<MemoryEntry[]>('GET', `/agents/${agentId}/memory/episodic`, { params: query });
  }

  async clearEpisodicMemory(agentId: string, payload: { max_prefix?: number; max_suffix?: number } = {}): Promise<ApiResponse<void>> {
    return this.request<void>('POST', `/agents/${agentId}/memory/episodic/clear`, { body: payload });
  }

  async getSemanticMemory(agentId: string, params: SemanticMemoryParams = {}): Promise<ApiResponse<MemoryEntry[]>> {
    const query: QueryParams = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query[key] = value as any;
      }
    });
    return this.request<MemoryEntry[]>('GET', `/agents/${agentId}/memory/semantic`, { params: query });
  }

  async querySemanticMemory(agentId: string, payload: SemanticMemoryQueryPayload): Promise<ApiResponse<{ matches: unknown[] }>> {
    return this.request<{ matches: unknown[] }>('POST', `/agents/${agentId}/memory/semantic/query`, { body: payload });
  }

  async summarizeSemanticMemory(agentId: string, payload: SemanticMemorySummaryPayload): Promise<ApiResponse<{ summary: string }>> {
    return this.request<{ summary: string }>('POST', `/agents/${agentId}/memory/semantic/summarize`, { body: payload });
  }

  async ingestSemanticMemory(agentId: string, payload: SemanticMemoryIngestPayload): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('POST', `/agents/${agentId}/memory/semantic/ingest`, { body: payload });
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
  async executeAction(action: SimulationAction): Promise<ApiResponse<SimulationLogDTO>> {
    return this.request<SimulationLogDTO>('POST', '/simulation/action', { body: action });
  }

  async getLogs(filters?: LogFilters): Promise<ApiResponse<SimulationLogDTO[]>> {
    return this.request<SimulationLogDTO[]>('GET', '/simulation/logs', { params: filters as QueryParams });
  }

  async controlSimulation(
    action: 'start' | 'pause' | 'stop' | 'step',
    steps?: number
  ): Promise<ApiResponse<SimulationControlResponseDTO>> {
    return this.request<SimulationControlResponseDTO>('POST', '/simulation/control', {
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

  async getSimulationState(): Promise<ApiResponse<SimulationStateDTO>> {
    return this.request<SimulationStateDTO>('GET', '/simulation/state');
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