import { ApiError, NetworkError } from '@/lib/api';

const MENSAJES_POR_CODIGO: Record<string, string> = {
  TEXTO_INVALIDO:
    'El texto no puede llevar etiquetas HTML ni quedar vacío. Escríbelo como texto simple.',
  EJERCICIO_NO_ENCONTRADO:
    'Esta ficha ya no está publicada, así que no admite comentarios.',
  COMENTARIO_NO_ENCONTRADO: 'Ese comentario ya no existe o dejó de estar disponible.',
  COMENTARIO_NO_RESPONDIBLE:
    'Ese comentario todavía no se puede responder: aún no está publicado.',
  NO_ES_AUTOR: 'Solo la persona que escribió el comentario puede modificarlo.',
};

/** Traduce un fallo de las operaciones de comentarios a un mensaje para la persona. */
export function mensajeErrorComentario(error: unknown): string {
  if (error instanceof NetworkError) {
    return 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  }
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Tu sesión venció. Vuelve a iniciar sesión.';
    if (error.status === 429) {
      return 'Estás comentando demasiado rápido. Espera un momento e inténtalo de nuevo.';
    }
    if (error.status >= 500) {
      return 'El servidor tuvo un problema. Inténtalo en unos minutos.';
    }
    if (error.code === 'VALIDATION_ERROR') {
      return 'El comentario debe tener entre 1 y 1000 caracteres.';
    }
    const porCodigo = error.code ? MENSAJES_POR_CODIGO[error.code] : undefined;
    if (porCodigo) return porCodigo;
  }
  return 'No se pudo completar la acción. Inténtalo de nuevo.';
}
