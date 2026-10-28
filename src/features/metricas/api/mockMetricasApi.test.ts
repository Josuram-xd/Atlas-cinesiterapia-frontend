import { describe, expect, it } from 'vitest';
import { crearMockMetricasApi } from './mockMetricasApi';

const suma = (serie: { visitas: number }[]) =>
  serie.reduce((total, c) => total + c.visitas, 0);

describe('mockMetricasApi: visitas por periodo', () => {
  it('la serie diaria incluye cada día y el total es la suma', async () => {
    const r = await crearMockMetricasApi().visitasPorPeriodo(
      { desde: '2026-10-01', hasta: '2026-10-07' },
      'DIA',
    );
    expect(r.serie).toHaveLength(7);
    expect(r.serie[0].inicio).toBe('2026-10-01');
    expect(r.total).toBe(suma(r.serie));
    expect(r.agrupacion).toBe('DIA');
  });

  it('MES agrupa por día 1 y el primer cubo puede empezar antes de desde', async () => {
    const r = await crearMockMetricasApi().visitasPorPeriodo(
      { desde: '2026-10-15', hasta: '2026-11-03' },
      'MES',
    );
    expect(r.serie.map((c) => c.inicio)).toEqual(['2026-10-01', '2026-11-01']);
    expect(r.total).toBe(suma(r.serie));
  });

  it('SEMANA agrupa por lunes', async () => {
    const r = await crearMockMetricasApi().visitasPorPeriodo(
      { desde: '2026-10-21', hasta: '2026-11-03' },
      'SEMANA',
    );
    expect(r.serie.map((c) => c.inicio)).toEqual([
      '2026-10-19',
      '2026-10-26',
      '2026-11-02',
    ]);
  });

  it('devuelve siempre los mismos valores para el mismo rango', async () => {
    const api = crearMockMetricasApi();
    const rango = { desde: '2026-10-01', hasta: '2026-10-28' };
    const a = await api.visitasPorPeriodo(rango, 'DIA');
    const b = await api.visitasPorPeriodo(rango, 'DIA');
    expect(b).toEqual(a);
  });
});
