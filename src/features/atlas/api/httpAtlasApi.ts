import { api } from '@/lib/api';
import type {
  CategoriaConConteo,
  Ejercicio,
  EjercicioResumen,
  Region,
  VisitaRequest,
} from '@/lib/api';
import type { AtlasApi } from './atlasApi';

/** Registro de visitas (RF_032): `POST /metricas/visitas`, docs/API.md sección 9. */
export const RUTA_VISITA = '/metricas/visitas';

async function enviarVisita(visita: VisitaRequest): Promise<void> {
  try {
    await api.post<void>(RUTA_VISITA, visita);
  } catch {
    // Un fallo al medir (red, 5xx, sesión, 404 de una ficha ya despublicada) nunca debe
    // interrumpir la lectura.
  }
}

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
    await enviarVisita({ tipo: 'FICHA', ejercicioId });
  },
  async registrarVisitaAtlas() {
    await enviarVisita({ tipo: 'ATLAS' });
  },
};
