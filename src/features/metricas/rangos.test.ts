import { describe, expect, it } from 'vitest';
import { hoyUtc, inicioCubo, rangoDePeriodo, validarRango } from './rangos';

describe('rangos de métricas', () => {
  it('hoyUtc usa el día UTC', () => {
    expect(hoyUtc(new Date('2026-10-29T02:30:00Z'))).toBe('2026-10-29');
    expect(hoyUtc(new Date('2026-10-28T23:59:59Z'))).toBe('2026-10-28');
  });

  it('día, semana (desde el lunes) y mes en curso terminan hoy', () => {
    expect(rangoDePeriodo('DIA', '2026-10-28')).toEqual({
      desde: '2026-10-28',
      hasta: '2026-10-28',
    });
    expect(rangoDePeriodo('SEMANA', '2026-10-28')).toEqual({
      desde: '2026-10-26',
      hasta: '2026-10-28',
    });
    expect(rangoDePeriodo('MES', '2026-10-28')).toEqual({
      desde: '2026-10-01',
      hasta: '2026-10-28',
    });
  });

  it('la semana de un domingo empieza el lunes anterior', () => {
    expect(rangoDePeriodo('SEMANA', '2026-10-25')).toEqual({
      desde: '2026-10-19',
      hasta: '2026-10-25',
    });
  });

  it('inicioCubo agrupa por día, lunes o día 1', () => {
    expect(inicioCubo('2026-10-28', 'DIA')).toBe('2026-10-28');
    expect(inicioCubo('2026-10-28', 'SEMANA')).toBe('2026-10-26');
    expect(inicioCubo('2026-10-28', 'MES')).toBe('2026-10-01');
  });

  it('acepta un rango válido y un día suelto', () => {
    expect(validarRango({ desde: '2026-10-01', hasta: '2026-10-28' })).toBeNull();
    expect(validarRango({ desde: '2026-10-28', hasta: '2026-10-28' })).toBeNull();
  });

  it('rechaza fechas vacías, al revés y de más de 366 días', () => {
    expect(validarRango({ desde: '', hasta: '2026-10-28' })).toMatch(/Indica/);
    expect(validarRango({ desde: '2026-10-28', hasta: '2026-10-01' })).toMatch(
      /posterior/,
    );
    expect(validarRango({ desde: '2025-10-27', hasta: '2026-10-28' })).toMatch(/366/);
  });

  it('rechaza días que no existen y años de más de 4 cifras', () => {
    expect(validarRango({ desde: '2026-02-30', hasta: '2026-03-05' })).toMatch(/Indica/);
    expect(validarRango({ desde: '2026-01-01', hasta: '20260-01-01' })).toMatch(/Indica/);
    expect(validarRango({ desde: '2024-02-29', hasta: '2024-03-01' })).toBeNull();
  });

  it('acepta exactamente 366 días', () => {
    expect(validarRango({ desde: '2025-10-28', hasta: '2026-10-28' })).toBeNull();
  });
});
