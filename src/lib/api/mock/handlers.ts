import { mockAgents, mockLocations, mockConnections, mockLogs } from './data';
import type { ApiResponse, ApiError, SimulationAction } from '../types';
import type { Agent, Location, Connection, SimulationLog } from '../../stores/types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate random failures
const shouldFail = (failureRate = 0.1) => Math.random() < failureRate;

const createError = (code: string, message: string): ApiError => ({
  code,
  message,
  details: { timestamp: new Date().toISOString() }
});

export const handlers = {
  // Agent handlers
  async getAgents(): Promise<ApiResponse<Agent[]>> {
    await delay(300);
    if (shouldFail()) {
      throw createError('FETCH_ERROR', 'Failed to fetch agents');
    }
    return { data: mockAgents };
  },

  async getAgent(id: string): Promise<ApiResponse<Agent>> {
    await delay(200);
    const agent = mockAgents.find(a => a.id === id);
    if (!agent) {
      throw createError('NOT_FOUND', 'Agent not found');
    }
    return { data: agent };
  },

  async createAgent(agent: Omit<Agent, 'id'>): Promise<ApiResponse<Agent>> {
    await delay(500);
    if (shouldFail()) {
      throw createError('CREATE_ERROR', 'Failed to create agent');
    }
    const newAgent = { ...agent, id: crypto.randomUUID() };
    mockAgents.push(newAgent);
    return { data: newAgent };
  },

  async updateAgent(id: string, agent: Partial<Agent>): Promise<ApiResponse<Agent>> {
    await delay(400);
    const index = mockAgents.findIndex(a => a.id === id);
    if (index === -1) {
      throw createError('NOT_FOUND', 'Agent not found');
    }
    mockAgents[index] = { ...mockAgents[index], ...agent };
    return { data: mockAgents[index] };
  },

  // Location handlers
  async getLocations(): Promise<ApiResponse<Location[]>> {
    await delay(300);
    return { data: mockLocations };
  },

  async createLocation(location: Omit<Location, 'id'>): Promise<ApiResponse<Location>> {
    await delay(400);
    const newLocation = { ...location, id: crypto.randomUUID() };
    mockLocations.push(newLocation);
    return { data: newLocation };
  },

  // Simulation handlers
  async executeAction(action: SimulationAction): Promise<ApiResponse<SimulationLog>> {
    await delay(200);
    if (shouldFail(0.05)) {
      throw createError('ACTION_ERROR', 'Failed to execute action');
    }
    
    const timestamp = action.timestamp instanceof Date
      ? action.timestamp.toISOString()
      : new Date(action.timestamp).toISOString();

    const log: SimulationLog = {
      id: crypto.randomUUID(),
      timestamp,
      agentId: action.agentId,
      action: action.type,
      content: JSON.stringify(action.data),
      metadata: {
        rawContent: action.data
      }
    };
    
    mockLogs.push(log);
    return { data: log };
  },

  async getLogs(filters?: {
    agentId?: string;
    action?: string;
    startTime?: Date;
    endTime?: Date;
  }): Promise<ApiResponse<SimulationLog[]>> {
    await delay(300);
    let filteredLogs = [...mockLogs];
    
    if (filters) {
      if (filters.agentId) {
        filteredLogs = filteredLogs.filter(log => log.agentId === filters.agentId);
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }
      if (filters.startTime) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() >= filters.startTime!.getTime());
      }
      if (filters.endTime) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() <= filters.endTime!.getTime());
      }
    }
    
    return { data: filteredLogs };
  }
};