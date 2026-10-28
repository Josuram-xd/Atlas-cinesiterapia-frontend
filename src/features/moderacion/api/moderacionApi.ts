import type { ComentarioRevision, Pagina } from '@/lib/api';

/** Lo que la moderación necesita del backend (docs/API.md, sección 8, solo ADMIN). */
export interface ModeracionApi {
  /** Cola de revisión: ocultados y reportados, el más antiguo primero. */
  listarRevision(
    pagina: number,
    signal?: AbortSignal,
  ): Promise<Pagina<ComentarioRevision>>;
  /** Vuelve a publicar el comentario y borra sus reportes. */
  aceptar(id: number): Promise<ComentarioRevision>;
  /** Borrado blando de cualquier comentario. */
  eliminar(id: number): Promise<void>;
}
