import { api } from '@/lib/api';
import type {
  Categoria,
  EjercicioAdmin,
  EjercicioAdminResumen,
  FiltroFichas,
  MediaAdmin,
  Pagina,
  SubidaPrefirmada,
} from '@/lib/api';
import type { AdminApi } from './adminApi';
import { esUrlFicticia, putConProgreso } from './putConProgreso';

/** Query string del listado: solo los filtros con valor, con el nombre que espera el backend. */
export function consultaFichas(filtro: FiltroFichas): string {
  const p = new URLSearchParams();
  if (filtro.estado) p.set('estado', filtro.estado);
  if (filtro.regionId !== undefined) p.set('regionId', String(filtro.regionId));
  if (filtro.categoriaId !== undefined) p.set('categoriaId', String(filtro.categoriaId));
  if (filtro.q?.trim()) p.set('q', filtro.q.trim());
  p.set('page', String(filtro.page ?? 0));
  p.set('size', String(filtro.size ?? 20));
  return p.toString();
}

const base = (id: number) => `/admin/ejercicios/${id}`;

export const httpAdminApi: AdminApi = {
  listarFichas: (filtro, signal) =>
    api.get<Pagina<EjercicioAdminResumen>>(
      `/admin/ejercicios?${consultaFichas(filtro)}`,
      {
        signal,
      },
    ),
  obtenerFicha: (id, signal) => api.get<EjercicioAdmin>(base(id), { signal }),
  crearFicha: (datos) => api.post<EjercicioAdmin>('/admin/ejercicios', datos),
  actualizarFicha: (id, datos) => api.put<EjercicioAdmin>(base(id), datos),
  publicarFicha: (id) => api.post<EjercicioAdmin>(`${base(id)}/publicar`),
  archivarFicha: (id) => api.post<EjercicioAdmin>(`${base(id)}/archivar`),
  restaurarFicha: (id) => api.post<EjercicioAdmin>(`${base(id)}/restaurar`),
  eliminarFicha: (id) => api.delete<void>(base(id)),
  listarCategorias: (signal) => api.get<Categoria[]>('/categorias', { signal }),

  solicitarSubida: (fichaId, solicitud) =>
    api.post<SubidaPrefirmada>(`${base(fichaId)}/media/subida`, solicitud),
  async subirArchivo(subida, archivo, onProgreso, signal) {
    if (esUrlFicticia(subida.urlSubida)) {
      onProgreso(1);
      return;
    }
    await putConProgreso(subida.urlSubida, subida.cabeceras, archivo, onProgreso, signal);
  },
  confirmarMedia: (fichaId, mediaId) =>
    api.post<MediaAdmin>(`${base(fichaId)}/media/${mediaId}/confirmar`),
  eliminarMedia: (fichaId, mediaId) =>
    api.delete<void>(`${base(fichaId)}/media/${mediaId}`),
};
