export interface ResponseConfig<T> {
  response: Response;
  data: T;
}

export class ResponseInterceptor {
  private static instance: ResponseInterceptor;
  private interceptors: ((config: ResponseConfig<any>) => Promise<ResponseConfig<any>>)[] = [];

  private constructor() {}

  static getInstance(): ResponseInterceptor {
    if (!ResponseInterceptor.instance) {
      ResponseInterceptor.instance = new ResponseInterceptor();
    }
    return ResponseInterceptor.instance;
  }

  addInterceptor(interceptor: (config: ResponseConfig<any>) => Promise<ResponseConfig<any>>) {
    this.interceptors.push(interceptor);
  }

  async intercept<T>(config: ResponseConfig<T>): Promise<ResponseConfig<T>> {
    let currentConfig = { ...config };
    
    for (const interceptor of this.interceptors) {
      currentConfig = await interceptor(currentConfig);
    }
    
    return currentConfig;
  }
}