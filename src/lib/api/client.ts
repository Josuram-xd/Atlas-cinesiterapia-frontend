import { API_URL } from './config';
import { ApiError, NetworkError } from './errors';
import { tokenStorage } from './tokenStorage';
import type { ApiErrorBody, AuthResponse } from './types';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Envía el access token y reintenta tras refrescarlo. Por defecto `true`. */
  auth?: boolean;
  signal?: AbortSignal;
}

type ShortOptions = Omit<RequestOptions, 'method' | 'body'>;

let onSessionExpired: (() => void) | null = null;
let onTokensRefreshed: ((auth: AuthResponse) => void) | null = null;

/** Lo registra el store de sesión: se llama cuando el refresh falla definitivamente. */
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

/** Lo registra el store de sesión: se llama con cada refresh exitoso. */
export function setTokensRefreshedHandler(
  handler: ((auth: AuthResponse) => void) | null,
): void {
  onTokensRefreshed = handler;
}

async function send(
  path: string,
  options: RequestOptions,
  accessToken?: string,
): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  try {
    return await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new NetworkError();
  }
}

async function parse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }
  if (!response.ok) throw new ApiError(response.status, data as ApiErrorBody | undefined);
  return data as T;
}

let refreshing: Promise<boolean> | null = null;

/**
 * Renueva el access token con el refresh token (rotativo). Una sola petición en vuelo:
 * las demás llamadas esperan la misma promesa. Un refresh exitoso también cancela en el
 * backend el cierre pendiente (HU-19).
 */
export function refreshSession(): Promise<boolean> {
  if (refreshing) return refreshing;
  const current = tokenStorage.get();
  if (!current) return Promise.resolve(false);

  refreshing = (async () => {
    try {
      const response = await send('/auth/refresh', {
        method: 'POST',
        body: { refreshToken: current.refreshToken },
      });
      const auth = await parse<AuthResponse>(response);
      tokenStorage.set({
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
      });
      onTokensRefreshed?.(auth);
      return true;
    } catch (error) {
      // Un fallo de red no invalida la sesión; un rechazo del servidor sí.
      if (error instanceof ApiError) {
        tokenStorage.clear();
        onSessionExpired?.();
      }
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const auth = options.auth ?? true;
  const tokens = auth ? tokenStorage.get() : null;
  const response = await send(path, options, tokens?.accessToken);

  if (response.status === 401 && auth && tokens) {
    if (await refreshSession()) {
      const retry = await send(path, options, tokenStorage.get()?.accessToken);
      return parse<T>(retry);
    }
  }
  return parse<T>(response);
}

export const api = {
  get: <T>(path: string, options?: ShortOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: ShortOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: ShortOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: ShortOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
