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

describe('httpMetricasApi: ranking de ejercicios', () => {
  it('pide el ranking del rango con límite 10', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({});
    await httpMetricasApi.ejerciciosMasConsultados({
      desde: '2026-10-01',
      hasta: '2026-10-28',
    });
    expect(get).toHaveBeenCalledWith(
      '/admin/metricas/ejercicios-mas-consultados?desde=2026-10-01&hasta=2026-10-28',
      { signal: undefined },
    );
  });
});

describe('httpMetricasApi: usuarios activos', () => {
  it('pide los usuarios activos del rango', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({});
    await httpMetricasApi.usuariosActivos({ desde: '2026-10-01', hasta: '2026-10-28' });
    expect(get).toHaveBeenCalledWith(
      '/admin/metricas/usuarios-activos?desde=2026-10-01&hasta=2026-10-28',
      { signal: undefined },
    );
  });
});

describe('httpMetricasApi: tiempo promedio', () => {
  it('pide el tiempo promedio del rango', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({});
    await httpMetricasApi.tiempoPromedio({ desde: '2026-10-01', hasta: '2026-10-28' });
    expect(get).toHaveBeenCalledWith(
      '/admin/metricas/tiempo-promedio?desde=2026-10-01&hasta=2026-10-28',
      { signal: undefined },
    );
  });
});
