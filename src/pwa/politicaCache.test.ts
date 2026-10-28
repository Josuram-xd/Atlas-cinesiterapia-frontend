import { describe, expect, it } from 'vitest';
import { esLecturaCacheable } from './politicaCache';

const API = 'https://api.atlas.test';
const ok = (ruta: string, metodo = 'GET', origen = API) =>
  esLecturaCacheable({ url: new URL(ruta, origen), method: metodo }, API);

describe('esLecturaCacheable', () => {
  it.each([
    '/regiones',
    '/regiones/3/categorias',
    '/ejercicios?region=1&categoria=2',
    '/ejercicios/buscar?q=hombro',
    '/ejercicios/42',
  ])('cachea la lectura del atlas %s', (ruta) => {
    expect(ok(ruta)).toBe(true);
  });

  it.each([
    '/auth/login',
    '/auth/refresh',
    '/admin/ejercicios',
    '/admin/ejercicios/4',
    '/ejercicios/42/comentarios',
    '/ejercicios/42/visitas',
    '/metricas/resumen',
    '/usuarios/yo',
  ])('nunca cachea %s', (ruta) => {
    expect(ok(ruta)).toBe(false);
  });

  it('solo cachea GET', () => {
    expect(ok('/ejercicios/42', 'POST')).toBe(false);
    expect(ok('/ejercicios/42', 'PUT')).toBe(false);
    expect(ok('/ejercicios/42', 'DELETE')).toBe(false);
  });

  it('ignora otros orígenes, incluidos los de los archivos multimedia', () => {
    expect(ok('/ejercicios/42', 'GET', 'https://cdn.ejemplo.test')).toBe(false);
  });

  it('no confunde rutas que solo empiezan igual', () => {
    expect(ok('/ejerciciosx')).toBe(false);
    expect(ok('/regiones-secretas')).toBe(false);
  });
});
