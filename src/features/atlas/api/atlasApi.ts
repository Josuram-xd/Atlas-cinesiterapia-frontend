import type { Categoria, Region } from '@/lib/api';

/**
 * Lo que la pantalla del atlas necesita del backend. Hay dos implementaciones
 * intercambiables (mock y HTTP); la interfaz es el único contrato que conoce la interfaz.
 */
export interface AtlasApi {
  /** Regiones de ambas vistas. */
  listarRegiones(signal?: AbortSignal): Promise<Region[]>;
  /** Categorías terapéuticas disponibles para una región. */
  listarCategorias(regionId: number, signal?: AbortSignal): Promise<Categoria[]>;
}
