import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api } from '@/lib/api';
import { httpAtlasApi, RUTA_VISITA } from './httpAtlasApi';

afterEach(() => vi.restoreAllMocks());

describe('httpAtlasApi', () => {
  it('pide las rutas del contrato del backend', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue([]);
    await httpAtlasApi.listarRegiones();
    await httpAtlasApi.listarCategorias(7);
    await httpAtlasApi.listarEjercicios({ regionId: 7, categoriaId: 3 });
    await httpAtlasApi.obtenerEjercicio(12);
    await httpAtlasApi.buscarEjercicios('flexión de rodilla');
    expect(get.mock.calls.map((c) => c[0])).toEqual([
      '/regiones',
      '/regiones/7/categorias',
      '/ejercicios?region=7&categoria=3',
      '/ejercicios/12',
      '/ejercicios/buscar?q=flexi%C3%B3n%20de%20rodilla',
    ]);
  });

  it('registra la visita de una ficha en la ruta real del backend', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue(undefined);
    await httpAtlasApi.registrarVisita(5);
    expect(RUTA_VISITA).toBe('/metricas/visitas');
    expect(post).toHaveBeenCalledWith('/metricas/visitas', {
      tipo: 'FICHA',
      ejercicioId: 5,
    });
  });

  it('registra la visita del atlas sin ejercicioId', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue(undefined);
    await httpAtlasApi.registrarVisitaAtlas();
    expect(post).toHaveBeenCalledWith('/metricas/visitas', { tipo: 'ATLAS' });
  });

  it('el registro de visita ignora el 404 de una ficha ya despublicada', async () => {
    vi.spyOn(api, 'post').mockRejectedValue(
      new ApiError(404, { code: 'EJERCICIO_NO_ENCONTRADO' }),
    );
    await expect(httpAtlasApi.registrarVisita(5)).resolves.toBeUndefined();
  });

  it('el registro de visita tampoco propaga errores de red ni del servidor', async () => {
    vi.spyOn(api, 'post').mockRejectedValue(new ApiError(500));
    await expect(httpAtlasApi.registrarVisita(5)).resolves.toBeUndefined();
    await expect(httpAtlasApi.registrarVisitaAtlas()).resolves.toBeUndefined();
  });
});
