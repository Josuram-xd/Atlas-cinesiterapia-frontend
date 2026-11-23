import { describe, expect, it } from 'vitest';
import { CATEGORIAS_MOCK } from '../data/regiones';
import { etiquetaCorta } from './etiquetas';

describe('etiquetaCorta', () => {
  it('acorta cada una de las 9 categorías a una o dos palabras', () => {
    for (const { nombre } of CATEGORIAS_MOCK) {
      const corta = etiquetaCorta(nombre);
      expect(corta.length).toBeLessThanOrEqual(14);
      expect(corta.split(' ').length).toBeLessThanOrEqual(2);
    }
  });

  it('las etiquetas cortas son distintas entre sí', () => {
    const cortas = CATEGORIAS_MOCK.map((c) => etiquetaCorta(c.nombre));
    expect(new Set(cortas).size).toBe(cortas.length);
  });

  it('una categoría desconocida conserva su nombre', () => {
    expect(etiquetaCorta('Hidroterapia')).toBe('Hidroterapia');
  });
});
