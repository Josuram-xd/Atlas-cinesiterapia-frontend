import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/app/routes';
import { renderWithRouter } from '@/test/renderWithRouter';

function respuesta(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), { status });
}

describe('recuperar contraseña', () => {
  const fetchMock = vi.fn();
  beforeEach(() => vi.stubGlobal('fetch', fetchMock));
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('muestra la confirmación genérica con un correo registrado', async () => {
    fetchMock.mockResolvedValueOnce(respuesta(204));
    const user = userEvent.setup();
    renderWithRouter(routes, ['/recuperar']);

    await user.type(screen.getByLabelText('Correo'), 'ana@correo.com');
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Si ese correo está registrado',
    );
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/auth\/recuperar$/);
  });

  it('muestra el mismo mensaje aunque el servidor diga que el correo no existe', async () => {
    fetchMock.mockResolvedValueOnce(respuesta(404, { message: 'No existe' }));
    const user = userEvent.setup();
    renderWithRouter(routes, ['/recuperar']);

    await user.type(screen.getByLabelText('Correo'), 'noexiste@correo.com');
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    const aviso = await screen.findByRole('status');
    expect(aviso).toHaveTextContent('Si ese correo está registrado');
    expect(aviso).not.toHaveTextContent('No existe');
  });

  it('valida el correo antes de enviar', async () => {
    const user = userEvent.setup();
    renderWithRouter(routes, ['/recuperar']);
    await user.type(screen.getByLabelText('Correo'), 'no-es-correo');
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));
    expect(screen.getByText(/no parece válido/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('restablecer contraseña', () => {
  const fetchMock = vi.fn();
  beforeEach(() => vi.stubGlobal('fetch', fetchMock));
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('cambia la contraseña con el token del enlace y lleva al login', async () => {
    fetchMock.mockResolvedValueOnce(respuesta(204));
    const user = userEvent.setup();
    renderWithRouter(routes, ['/restablecer?token=abc123']);

    await user.type(screen.getByLabelText('Contraseña nueva'), 'nuevaclave1');
    await user.type(screen.getByLabelText('Confirma la contraseña'), 'nuevaclave1');
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }));

    expect(
      await screen.findByRole('heading', { name: 'Inicia sesión' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Contraseña actualizada');
    expect(
      JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string),
    ).toEqual({
      token: 'abc123',
      nuevaPassword: 'nuevaclave1',
    });
  });

  it('no envía si las contraseñas no coinciden', async () => {
    const user = userEvent.setup();
    renderWithRouter(routes, ['/restablecer?token=abc123']);

    await user.type(screen.getByLabelText('Contraseña nueva'), 'nuevaclave1');
    await user.type(screen.getByLabelText('Confirma la contraseña'), 'otraclave22');
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }));

    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('ofrece pedir otro enlace cuando el token venció', async () => {
    fetchMock.mockResolvedValueOnce(
      respuesta(400, {
        code: 'TOKEN_INVALIDO',
        message: 'El enlace no es valido o ya expiro',
      }),
    );
    const user = userEvent.setup();
    renderWithRouter(routes, ['/restablecer?token=viejo']);

    await user.type(screen.getByLabelText('Contraseña nueva'), 'nuevaclave1');
    await user.type(screen.getByLabelText('Confirma la contraseña'), 'nuevaclave1');
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('El enlace venció');
    expect(screen.getByRole('link', { name: 'Pedir un enlace nuevo' })).toHaveAttribute(
      'href',
      '/recuperar',
    );
  });

  it('un error de validación no se confunde con un enlace vencido', async () => {
    fetchMock.mockResolvedValueOnce(
      respuesta(400, {
        code: 'VALIDATION_ERROR',
        message: 'Datos de entrada invalidos',
        fieldErrors: [{ field: 'nuevaPassword', message: 'entre 8 y 72' }],
      }),
    );
    const user = userEvent.setup();
    renderWithRouter(routes, ['/restablecer?token=abc123']);

    await user.type(screen.getByLabelText('Contraseña nueva'), 'nuevaclave1');
    await user.type(screen.getByLabelText('Confirma la contraseña'), 'nuevaclave1');
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('entre 8 y 72');
    expect(screen.queryByRole('link', { name: 'Pedir un enlace nuevo' })).toBeNull();
  });

  it('avisa cuando el enlace no trae token', () => {
    renderWithRouter(routes, ['/restablecer']);
    expect(
      screen.getByRole('heading', { name: 'Enlace incompleto' }),
    ).toBeInTheDocument();
  });
});
