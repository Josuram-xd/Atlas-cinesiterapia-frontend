import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSession } from '@/features/auth/sessionStore';
import { authDemo } from '@/test/fixtures';
import { limpiarCachesDeDatos } from './limpiarCaches';
import { iniciarPwa } from './registro';

vi.mock('virtual:pwa-register', () => ({ registerSW: vi.fn() }));
vi.mock('./limpiarCaches', () => ({ limpiarCachesDeDatos: vi.fn() }));

afterEach(() => vi.mocked(limpiarCachesDeDatos).mockClear());

describe('iniciarPwa: limpieza de datos guardados', () => {
  it('borra al iniciar sesión y al cerrarla, no al refrescar la sesión', () => {
    useSession.setState({ estado: 'anonimo', usuario: null });
    iniciarPwa();
    vi.mocked(limpiarCachesDeDatos).mockClear();

    useSession.getState().iniciar(authDemo());
    expect(limpiarCachesDeDatos).toHaveBeenCalledOnce();

    useSession.setState({ usuario: authDemo().usuario }); // mismo estado: nada
    expect(limpiarCachesDeDatos).toHaveBeenCalledOnce();

    useSession.setState({ estado: 'anonimo', usuario: null });
    expect(limpiarCachesDeDatos).toHaveBeenCalledTimes(2);
  });
});
