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

describe('mockAtlasApi: ejercicios', () => {
  it('lista los ejercicios de una región y categoría con ficha', async () => {
    const api = crearMockAtlasApi();
    const regiones = await api.listarRegiones();
    const rodilla = regiones.find((r) => r.svgId === 'anterior-rodilla')!;
    const lista = await api.listarEjercicios({ regionId: rodilla.id, categoriaId: 4 });
    expect(lista.length).toBeGreaterThanOrEqual(2);
    expect(lista[0]).toEqual(
      expect.objectContaining({ id: expect.any(Number), nombre: expect.any(String) }),
    );
  });

  it('devuelve una lista vacía si no hay fichas para la combinación', async () => {
    const api = crearMockAtlasApi();
    const regiones = await api.listarRegiones();
    const codo = regiones.find((r) => r.svgId === 'anterior-codo')!;
    await expect(
      api.listarEjercicios({ regionId: codo.id, categoriaId: 2 }),
    ).resolves.toEqual([]);
  });

  it('los ids de los ejercicios no se repiten', async () => {
    const { EJERCICIOS_MOCK } = await import('../data/ejercicios');
    const ids = Object.values(EJERCICIOS_MOCK).flatMap((porCat) =>
      Object.values(porCat).flatMap((l) => l.map((e) => e.id)),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('mockAtlasApi: ficha, búsqueda y visitas', () => {
  it('los resúmenes traen región y categoría como el backend', async () => {
    const api = crearMockAtlasApi();
    const regiones = await api.listarRegiones();
    const rodilla = regiones.find((r) => r.svgId === 'anterior-rodilla')!;
    const [primero] = await api.listarEjercicios({
      regionId: rodilla.id,
      categoriaId: 4,
    });
    expect(primero.region).toMatchObject({ id: rodilla.id, svgId: 'anterior-rodilla' });
    expect(primero.categoria).toMatchObject({ id: 4 });
  });

  it('cuenta los ejercicios por categoría de la región', async () => {
    const api = crearMockAtlasApi();
    const regiones = await api.listarRegiones();
    const rodilla = regiones.find((r) => r.svgId === 'anterior-rodilla')!;
    const categorias = await api.listarCategorias(rodilla.id);
    expect(categorias.find((c) => c.id === 4)?.totalEjercicios).toBe(3);
    expect(categorias.find((c) => c.id === 2)?.totalEjercicios).toBe(0);
  });

  it('entrega la ficha completa de un ejercicio', async () => {
    const api = crearMockAtlasApi();
    const ficha = await api.obtenerEjercicio(1);
    expect(ficha.nombre).toBe('Flexoextensión pasiva de rodilla');
    expect(ficha.dosificacion.series).toBeTruthy();
    expect(ficha.estudiantesCreadores.length).toBeGreaterThan(0);
    expect(ficha.cohorte).toMatch(/^\d{4}-\d{1,2}$/);
  });

  it('responde 404 como el backend si la ficha no existe', async () => {
    await expect(crearMockAtlasApi().obtenerEjercicio(99999)).rejects.toMatchObject({
      status: 404,
      code: 'EJERCICIO_NO_ENCONTRADO',
    });
  });

  it('busca sin distinguir mayúsculas ni tildes', async () => {
    const api = crearMockAtlasApi();
    const lista = await api.buscarEjercicios('flexoextension');
    expect(lista.map((e) => e.nombre)).toContain('Flexoextensión pasiva de rodilla');
    await expect(api.buscarEjercicios('zzzz')).resolves.toEqual([]);
  });

  it('registrar una visita no falla', async () => {
    await expect(crearMockAtlasApi().registrarVisita(1)).resolves.toBeUndefined();
  });
});
