import type { ApiErrorBody } from './types';

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(status: number, body?: ApiErrorBody, fallback = 'Error inesperado') {
    super(body?.message ?? fallback);
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.code;
    this.fieldErrors = body?.errors;
  }
}

/** Sin respuesta del servidor (red caída, CORS, backend apagado). */
export class NetworkError extends Error {
  constructor() {
    super('No se pudo conectar con el servidor');
    this.name = 'NetworkError';
  }
}
