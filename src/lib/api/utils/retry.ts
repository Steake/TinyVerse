import { ApiError } from '../errors/ApiError';

export interface RetryConfig {
  attempts: number;
  delay: number;
  shouldRetry: (error: Error) => boolean;
}

export const defaultRetryConfig: RetryConfig = {
  attempts: 3,
  delay: 1000,
  shouldRetry: (error: Error) => {
    if (error instanceof ApiError) {
      return error.code === 'NETWORK_ERROR' || 
             (!!error.status && error.status >= 500);
    }
    return false;
  }
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...defaultRetryConfig, ...config };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryConfig.attempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      if (!retryConfig.shouldRetry(error) || attempt === retryConfig.attempts) {
        throw error;
      }

      await new Promise(resolve => 
        setTimeout(resolve, retryConfig.delay * Math.pow(2, attempt))
      );
    }
  }

  throw lastError;
}