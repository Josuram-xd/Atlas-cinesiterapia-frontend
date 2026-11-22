import type { Comentario } from '@/lib/api';

/**
 * Mensaje tras publicar o editar. Si el filtro automático lo detuvo (`enRevision`), la
 * persona debe saber por qué no lo ven los demás (RF_045).
 */
export function avisoDeResultado(c: Comentario, textoNormal: string): string {
  return c.enRevision
    ? 'Tu comentario quedó esperando revisión: por ahora solo tú lo ves. Una persona administradora lo revisará.'
    : textoNormal;
}
