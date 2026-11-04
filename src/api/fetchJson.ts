import { type z } from "zod";
import { ApiError } from "./ApiError";
import { fetchWithAuth } from "./fetchWithAuth";

export async function fetchJson<T>(
  url: string,
  schema: z.ZodType<T>,
  errorMessage: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetchWithAuth(url, options);
  // Error pages (e.g. a 502 from a proxy) may not be JSON, so a parse failure must not hide the HTTP error
  const data = await response.json().catch(() => null);

  if (!response.ok || data === null) {
    throw new ApiError(data?.message || errorMessage, response.status);
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(errorMessage, response.status, { cause: result.error });
  }

  return result.data;
}
