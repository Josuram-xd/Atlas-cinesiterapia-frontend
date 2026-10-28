import { api } from '@/lib/api';
import type { ComentarioRevision, Pagina } from '@/lib/api';
import type { ModeracionApi } from './moderacionApi';

export const TAMANO_PAGINA_REVISION = 20;

export const httpModeracionApi: ModeracionApi = {
  listarRevision: (pagina, signal) =>
    api.get<Pagina<ComentarioRevision>>(
      `/admin/comentarios/revision?page=${pagina}&size=${TAMANO_PAGINA_REVISION}`,
      { signal },
    ),
  aceptar: (id) => api.post<ComentarioRevision>(`/admin/comentarios/${id}/aceptar`),
  eliminar: (id) => api.delete<void>(`/admin/comentarios/${id}`),
};
