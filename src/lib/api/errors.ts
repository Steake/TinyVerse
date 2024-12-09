export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(response: Response, details?: Record<string, any>): ApiError {
    return new ApiError(
      `HTTP_${response.status}`,
      response.statusText,
      response.status,
      details
    );
  }

  static networkError(error: Error): ApiError {
    return new ApiError(
      'NETWORK_ERROR',
      'Network request failed',
      undefined,
      { originalError: error.message }
    );
  }

  static timeoutError(timeout: number): ApiError {
    return new ApiError(
      'TIMEOUT',
      `Request timed out after ${timeout}ms`,
      undefined,
      { timeout }
    );
  }
}