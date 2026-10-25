import type { CategoriaConConteo, Ejercicio, EjercicioResumen, Region } from '@/lib/api';

export interface FiltroEjercicios {
  regionId: number;
  categoriaId: number;
}

/**
 * Lo que la pantalla del atlas necesita del backend. Hay dos implementaciones
 * intercambiables (mock y HTTP); la interfaz es el único contrato que conoce la interfaz.
 */
export interface AtlasApi {
  /** Regiones de ambas vistas. */
  listarRegiones(signal?: AbortSignal): Promise<Region[]>;
  /** Las 9 categorías terapéuticas con el número de fichas publicadas en la región. */
  listarCategorias(regionId: number, signal?: AbortSignal): Promise<CategoriaConConteo[]>;
  /** Ejercicios publicados de una región y categoría (HU-01). */
  listarEjercicios(
    filtro: FiltroEjercicios,
    signal?: AbortSignal,
  ): Promise<EjercicioResumen[]>;
  /** Ficha completa de un ejercicio publicado (HU-02). 404 si no existe o no está publicado. */
  obtenerEjercicio(id: number, signal?: AbortSignal): Promise<Ejercicio>;
  /** Búsqueda por nombre (HU-03): parcial, sin distinguir mayúsculas ni tildes, máximo 50. */
  buscarEjercicios(texto: string, signal?: AbortSignal): Promise<EjercicioResumen[]>;
  /**
   * Registra que alguien abrió una ficha (RF_032). Nunca falla hacia la interfaz: si el
   * backend aún no tiene el endpoint (404) o está caído, se ignora en silencio.
   */
  registrarVisita(ejercicioId: number): Promise<void>;
}
