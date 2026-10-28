import { afterEach, describe, expect, it, vi } from 'vitest';
import { limpiarCachesDeDatos } from './limpiarCaches';
import { CACHE_DATOS } from './politicaCache';

afterEach(() => vi.unstubAllGlobals());

describe('limpiarCachesDeDatos', () => {
  it('borra solo la caché de datos', async () => {
    const borrar = vi.fn().mockResolvedValue(true);
    vi.stubGlobal('caches', { delete: borrar });
    await limpiarCachesDeDatos();
    expect(borrar).toHaveBeenCalledExactlyOnceWith(CACHE_DATOS);
  });

  it('no falla si el navegador no tiene Cache Storage', async () => {
    vi.stubGlobal('caches', undefined);
    await expect(limpiarCachesDeDatos()).resolves.toBeUndefined();
  });

  it('no falla si el borrado se rechaza', async () => {
    vi.stubGlobal('caches', { delete: vi.fn().mockRejectedValue(new Error('x')) });
    await expect(limpiarCachesDeDatos()).resolves.toBeUndefined();
  });
});
