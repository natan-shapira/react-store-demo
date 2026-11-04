import { ApiError } from "./ApiError";

const MAX_RETRIES = 2;

export function shouldRetry(failureCount: number, error: unknown): boolean {
  // Only network errors and 5xx can succeed on a second attempt; 4xx and invalid response bodies will fail again
  if (error instanceof ApiError && error.status < 500) return false;
  return failureCount < MAX_RETRIES;
}
