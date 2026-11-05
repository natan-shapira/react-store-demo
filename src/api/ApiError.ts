// The request never got a response (offline, DNS failure, blocked by CORS); browsers report this as status 0 too
export const NETWORK_ERROR_STATUS = 0;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number, options?: ErrorOptions) {
    super(message, options);
    this.name = "ApiError";
    this.status = status;
  }
}
