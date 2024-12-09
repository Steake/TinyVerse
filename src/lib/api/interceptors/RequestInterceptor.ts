import type { QueryParams } from '../types';

export interface RequestConfig {
  method: string;
  path: string;
  body?: any;
  params?: QueryParams;
  headers?: Record<string, string>;
  timeout?: number;
}

export class RequestInterceptor {
  private static instance: RequestInterceptor;
  private interceptors: ((config: RequestConfig) => Promise<RequestConfig>)[] = [];

  private constructor() {}

  static getInstance(): RequestInterceptor {
    if (!RequestInterceptor.instance) {
      RequestInterceptor.instance = new RequestInterceptor();
    }
    return RequestInterceptor.instance;
  }

  addInterceptor(interceptor: (config: RequestConfig) => Promise<RequestConfig>) {
    this.interceptors.push(interceptor);
  }

  async intercept(config: RequestConfig): Promise<RequestConfig> {
    let currentConfig = { ...config };
    
    for (const interceptor of this.interceptors) {
      currentConfig = await interceptor(currentConfig);
    }
    
    return currentConfig;
  }
}