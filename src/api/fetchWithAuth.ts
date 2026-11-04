// Injected through configureAuth, so this transport layer never imports the auth store
let getTokenFn: () => string | null = () => null;
let onUnauthorizedFn: () => void = () => {};

export function configureAuth(config: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) {
  getTokenFn = config.getToken;
  onUnauthorizedFn = config.onUnauthorized;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getTokenFn();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(url, {
    ...options,
    headers,
  });
  if (response.status === 401) {
    onUnauthorizedFn();
  }
  return response;
}
