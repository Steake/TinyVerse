import type { QueryParams } from '../types';
import { DEFAULT_CONFIG } from '../config';

export class BaseAPI {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = DEFAULT_CONFIG.baseUrl) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  protected async request<T>(
    method: string,
    path: string,
    options: {
      body?: any;
      params?: QueryParams;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const { body, params, headers = {} } = options;
    const url = new URL(path, this.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  protected get<T>(path: string, options?: Omit<Parameters<typeof this.request>[2], 'body'>): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  protected post<T>(path: string, body: any, options?: Omit<Parameters<typeof this.request>[2], 'body'>): Promise<T> {
    return this.request<T>('POST', path, { ...options, body });
  }

  protected put<T>(path: string, body: any, options?: Omit<Parameters<typeof this.request>[2], 'body'>): Promise<T> {
    return this.request<T>('PUT', path, { ...options, body });
  }

  protected patch<T>(path: string, body: any, options?: Omit<Parameters<typeof this.request>[2], 'body'>): Promise<T> {
    return this.request<T>('PATCH', path, { ...options, body });
  }

  protected delete(path: string, options?: Parameters<typeof this.request>[2]): Promise<void> {
    return this.request('DELETE', path, options);
  }
}
