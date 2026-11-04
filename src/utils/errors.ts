const DEFAULT_ERROR_MESSAGE = "An unknown error occurred";

// `catch` gives `unknown`, so the message has to be extracted safely instead of cast with `as Error`
export function getErrorMessage(error: unknown, fallback: string = DEFAULT_ERROR_MESSAGE): string {
  if (error instanceof Error) {
    return error.message || fallback;
  }
  if (typeof error === "string") {
    return error || fallback;
  }
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message || fallback;
  }
  return fallback;
}
