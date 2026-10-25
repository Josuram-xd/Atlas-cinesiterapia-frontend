import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, setSessionExpiredHandler } from './client';
import { ApiError, NetworkError } from './errors';
import { tokenStorage } from './tokenStorage';
import { authDemo } from '@/test/fixtures';

function json(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

function bearer(init: unknown): string | undefined {
  return ((init as RequestInit).headers as Record<string, string>).Authorization;
}

describe('cliente HTTP', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    tokenStorage.set({ accessToken: 'viejo', refreshToken: 'r1' });
  });
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    setSessionExpiredHandler(null);
  });

  it('envía el access token en Authorization', async () => {
    fetchMock.mockResolvedValueOnce(json(200, { ok: true }));
    await api.get('/regiones');
    expect(bearer(fetchMock.mock.calls[0][1])).toBe('Bearer viejo');
  });

  it('refresca el token ante un 401 y reintenta la petición', async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, { message: 'expirado' }))
      .mockResolvedValueOnce(
        json(200, authDemo({ accessToken: 'nuevo', refreshToken: 'r2' })),
      )
      .mockResolvedValueOnce(json(200, [{ id: 1 }]));
    const result = await api.get('/regiones');
    expect(result).toEqual([{ id: 1 }]);
    expect(tokenStorage.get()).toEqual({ accessToken: 'nuevo', refreshToken: 'r2' });
    expect(bearer(fetchMock.mock.calls[2][1])).toBe('Bearer nuevo');
  });

  it('comparte un único refresh entre peticiones simultáneas', async () => {
    fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
      if (url.endsWith('/auth/refresh')) {
        return json(200, authDemo({ accessToken: 'nuevo', refreshToken: 'r2' }));
      }
      return bearer(init) === 'Bearer viejo' ? json(401) : json(200, { ok: true });
    });
    await Promise.all([api.get('/a'), api.get('/b')]);
    const refreshCalls = fetchMock.mock.calls.filter(([u]) =>
      String(u).endsWith('/auth/refresh'),
    );
    expect(refreshCalls).toHaveLength(1);
  });

  it('limpia la sesión y avisa si el refresh es rechazado', async () => {
    const expired = vi.fn();
    setSessionExpiredHandler(expired);
    fetchMock
      .mockResolvedValueOnce(json(401))
      .mockResolvedValueOnce(json(401, { message: 'refresh inválido' }));
    await expect(api.get('/regiones')).rejects.toBeInstanceOf(ApiError);
    expect(tokenStorage.get()).toBeNull();
    expect(expired).toHaveBeenCalledOnce();
  });

  it('conserva la sesión si el refresh falla por un error transitorio (503 o 429)', async () => {
    const expired = vi.fn();
    setSessionExpiredHandler(expired);
    fetchMock
      .mockResolvedValueOnce(json(401))
      .mockResolvedValueOnce(json(503, { code: 'INTERNAL_ERROR' }));
    await expect(api.get('/regiones')).rejects.toBeInstanceOf(ApiError);
    expect(tokenStorage.get()).not.toBeNull();
    expect(expired).not.toHaveBeenCalled();
  });

  it('cierra la sesión si el backend responde SESION_EXPIRADA al refrescar', async () => {
    const expired = vi.fn();
    setSessionExpiredHandler(expired);
    fetchMock
      .mockResolvedValueOnce(json(401))
      .mockResolvedValueOnce(json(401, { code: 'SESION_EXPIRADA' }));
    await expect(api.get('/regiones')).rejects.toBeInstanceOf(ApiError);
    expect(expired).toHaveBeenCalledOnce();
  });

  it('no reintenta en endpoints públicos (auth: false)', async () => {
    fetchMock.mockResolvedValueOnce(
      json(401, {
        code: 'CREDENCIALES_INVALIDAS',
        message: 'Correo o contrasena incorrectos',
      }),
    );
    await expect(api.post('/auth/login', {}, { auth: false })).rejects.toMatchObject({
      status: 401,
      code: 'CREDENCIALES_INVALIDAS',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('traduce fallos de red a NetworkError', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('failed'));
    await expect(api.get('/x')).rejects.toBeInstanceOf(NetworkError);
  });
});
