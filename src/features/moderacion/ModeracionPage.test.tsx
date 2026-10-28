import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api';
import { ModeracionApiProvider } from './api/ModeracionApiProvider';
import { crearMockModeracionApi } from './api/mockModeracionApi';
import type { ModeracionApi } from './api/moderacionApi';
import { ModeracionPage } from './ModeracionPage';

function montar(api: ModeracionApi = crearMockModeracionApi()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <ModeracionApiProvider api={api}>
        <ModeracionPage />
      </ModeracionApiProvider>
    </QueryClientProvider>,
  );
  return api;
}

const articulo = (correo: string) =>
  screen.findByRole('article', { name: `Comentario de ${correo}` });

describe('ModeracionPage: cola', () => {
  it('lista los pendientes, del más antiguo al más reciente, con su motivo', async () => {
    montar();
    expect(await screen.findByText('3 comentarios pendientes')).toBeInTheDocument();
    const primero = (await screen.findAllByRole('article'))[0];
    expect(primero).toHaveAccessibleName('Comentario de luis.rojas@correo.com');
    expect(screen.getAllByText('Ocultado por el filtro automático')).toHaveLength(2);
    expect(screen.getByText('Reportado por 2 personas')).toBeInTheDocument();
    expect(screen.getByText('Reportado por 1 persona')).toBeInTheDocument();
  });

  it('muestra el aviso cuando no hay nada pendiente', async () => {
    const api = crearMockModeracionApi();
    api.listarRevision = async () => ({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    });
    montar(api);
    expect(
      await screen.findByText('No hay comentarios pendientes de revisión.'),
    ).toBeInTheDocument();
  });

  it('muestra el error de carga con la opción de reintentar', async () => {
    const api = crearMockModeracionApi();
    api.listarRevision = () => Promise.reject(new ApiError(500));
    montar(api);
    expect(await screen.findByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});

describe('ModeracionPage: aceptar y eliminar', () => {
  it('aceptar publica el comentario y lo quita de la cola', async () => {
    const api = crearMockModeracionApi();
    const aceptar = vi.spyOn(api, 'aceptar');
    const user = userEvent.setup();
    montar(api);
    const luis = await articulo('luis.rojas@correo.com');
    await user.click(within(luis).getByRole('button', { name: /Aceptar/ }));
    expect(aceptar).toHaveBeenCalledWith(201);
    expect(
      await screen.findByText('Comentario de luis.rojas@correo.com publicado.'),
    ).toBeInTheDocument();
    await vi.waitFor(() =>
      expect(
        screen.queryByRole('article', { name: 'Comentario de luis.rojas@correo.com' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('si aceptar falla, explica el motivo y deja el comentario en la cola', async () => {
    const api = crearMockModeracionApi();
    api.aceptar = () =>
      Promise.reject(new ApiError(404, { code: 'COMENTARIO_NO_ENCONTRADO' }));
    const user = userEvent.setup();
    montar(api);
    const luis = await articulo('luis.rojas@correo.com');
    await user.click(within(luis).getByRole('button', { name: /Aceptar/ }));
    expect(
      await within(luis).findByText(/ya no existe o dejó de estar disponible/),
    ).toBeInTheDocument();
    expect(luis).toBeInTheDocument();
  });

  it('eliminar pide confirmación y luego lo quita de la cola', async () => {
    const api = crearMockModeracionApi();
    const eliminar = vi.spyOn(api, 'eliminar');
    const user = userEvent.setup();
    montar(api);
    const marta = await articulo('marta@correo.com');
    await user.click(within(marta).getByRole('button', { name: /Eliminar/ }));
    expect(eliminar).not.toHaveBeenCalled();
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Eliminar comentario',
      }),
    );
    expect(eliminar).toHaveBeenCalledWith(202);
    expect(await screen.findByText('Comentario eliminado.')).toBeInTheDocument();
    await vi.waitFor(() =>
      expect(
        screen.queryByRole('article', { name: 'Comentario de marta@correo.com' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('cancelar la confirmación no elimina nada', async () => {
    const api = crearMockModeracionApi();
    const eliminar = vi.spyOn(api, 'eliminar');
    const user = userEvent.setup();
    montar(api);
    const marta = await articulo('marta@correo.com');
    await user.click(within(marta).getByRole('button', { name: /Eliminar/ }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(eliminar).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(marta).toBeInTheDocument();
  });

  it('si eliminar falla, el diálogo sigue abierto con el motivo', async () => {
    const api = crearMockModeracionApi();
    api.eliminar = () => Promise.reject(new ApiError(500));
    const user = userEvent.setup();
    montar(api);
    const marta = await articulo('marta@correo.com');
    await user.click(within(marta).getByRole('button', { name: /Eliminar/ }));
    await user.click(screen.getByRole('button', { name: 'Eliminar comentario' }));
    expect(await screen.findByText(/El servidor tuvo un problema/)).toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});
