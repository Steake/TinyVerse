export interface ApiConfiguration {
  baseUrl: string;
  wsUrl: string;  // WebSocket URL for real-time updates
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers?: Record<string, string>;
}

// API base URL from environment variable or default to TinyTroupe backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws';

export const DEFAULT_CONFIG: ApiConfiguration = {
  baseUrl: API_BASE_URL,
  wsUrl: WS_BASE_URL,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json'
  }
};

export function createConfig(overrides?: Partial<ApiConfiguration>): ApiConfiguration {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    headers: {
      ...DEFAULT_CONFIG.headers,
      ...overrides?.headers
    }
  };
}
