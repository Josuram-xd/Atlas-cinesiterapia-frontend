import type { Categoria, EjercicioResumen, Region } from '@/lib/api';
import { CATEGORIAS_MOCK, REGIONES_MOCK } from '../data/regiones';
import { EJERCICIOS_MOCK } from '../data/ejercicios';
import type { AtlasApi } from './atlasApi';

export interface OpcionesMock {
  /** Retraso simulado de cada llamada, en milisegundos. */
  latenciaMs?: number;
  /** Si es true, todas las llamadas fallan (para ver el estado de error). */
  fallar?: boolean;
}

/** Error que lanza el mock cuando se le pide fallar. */
export class MockApiError extends Error {
  constructor() {
    super('Fallo simulado del mock');
    this.name = 'MockApiError';
  }
}

function esperar(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolver, rechazar) => {
    const id = setTimeout(resolver, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      rechazar(new DOMException('Cancelado', 'AbortError'));
    });
  });
}

/** Datos de ejemplo detrás de la misma interfaz que el backend. */
export function crearMockAtlasApi({
  latenciaMs = 0,
  fallar = false,
}: OpcionesMock = {}): AtlasApi {
  async function responder<T>(datos: T, signal?: AbortSignal): Promise<T> {
    await esperar(latenciaMs, signal);
    if (fallar) throw new MockApiError();
    return structuredClone(datos);
  }
  return {
    listarRegiones: (signal) => responder<Region[]>(REGIONES_MOCK, signal),
    listarCategorias: (_regionId, signal) =>
      responder<Categoria[]>(CATEGORIAS_MOCK, signal),
    listarEjercicios: ({ regionId, categoriaId }, signal) => {
      const region = REGIONES_MOCK.find((r) => r.id === regionId);
      const lista = region ? (EJERCICIOS_MOCK[region.svgId]?.[categoriaId] ?? []) : [];
      return responder<EjercicioResumen[]>(lista, signal);
    },
  };
}
