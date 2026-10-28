import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api';
import { ModeracionApiProvider } from './api/ModeracionApiProvider';
import { crearMockModeracionApi } from './api/mockModeracionApi';
import type { ModeracionApi } from './api/moderacionApi';
import { PalabrasOfensivasPage } from './PalabrasOfensivasPage';

function montar(api: ModeracionApi = crearMockModeracionApi()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <ModeracionApiProvider api={api}>
        <PalabrasOfensivasPage />
      </ModeracionApiProvider>
    </QueryClientProvider>,
  );
  return api;
}

const palabrasEnPantalla = () =>
  screen.getAllByRole('listitem').map((li) => li.querySelector('span')?.textContent);

describe('PalabrasOfensivasPage: lista', () => {
  it('muestra las palabras en orden alfabético con el total', async () => {
    montar();
    expect(await screen.findByText('4 palabras')).toBeInTheDocument();
    expect(palabrasEnPantalla()).toEqual([
      'hijo de puta',
      'idiota',
      'imbecil',
      'maldito',
    ]);
  });

  it('filtra por búsqueda sin tildes ni mayúsculas', async () => {
    const user = userEvent.setup();
    montar();
    await screen.findByText('4 palabras');
    await user.type(screen.getByLabelText('Buscar en la lista'), 'IMBÉ');
    await vi.waitFor(() => expect(palabrasEnPantalla()).toEqual(['imbecil']));
  });

  it('muestra el aviso cuando la búsqueda no encuentra nada', async () => {
    const user = userEvent.setup();
    montar();
    await screen.findByText('4 palabras');
    await user.type(screen.getByLabelText('Buscar en la lista'), 'zzz');
    expect(
      await screen.findByText('Ninguna palabra coincide con la búsqueda.'),
    ).toBeInTheDocument();
  });
});

describe('PalabrasOfensivasPage: agregar', () => {
  it('agrega una palabra, avisa y la muestra en la lista', async () => {
    const user = userEvent.setup();
    montar();
    await screen.findByText('4 palabras');
    await user.type(screen.getByLabelText('Nueva palabra'), 'Estúpido');
    await user.click(screen.getByRole('button', { name: 'Agregar palabra' }));
    expect(await screen.findByText('Palabra «Estúpido» agregada.')).toBeInTheDocument();
    expect(await screen.findByText('5 palabras')).toBeInTheDocument();
    expect(screen.getByLabelText('Nueva palabra')).toHaveValue('');
  });

  it('no envía una palabra vacía', async () => {
    const api = crearMockModeracionApi();
    const agregar = vi.spyOn(api, 'agregarPalabra');
    const user = userEvent.setup();
    montar(api);
    await screen.findByText('4 palabras');
    await user.click(screen.getByRole('button', { name: 'Agregar palabra' }));
    expect(screen.getByText('Escribe una palabra.')).toBeInTheDocument();
    expect(agregar).not.toHaveBeenCalled();
  });

  it('una palabra repetida se rechaza aunque cambie la forma (PALABRA_DUPLICADA)', async () => {
    const user = userEvent.setup();
    montar();
    await screen.findByText('4 palabras');
    const campo = screen.getByLabelText(/Nueva palabra/);
    await user.type(campo, 'IDIOTA');
    await user.click(screen.getByRole('button', { name: 'Agregar palabra' }));
    expect(await screen.findByText(/ya está en la lista/)).toBeInTheDocument();
    expect(campo).toHaveValue('IDIOTA');
    expect(campo).toHaveAttribute('aria-invalid', 'true');
  });

  it('una palabra de menos de 3 letras se rechaza (PALABRA_INVALIDA)', async () => {
    const user = userEvent.setup();
    montar();
    await screen.findByText('4 palabras');
    await user.type(screen.getByLabelText(/Nueva palabra/), 'ab');
    await user.click(screen.getByRole('button', { name: 'Agregar palabra' }));
    expect(
      await screen.findByText('Una palabra debe tener al menos 3 letras.'),
    ).toBeInTheDocument();
  });
});

describe('PalabrasOfensivasPage: eliminar', () => {
  it('pide confirmación y luego quita la palabra', async () => {
    const api = crearMockModeracionApi();
    const eliminar = vi.spyOn(api, 'eliminarPalabra');
    const user = userEvent.setup();
    montar(api);
    await screen.findByText('4 palabras');
    await user.click(screen.getByRole('button', { name: 'Eliminar «idiota»' }));
    expect(eliminar).not.toHaveBeenCalled();
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Eliminar palabra',
      }),
    );
    expect(eliminar).toHaveBeenCalledWith(2);
    expect(await screen.findByText('Palabra «idiota» eliminada.')).toBeInTheDocument();
    expect(await screen.findByText('3 palabras')).toBeInTheDocument();
    expect(palabrasEnPantalla()).not.toContain('idiota');
  });

  it('cancelar la confirmación no elimina nada', async () => {
    const api = crearMockModeracionApi();
    const eliminar = vi.spyOn(api, 'eliminarPalabra');
    const user = userEvent.setup();
    montar(api);
    await screen.findByText('4 palabras');
    await user.click(screen.getByRole('button', { name: 'Eliminar «idiota»' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(eliminar).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('si la palabra ya no existe, el diálogo explica el motivo', async () => {
    const api = crearMockModeracionApi();
    api.eliminarPalabra = () =>
      Promise.reject(new ApiError(404, { code: 'PALABRA_NO_ENCONTRADA' }));
    const user = userEvent.setup();
    montar(api);
    await screen.findByText('4 palabras');
    await user.click(screen.getByRole('button', { name: 'Eliminar «idiota»' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar palabra' }));
    expect(
      await screen.findByText('Esa palabra ya no está en la lista.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});
