import type { ComentarioRevision, Pagina, PalabraOfensiva } from '@/lib/api';

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

  /** Lista de palabras ofensivas en orden alfabético; `q` filtra (sin tildes ni mayúsculas). */
  listarPalabras(
    q: string,
    pagina: number,
    signal?: AbortSignal,
  ): Promise<Pagina<PalabraOfensiva>>;
  /** Agrega una palabra. Los cambios aplican de inmediato a comentarios nuevos y ediciones. */
  agregarPalabra(palabra: string): Promise<PalabraOfensiva>;
  /** Borrado definitivo de la palabra. */
  eliminarPalabra(id: number): Promise<void>;
}
