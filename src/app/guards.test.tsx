import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSession } from '@/features/auth/sessionStore';
import type { Usuario } from '@/lib/api';
import { tokenStorage } from '@/lib/api';
import { renderWithRouter } from '@/test/renderWithRouter';
import { routes } from './routes';
import { adminDemo, authDemo, usuarioDemo } from '@/test/fixtures';
import { crearMockAdminApi } from '@/features/admin/api/mockAdminApi';
import { crearMockAtlasApi } from '@/features/atlas/api/mockAtlasApi';

const usuario = usuarioDemo;
const admin: Usuario = adminDemo;

function conSesion(u: Usuario) {
  useSession.getState().iniciar(authDemo({ usuario: u }));
}

describe('guardas de rutas', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
  });
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('redirige al login cuando no hay sesión (HU-16)', async () => {
    renderWithRouter(routes, ['/']);
    expect(
      await screen.findByRole('heading', { name: 'Inicia sesión' }),
    ).toBeInTheDocument();
  });

  it('vuelve a la ruta pedida después de iniciar sesión', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ accessToken: 'a', refreshToken: 'r', usuario: admin }),
        {
          status: 200,
        },
      ),
    );
    const user = userEvent.setup();
    renderWithRouter(routes, ['/admin']);

    await user.type(await screen.findByLabelText('Correo'), 'admin@correo.com');
    await user.type(screen.getByLabelText('Contraseña'), 'clavesegura1');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(
      await screen.findByRole('heading', { name: 'Fichas de ejercicios' }),
    ).toBeInTheDocument();
  });

  it('con sesión, el login redirige al atlas', async () => {
    conSesion(usuario);
    renderWithRouter(routes, ['/login']);
    expect(
      await screen.findByRole('heading', { name: /elige una región/i }),
    ).toBeInTheDocument();
  });

  it('un usuario común no entra a la ruta de administración', async () => {
    conSesion(usuario);
    renderWithRouter(routes, ['/admin']);
    expect(
      await screen.findByRole('heading', { name: 'Sin permiso' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Administración' }),
    ).not.toBeInTheDocument();
  });

  it('un administrador sí entra y ve el enlace de administración', async () => {
    conSesion(admin);
    renderWithRouter(routes, ['/admin']);
    expect(
      await screen.findByRole('heading', { name: 'Fichas de ejercicios' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Administración' })).toBeInTheDocument();
  });

  it('cerrar sesión limpia los tokens, avisa al backend y vuelve al login', async () => {
    conSesion(usuario);
    const user = userEvent.setup();
    renderWithRouter(routes, ['/']);

    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }));

    expect(
      await screen.findByRole('heading', { name: 'Inicia sesión' }),
    ).toBeInTheDocument();
    expect(tokenStorage.get()).toBeNull();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/auth\/logout$/);
    expect(
      JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string),
    ).toEqual({
      refreshToken: 'r',
    });
  });
});

describe('rutas de administración de fichas', () => {
  it.each(['/admin/fichas/nueva', '/admin/fichas/3'])(
    'un usuario común no entra a %s ni dispara llamadas de administración',
    async (ruta) => {
      conSesion(usuario);
      const adminApi = crearMockAdminApi();
      const espia = vi.spyOn(adminApi, 'obtenerFicha');
      renderWithRouter(routes, [ruta], crearMockAtlasApi(), adminApi);
      expect(
        await screen.findByRole('heading', { name: 'Sin permiso' }),
      ).toBeInTheDocument();
      expect(espia).not.toHaveBeenCalled();
    },
  );

  it('un administrador entra a la edición de una ficha', async () => {
    conSesion(admin);
    renderWithRouter(routes, ['/admin/fichas/nueva']);
    expect(
      await screen.findByRole('heading', { name: 'Nueva ficha' }),
    ).toBeInTheDocument();
  });
});
