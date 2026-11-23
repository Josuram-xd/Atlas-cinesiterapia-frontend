import { ApiError, NetworkError } from '@/lib/api';

/** Mensaje para la persona cuando falla la carga de regiones, categorías o ejercicios. */
export function mensajeDeErrorAtlas(error: unknown): string {
  if (error instanceof NetworkError) {
    return 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  }
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return 'Tu sesión ya no es válida. Vuelve a iniciar sesión.';
    }
    if (error.status === 429) {
      return 'Demasiadas consultas seguidas. Espera un momento e inténtalo de nuevo.';
    }
    if (error.status >= 500) {
      return 'El servidor tuvo un problema. Inténtalo en unos minutos.';
    }
  }
  return 'No pudimos cargar esta información. Inténtalo de nuevo.';
}
