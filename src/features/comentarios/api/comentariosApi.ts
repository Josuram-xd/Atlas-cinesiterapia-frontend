import type { Comentario, Pagina } from '@/lib/api';

/** Lo que la interfaz necesita de los comentarios (docs/API.md, sección 8). */
export interface ComentariosApi {
  /** Comentarios raíz de una ficha, del más reciente al más antiguo, con sus respuestas visibles. */
  listar(
    ejercicioId: number,
    pagina: number,
    signal?: AbortSignal,
  ): Promise<Pagina<Comentario>>;
  /** Comentario nuevo. Si el filtro de ofensivas lo detiene, vuelve con `enRevision: true`. */
  crear(ejercicioId: number, texto: string): Promise<Comentario>;
  /** Responde al comentario `id`; responder a una respuesta cuelga de la raíz del hilo. */
  responder(id: number, texto: string): Promise<Comentario>;
  /** Edita el comentario propio. Vuelve sin respuestas: se piden de nuevo con el listado. */
  editar(id: number, texto: string): Promise<Comentario>;
  /**
   * Borrado blando; si tenía respuestas queda como «eliminado». Sin `comoAdmin` solo el
   * autor puede (403 NO_ES_AUTOR); con `comoAdmin` usa la ruta de moderación (HU-28).
   */
  eliminar(id: number, comoAdmin?: boolean): Promise<void>;
  /**
   * Reporta un comentario ajeno (sin motivo). Sigue visible mientras se revisa. 403
   * REPORTE_PROPIO si es tuyo; 409 YA_REPORTADO si ya lo reportaste.
   */
  reportar(id: number): Promise<void>;
}
