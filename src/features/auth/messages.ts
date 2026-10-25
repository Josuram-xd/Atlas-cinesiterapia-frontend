import { ApiError, NetworkError } from '@/lib/api';

/** Traduce un error de la API a un mensaje para la persona; `porEstado` afina por código HTTP. */
export function mensajeDeError(
  error: unknown,
  porEstado: Partial<Record<number, string>> = {},
): string {
  if (error instanceof NetworkError) {
    return 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  }
  if (error instanceof ApiError) {
    if (porEstado[error.status]) return porEstado[error.status]!;
    if (error.status === 429) {
      return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
    }
    if (error.status >= 500)
      return 'El servidor tuvo un problema. Inténtalo en unos minutos.';
  }
  return 'Algo salió mal. Inténtalo de nuevo.';
}
