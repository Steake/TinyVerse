import type { Agent, Location, Connection, SimulationLog } from '../stores/types';

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  filter?: Record<string, any>;
  [key: string]: string | number | boolean | undefined | Record<string, any>;
}

export interface SimulationAction {
  type: 'MOVE' | 'TALK' | 'INTERACT';
  agentId: string;
  targetId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

export interface LogFilters {
  agentId?: string;
  action?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  limit?: number;
  offset?: number;
}