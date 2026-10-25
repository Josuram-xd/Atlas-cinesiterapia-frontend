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
  /** Borrado blando del comentario propio; si tenía respuestas queda como «eliminado». */
  eliminar(id: number): Promise<void>;
}
