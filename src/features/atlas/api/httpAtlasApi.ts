import { api } from '@/lib/api';
import type { CategoriaConConteo, Ejercicio, EjercicioResumen, Region } from '@/lib/api';
import type { AtlasApi } from './atlasApi';

/**
 * Registro de visita al abrir una ficha. El endpoint llega con la Fase 5 del backend
 * (entidad `visita`, RF_032); hasta entonces el backend responde 404 y se ignora.
 * Ruta provisional, a confirmar contra `docs/API.md` cuando se publique esa fase.
 */
export const RUTA_VISITA = (ejercicioId: number) => `/ejercicios/${ejercicioId}/visitas`;

/** Implementación contra el backend real (contrato en `docs/API.md` del backend). */
export const httpAtlasApi: AtlasApi = {
  listarRegiones: (signal) => api.get<Region[]>('/regiones', { signal }),
  listarCategorias: (regionId, signal) =>
    api.get<CategoriaConConteo[]>(`/regiones/${regionId}/categorias`, { signal }),
  listarEjercicios: ({ regionId, categoriaId }, signal) =>
    api.get<EjercicioResumen[]>(
      `/ejercicios?region=${regionId}&categoria=${categoriaId}`,
      {
        signal,
      },
    ),
  obtenerEjercicio: (id, signal) => api.get<Ejercicio>(`/ejercicios/${id}`, { signal }),
  buscarEjercicios: (texto, signal) =>
    api.get<EjercicioResumen[]>(`/ejercicios/buscar?q=${encodeURIComponent(texto)}`, {
      signal,
    }),
  async registrarVisita(ejercicioId) {
    try {
      await api.post<void>(RUTA_VISITA(ejercicioId));
    } catch {
      // 404: el backend todavía no ofrece el endpoint (Fase 5). Cualquier otro fallo
      // (red, 5xx, sesión) tampoco debe interrumpir la lectura de la ficha.
    }
  },
};
