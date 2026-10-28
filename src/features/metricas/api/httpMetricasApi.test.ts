import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { httpMetricasApi, RUTA_PING } from './httpMetricasApi';

afterEach(() => vi.restoreAllMocks());

describe('httpMetricasApi', () => {
  it('el ping va a la ruta real del backend y sin cuerpo', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ sesionId: 1 });
    await httpMetricasApi.registrarPing();
    expect(RUTA_PING).toBe('/metricas/sesion/ping');
    expect(post).toHaveBeenCalledWith('/metricas/sesion/ping');
  });

  it('la consulta de visitas lleva el rango y la agrupación', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({});
    const signal = new AbortController().signal;
    await httpMetricasApi.visitasPorPeriodo(
      { desde: '2026-10-01', hasta: '2026-10-28' },
      'SEMANA',
      signal,
    );
    expect(get).toHaveBeenCalledWith(
      '/admin/metricas/visitas?desde=2026-10-01&hasta=2026-10-28&agrupacion=SEMANA',
      { signal },
    );
  });
});
