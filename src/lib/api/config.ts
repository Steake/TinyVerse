export interface ApiConfiguration {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers?: Record<string, string>;
}

export const DEFAULT_CONFIG: ApiConfiguration = {
  baseUrl: 'http://localhost:5000/api/', // Updated to point to our Flask API on the new port
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
