export interface ApiConfiguration {
  baseUrl: string;
  wsUrl: string;  // WebSocket URL for real-time updates
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers?: Record<string, string>;
}

export const DEFAULT_CONFIG: ApiConfiguration = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  wsUrl: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws',
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
