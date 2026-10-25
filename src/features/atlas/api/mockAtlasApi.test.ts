import { describe, expect, it } from 'vitest';
import { crearMockAtlasApi, MockApiError } from './mockAtlasApi';

describe('mockAtlasApi', () => {
  it('devuelve las regiones de ambas vistas', async () => {
    const regiones = await crearMockAtlasApi().listarRegiones();
    expect(regiones.filter((r) => r.vista === 'ANTERIOR')).toHaveLength(13);
    expect(regiones.filter((r) => r.vista === 'POSTERIOR')).toHaveLength(14);
  });

  it('devuelve las 9 categorías para cualquier región', async () => {
    const categorias = await crearMockAtlasApi().listarCategorias(1);
    expect(categorias).toHaveLength(9);
    expect(new Set(categorias.map((c) => c.id)).size).toBe(9);
  });

  it('entrega copias: modificar la respuesta no altera el catálogo', async () => {
    const api = crearMockAtlasApi();
    const [primera] = await api.listarRegiones();
    primera.nombre = 'Alterada';
    const [otra] = await api.listarRegiones();
    expect(otra.nombre).not.toBe('Alterada');
  });

  it('puede fallar a propósito para ver el estado de error', async () => {
    const api = crearMockAtlasApi({ fallar: true });
    await expect(api.listarRegiones()).rejects.toBeInstanceOf(MockApiError);
    await expect(api.listarCategorias(1)).rejects.toBeInstanceOf(MockApiError);
  });

  it('respeta la cancelación durante la latencia', async () => {
    const control = new AbortController();
    const promesa = crearMockAtlasApi({ latenciaMs: 5000 }).listarRegiones(
      control.signal,
    );
    control.abort();
    await expect(promesa).rejects.toMatchObject({ name: 'AbortError' });
  });
});
