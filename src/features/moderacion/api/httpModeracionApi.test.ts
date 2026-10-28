import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { httpModeracionApi } from './httpModeracionApi';

afterEach(() => vi.restoreAllMocks());

describe('httpModeracionApi', () => {
  it('usa las rutas de administración del contrato', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({});
    const post = vi.spyOn(api, 'post').mockResolvedValue({});
    const borrar = vi.spyOn(api, 'delete').mockResolvedValue(undefined);
    await httpModeracionApi.listarRevision(2);
    await httpModeracionApi.aceptar(31);
    await httpModeracionApi.eliminar(31);
    expect(get.mock.calls[0][0]).toBe('/admin/comentarios/revision?page=2&size=20');
    expect(post.mock.calls[0][0]).toBe('/admin/comentarios/31/aceptar');
    expect(borrar).toHaveBeenCalledWith('/admin/comentarios/31');
  });

  it('usa las rutas de palabras ofensivas y omite q cuando va vacío', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({});
    const post = vi.spyOn(api, 'post').mockResolvedValue({});
    const borrar = vi.spyOn(api, 'delete').mockResolvedValue(undefined);
    await httpModeracionApi.listarPalabras('', 0);
    await httpModeracionApi.listarPalabras('idio', 1);
    await httpModeracionApi.agregarPalabra('tonto');
    await httpModeracionApi.eliminarPalabra(7);
    expect(get.mock.calls.map((c) => c[0])).toEqual([
      '/admin/palabras-ofensivas?page=0&size=20',
      '/admin/palabras-ofensivas?page=1&size=20&q=idio',
    ]);
    expect(post).toHaveBeenCalledWith('/admin/palabras-ofensivas', { palabra: 'tonto' });
    expect(borrar).toHaveBeenCalledWith('/admin/palabras-ofensivas/7');
  });
});
