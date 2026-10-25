import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { httpComentariosApi } from './httpComentariosApi';

afterEach(() => vi.restoreAllMocks());

describe('httpComentariosApi', () => {
  it('pide las rutas del contrato del backend', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ content: [] });
    const post = vi.spyOn(api, 'post').mockResolvedValue({});
    await httpComentariosApi.listar(7, 2);
    await httpComentariosApi.crear(7, 'Hola');
    await httpComentariosApi.responder(31, 'Gracias');
    expect(get.mock.calls[0][0]).toBe('/ejercicios/7/comentarios?page=2&size=20');
    expect(post.mock.calls).toEqual([
      ['/ejercicios/7/comentarios', { texto: 'Hola' }],
      ['/comentarios/31/respuestas', { texto: 'Gracias' }],
    ]);
  });
});
