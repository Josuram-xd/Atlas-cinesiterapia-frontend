import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/app/routes';
import { tokenStorage } from '@/lib/api';
import { renderWithRouter } from '@/test/renderWithRouter';
import { authDemo } from '@/test/fixtures';

function respuesta(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

describe('LoginPage', () => {
  const fetchMock = vi.fn();
  beforeEach(() => vi.stubGlobal('fetch', fetchMock));
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('inicia sesión con credenciales correctas y entra al atlas', async () => {
    fetchMock.mockResolvedValueOnce(respuesta(200, authDemo()));
    const user = userEvent.setup();
    renderWithRouter(routes, ['/login']);

    await user.type(screen.getByLabelText('Correo'), 'ana@correo.com');
    await user.type(screen.getByLabelText('Contraseña'), 'secreto123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /elige una región/i }),
      ).toBeInTheDocument(),
    );
    expect(tokenStorage.get()).toEqual({ accessToken: 'a', refreshToken: 'r' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/auth\/login$/);
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      correo: 'ana@correo.com',
      password: 'secreto123',
    });
  });

  it('muestra credenciales inválidas cuando el servidor responde 401', async () => {
    fetchMock.mockResolvedValueOnce(respuesta(401, { message: 'Bad credentials' }));
    const user = userEvent.setup();
    renderWithRouter(routes, ['/login']);

    await user.type(screen.getByLabelText('Correo'), 'ana@correo.com');
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Correo o contraseña incorrectos.',
    );
    expect(tokenStorage.get()).toBeNull();
  });

  it('valida los campos antes de llamar a la API', async () => {
    const user = userEvent.setup();
    renderWithRouter(routes, ['/login']);

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.getByText('Escribe tu correo.')).toBeInTheDocument();
    expect(screen.getByText('Escribe tu contraseña.')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo')).toHaveAttribute('aria-invalid', 'true');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('enlaza a registro y recuperación', () => {
    renderWithRouter(routes, ['/login']);
    expect(screen.getByRole('link', { name: 'Crea tu cuenta' })).toHaveAttribute(
      'href',
      '/registro',
    );
    expect(screen.getByRole('link', { name: 'Olvidé mi contraseña' })).toHaveAttribute(
      'href',
      '/recuperar',
    );
  });
});
