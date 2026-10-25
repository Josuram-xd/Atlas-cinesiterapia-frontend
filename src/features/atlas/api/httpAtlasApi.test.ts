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

  it('el registro de visita ignora el 404 de un backend sin el endpoint', async () => {
    const post = vi
      .spyOn(api, 'post')
      .mockRejectedValue(new ApiError(404, { code: 'NOT_FOUND' }));
    await expect(httpAtlasApi.registrarVisita(5)).resolves.toBeUndefined();
    expect(post).toHaveBeenCalledWith(RUTA_VISITA(5));
  });

  it('el registro de visita tampoco propaga errores de red ni del servidor', async () => {
    vi.spyOn(api, 'post').mockRejectedValue(new ApiError(500));
    await expect(httpAtlasApi.registrarVisita(5)).resolves.toBeUndefined();
  });
});
