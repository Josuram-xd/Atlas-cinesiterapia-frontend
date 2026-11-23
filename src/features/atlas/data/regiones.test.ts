import { describe, expect, it } from 'vitest';
import { CATEGORIAS_MOCK, REGIONES_MOCK } from './regiones';

describe('catálogo del atlas (contrato con el backend)', () => {
  it('el svgId lleva el prefijo de la vista, porque cabeza-cuello existe en ambas', () => {
    for (const r of REGIONES_MOCK) {
      expect(r.svgId.startsWith(`${r.vista.toLowerCase()}-`)).toBe(true);
    }
  });
  it('los svgId son únicos', () => {
    const ids = REGIONES_MOCK.map((r) => r.svgId);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('hay 9 categorías terapéuticas', () => {
    expect(CATEGORIAS_MOCK).toHaveLength(9);
  });
});
