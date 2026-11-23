import { describe, expect, it } from 'vitest';
import { aParrafos, cohorteLegible, fechaLarga } from './texto';

describe('texto de la ficha', () => {
  it('separa párrafos por líneas en blanco y descarta los vacíos', () => {
    expect(aParrafos('Uno\nsigue\n\n\nDos\n\n  ')).toEqual(['Uno\nsigue', 'Dos']);
  });
  it('tolera null y cadenas vacías', () => {
    expect(aParrafos(null)).toEqual([]);
    expect(aParrafos('')).toEqual([]);
  });
  it('formatea la fecha en español', () => {
    expect(fechaLarga('2026-10-20T15:30:00Z')).toBe('20 de octubre de 2026');
    expect(fechaLarga('no es fecha')).toBe('');
  });
  it('hace legible la cohorte', () => {
    expect(cohorteLegible('2025-1')).toBe('2025, periodo 1');
    expect(cohorteLegible('rara')).toBe('rara');
  });
});
