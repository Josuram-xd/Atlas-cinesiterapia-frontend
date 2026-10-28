import { api } from '@/lib/api';
import type { ComentarioRevision, Pagina, PalabraOfensiva } from '@/lib/api';
import type { ModeracionApi } from './moderacionApi';

export const TAMANO_PAGINA = 20;

export const httpModeracionApi: ModeracionApi = {
  listarRevision: (pagina, signal) =>
    api.get<Pagina<ComentarioRevision>>(
      `/admin/comentarios/revision?page=${pagina}&size=${TAMANO_PAGINA}`,
      { signal },
    ),
  aceptar: (id) => api.post<ComentarioRevision>(`/admin/comentarios/${id}/aceptar`),
  eliminar: (id) => api.delete<void>(`/admin/comentarios/${id}`),

  listarPalabras: (q, pagina, signal) => {
    const p = new URLSearchParams({ page: String(pagina), size: String(TAMANO_PAGINA) });
    if (q) p.set('q', q);
    return api.get<Pagina<PalabraOfensiva>>(`/admin/palabras-ofensivas?${p}`, { signal });
  },
  agregarPalabra: (palabra) =>
    api.post<PalabraOfensiva>('/admin/palabras-ofensivas', { palabra }),
  eliminarPalabra: (id) => api.delete<void>(`/admin/palabras-ofensivas/${id}`),
};
