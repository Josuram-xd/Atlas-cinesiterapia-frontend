import { ApiError } from '@/lib/api';
import type { CategoriaConConteo, Ejercicio, EjercicioResumen, Region } from '@/lib/api';
import { CATEGORIAS_MOCK, REGIONES_MOCK } from '../data/regiones';
import { EJERCICIOS_MOCK, type EjercicioMock } from '../data/ejercicios';
import { fichaMock, resumenMock } from '../data/fichas';
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
  /** Recorre el catálogo de ejemplo como lo haría una consulta a la base. */
  function* todos() {
    for (const [svgId, porCategoria] of Object.entries(EJERCICIOS_MOCK)) {
      const region = REGIONES_MOCK.find((r) => r.svgId === svgId)!;
      for (const [categoriaId, lista] of Object.entries(porCategoria)) {
        const categoria = CATEGORIAS_MOCK.find((c) => c.id === Number(categoriaId))!;
        for (const e of lista) yield { e, region, categoria };
      }
    }
  }
  const resumenes = (filtro: (e: EjercicioMock) => boolean = () => true) =>
    [...todos()]
      .filter(({ e }) => filtro(e))
      .map(({ e, region, categoria }) => resumenMock(e, region, categoria))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  return {
    listarRegiones: (signal) => responder<Region[]>(REGIONES_MOCK, signal),
    listarCategorias: (regionId, signal) => {
      const region = REGIONES_MOCK.find((r) => r.id === regionId);
      const conteo = (categoriaId: number) =>
        region ? (EJERCICIOS_MOCK[region.svgId]?.[categoriaId]?.length ?? 0) : 0;
      return responder<CategoriaConConteo[]>(
        CATEGORIAS_MOCK.map((c) => ({ ...c, totalEjercicios: conteo(c.id) })),
        signal,
      );
    },
    listarEjercicios: ({ regionId, categoriaId }, signal) =>
      responder<EjercicioResumen[]>(
        resumenes().filter(
          (r) => r.region.id === regionId && r.categoria.id === categoriaId,
        ),
        signal,
      ),
    async obtenerEjercicio(id, signal) {
      const hallado = [...todos()].find(({ e }) => e.id === id);
      await esperar(latenciaMs, signal);
      if (fallar) throw new MockApiError();
      if (!hallado) {
        throw new ApiError(404, {
          code: 'EJERCICIO_NO_ENCONTRADO',
          message: 'Ejercicio no encontrado',
        });
      }
      return structuredClone<Ejercicio>(
        fichaMock(hallado.e, hallado.region, hallado.categoria),
      );
    },
    buscarEjercicios: (texto, signal) => {
      const buscado = normalizar(texto);
      return responder<EjercicioResumen[]>(
        resumenes((e) => normalizar(e.nombre).includes(buscado)).slice(0, 50),
        signal,
      );
    },
    registrarVisita: () => Promise.resolve(),
    registrarVisitaAtlas: () => Promise.resolve(),
  };
}

/** Minúsculas y sin tildes, como la búsqueda del backend. */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
