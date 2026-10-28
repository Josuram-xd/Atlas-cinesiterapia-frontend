import { api } from '@/lib/api';
import type { Comentario, ComentarioRequest, Pagina } from '@/lib/api';
import type { ComentariosApi } from './comentariosApi';

export const TAMANO_PAGINA_COMENTARIOS = 20;

export const httpComentariosApi: ComentariosApi = {
  listar: (ejercicioId, pagina, signal) =>
    api.get<Pagina<Comentario>>(
      `/ejercicios/${ejercicioId}/comentarios?page=${pagina}&size=${TAMANO_PAGINA_COMENTARIOS}`,
      { signal },
    ),
  crear: (ejercicioId, texto) =>
    api.post<Comentario>(`/ejercicios/${ejercicioId}/comentarios`, {
      texto,
    } satisfies ComentarioRequest),
  responder: (id, texto) =>
    api.post<Comentario>(`/comentarios/${id}/respuestas`, {
      texto,
    } satisfies ComentarioRequest),
  editar: (id, texto) =>
    api.put<Comentario>(`/comentarios/${id}`, { texto } satisfies ComentarioRequest),
  eliminar: (id) => api.delete<void>(`/comentarios/${id}`),
  async reportar(id) {
    await api.post<{ comentarioId: number }>(`/comentarios/${id}/reportes`);
  },
};
