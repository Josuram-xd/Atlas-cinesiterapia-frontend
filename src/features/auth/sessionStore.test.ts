import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tokenStorage, type Usuario } from '@/lib/api';
import { useSession } from './sessionStore';

const usuario: Usuario = {
  id: '1',
  correo: 'ana@correo.com',
  rolPerfil: 'ESTUDIANTE',
  rol: 'USUARIO',
};

function json(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

describe('store de sesión', () => {
  const fetchMock = vi.fn();
  beforeEach(() => vi.stubGlobal('fetch', fetchMock));
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('iniciar guarda tokens y usuario', () => {
    useSession.getState().iniciar({ accessToken: 'a', refreshToken: 'r', usuario });
    expect(useSession.getState().estado).toBe('autenticado');
    expect(useSession.getState().usuario).toEqual(usuario);
    expect(tokenStorage.get()).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });

  it('recuperar renueva la sesión guardada con un refresh', async () => {
    tokenStorage.set({ accessToken: 'viejo', refreshToken: 'r1' });
    fetchMock.mockResolvedValueOnce(
      json(200, { accessToken: 'nuevo', refreshToken: 'r2', usuario }),
    );
    await useSession.getState().recuperar();
    expect(useSession.getState().estado).toBe('autenticado');
    expect(useSession.getState().usuario).toEqual(usuario);
    expect(tokenStorage.get()?.refreshToken).toBe('r2');
  });

  it('recuperar pasa a anónimo si el refresh es rechazado', async () => {
    tokenStorage.set({ accessToken: 'viejo', refreshToken: 'r1' });
    fetchMock.mockResolvedValueOnce(json(401, { message: 'inválido' }));
    await useSession.getState().recuperar();
    expect(useSession.getState().estado).toBe('anonimo');
    expect(tokenStorage.get()).toBeNull();
  });

  it('recuperar sin red conserva la sesión con el usuario guardado', async () => {
    useSession.getState().iniciar({ accessToken: 'a', refreshToken: 'r', usuario });
    useSession.setState({ estado: 'iniciando', usuario: null });
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    await useSession.getState().recuperar();
    expect(useSession.getState().estado).toBe('autenticado');
    expect(useSession.getState().usuario).toEqual(usuario);
  });

  it('recuperar sin tokens deja la sesión anónima', async () => {
    useSession.setState({ estado: 'iniciando' });
    await useSession.getState().recuperar();
    expect(useSession.getState().estado).toBe('anonimo');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
