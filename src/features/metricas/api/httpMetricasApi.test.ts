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
});
