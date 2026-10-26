import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/app/routes';
import { renderWithRouter } from '@/test/renderWithRouter';

function respuesta(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

describe('RegistroPage', () => {
  const fetchMock = vi.fn();
  beforeEach(() => vi.stubGlobal('fetch', fetchMock));
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  async function completar(user: ReturnType<typeof userEvent.setup>, rol?: string) {
    await user.type(screen.getByLabelText('Correo'), 'nuevo@correo.com');
    await user.type(screen.getByLabelText('Contraseña'), 'clavesegura1');
    if (rol) await user.click(screen.getByRole('radio', { name: new RegExp(rol) }));
  }

  it('crea la cuenta con el rol elegido y lleva al login con un aviso', async () => {
    fetchMock.mockResolvedValueOnce(
      respuesta(201, {
        id: '9',
        correo: 'nuevo@correo.com',
        rolPerfil: 'PRACTICANTE',
        rol: 'USUARIO',
      }),
    );
    const user = userEvent.setup();
    renderWithRouter(routes, ['/registro']);

    await completar(user, 'Practicante');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(
      await screen.findByRole('heading', { name: 'Inicia sesión' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Cuenta creada');
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toEqual({
      correo: 'nuevo@correo.com',
      password: 'clavesegura1',
      rolPerfil: 'PRACTICANTE',
    });
  });

  it('pide seleccionar un rol y no llama a la API', async () => {
    const user = userEvent.setup();
    renderWithRouter(routes, ['/registro']);

    await completar(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(screen.getByText('Selecciona cómo vas a usar el atlas.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rechaza contraseñas cortas', async () => {
    const user = userEvent.setup();
    renderWithRouter(routes, ['/registro']);

    await user.type(screen.getByLabelText('Correo'), 'nuevo@correo.com');
    await user.type(screen.getByLabelText('Contraseña'), 'corta');
    await user.click(screen.getByRole('radio', { name: /Estudiante/ }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(screen.getByText('Usa al menos 8 caracteres.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('indica en el campo cuando el correo ya está en uso', async () => {
    fetchMock.mockResolvedValueOnce(respuesta(409, { message: 'Correo duplicado' }));
    const user = userEvent.setup();
    renderWithRouter(routes, ['/registro']);

    await completar(user, 'Estudiante');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText('Ese correo ya está en uso.')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo')).toHaveAttribute('aria-invalid', 'true');
  });
});
