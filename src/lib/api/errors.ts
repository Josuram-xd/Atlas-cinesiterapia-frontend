import type { ApiErrorBody } from './types';

export interface ApiErrorExtras {
  /** Segundos de la cabecera Retry-After (límite de intentos). */
  retryAfter?: number;
  fallback?: string;
}

export class ApiError extends Error {
  readonly status: number;
  /** Código estable del backend (CREDENCIALES_INVALIDAS, TOKEN_INVALIDO, ...). */
  readonly code?: string;
  /** Mensaje de cada campo inválido, por nombre de campo. Vacío si no aplica. */
  readonly fieldErrors: Record<string, string>;
  readonly retryAfter?: number;

  constructor(status: number, body?: ApiErrorBody, extras: ApiErrorExtras = {}) {
    super(body?.message ?? extras.fallback ?? 'Error inesperado');
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.code;
    this.fieldErrors = Object.fromEntries(
      (body?.fieldErrors ?? []).map((e) => [e.field, e.message]),
    );
    this.retryAfter = extras.retryAfter;
  }
}

/** Sin respuesta del servidor (red caída, CORS, backend apagado). */
export class NetworkError extends Error {
  constructor() {
    super('No se pudo conectar con el servidor');
    this.name = 'NetworkError';
  }
}
