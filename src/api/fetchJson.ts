import { type z } from "zod";
import { ApiError, NETWORK_ERROR_STATUS } from "./ApiError";
import { fetchWithAuth } from "./fetchWithAuth";

const NETWORK_ERROR_MESSAGE = "Could not reach the server. Check your connection and try again.";

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === "AbortError";

const getServerMessage = (data: unknown) =>
  data && typeof data === "object" && "message" in data && typeof data.message === "string"
    ? data.message
    : undefined;

export async function fetchJson<T>(
  url: string,
  schema: z.ZodType<T>,
  errorMessage: string,
  options?: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetchWithAuth(url, options);
  } catch (error) {
    // A cancelled request is not a failure, so callers must still be able to recognise it
    if (isAbortError(error)) throw error;
    // fetch rejects with a browser-specific TypeError ("Failed to fetch") that is not fit to show to users
    throw new ApiError(NETWORK_ERROR_MESSAGE, NETWORK_ERROR_STATUS, { cause: error });
  }

  // Error pages (e.g. a 502 from a proxy) may not be JSON, so a parse failure must not hide the HTTP error
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok || data === null) {
    throw new ApiError(getServerMessage(data) || errorMessage, response.status);
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(errorMessage, response.status, { cause: result.error });
  }

  return result.data;
}
