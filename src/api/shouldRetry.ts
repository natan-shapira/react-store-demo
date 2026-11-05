import { ApiError } from "./ApiError";

const MAX_RETRIES = 2;

// Only network errors and 5xx can succeed on a second attempt; 4xx and invalid response bodies will fail again
export const isRetryableError = (error: unknown) =>
  !(error instanceof ApiError && error.status < 500);

export function shouldRetry(failureCount: number, error: unknown): boolean {
  return isRetryableError(error) && failureCount < MAX_RETRIES;
}
