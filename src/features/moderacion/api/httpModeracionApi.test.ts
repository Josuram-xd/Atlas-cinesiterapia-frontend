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
});
