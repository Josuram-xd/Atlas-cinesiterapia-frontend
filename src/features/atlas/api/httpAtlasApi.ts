import { api } from '@/lib/api';
import type { Categoria, Region } from '@/lib/api';
import type { AtlasApi } from './atlasApi';

/** Implementación contra el backend real (GET /regiones, GET /regiones/{id}/categorias). */
export const httpAtlasApi: AtlasApi = {
  listarRegiones: (signal) => api.get<Region[]>('/regiones', { signal }),
  listarCategorias: (regionId, signal) =>
    api.get<Categoria[]>(`/regiones/${regionId}/categorias`, { signal }),
};
