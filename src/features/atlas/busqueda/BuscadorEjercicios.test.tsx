import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { crearMockAtlasApi } from '../api/mockAtlasApi';
import { renderAtlas } from '@/test/renderAtlas';
import { BuscadorEjercicios } from './BuscadorEjercicios';

function Ubicacion() {
  return <p data-testid="ruta">{useLocation().pathname}</p>;
}

function montar(api = crearMockAtlasApi()) {
  const user = userEvent.setup();
  renderAtlas(
    <>
      <BuscadorEjercicios retrasoMs={10} />
      <Routes>
        <Route path="*" element={<Ubicacion />} />
      </Routes>
    </>,
    api,
  );
  return { user, campo: screen.getByRole('combobox', { name: /buscar ejercicio/i }) };
}

describe('BuscadorEjercicios', () => {
  it('no consulta con menos de dos letras', async () => {
    const api = crearMockAtlasApi();
    const espia = vi.spyOn(api, 'buscarEjercicios');
    const { user, campo } = montar(api);
    await user.type(campo, 'f');
    await new Promise((r) => setTimeout(r, 60));
    expect(espia).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('espera el debounce y hace una sola consulta con el texto completo', async () => {
    const api = crearMockAtlasApi();
    const espia = vi.spyOn(api, 'buscarEjercicios');
    const { user, campo } = montar(api);
    await user.type(campo, 'puente');
    await screen.findByRole('listbox');
    expect(espia).toHaveBeenCalledTimes(1);
    expect(espia.mock.calls[0][0]).toBe('puente');
  });

  it('lista los resultados con región y categoría', async () => {
    const { user, campo } = montar();
    await user.type(campo, 'flexoext');
    const opciones = await screen.findAllByRole('option');
    expect(opciones[0]).toHaveTextContent('Flexoextensión activa en sedestación');
    expect(opciones[0]).toHaveTextContent('Rodilla');
    expect(campo).toHaveAttribute('aria-expanded', 'true');
  });

  it('al elegir un resultado con clic lleva a la ficha y limpia el campo', async () => {
    const { user, campo } = montar();
    await user.type(campo, 'puente');
    await user.click(await screen.findByRole('option', { name: /Puente isométrico/ }));
    expect(screen.getByTestId('ruta')).toHaveTextContent(/^\/ejercicios\/\d+$/);
    expect(campo).toHaveValue('');
  });

  it('se maneja con flechas y Enter', async () => {
    const { user, campo } = montar();
    await user.type(campo, 'rodilla');
    await screen.findAllByRole('option');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    const activa = screen.getAllByRole('option')[1];
    expect(activa).toHaveAttribute('aria-selected', 'true');
    expect(campo).toHaveAttribute('aria-activedescendant', activa.id);
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('ruta')).toHaveTextContent(/^\/ejercicios\/\d+$/);
  });

  it('Escape cierra la lista', async () => {
    const { user, campo } = montar();
    await user.type(campo, 'puente');
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('avisa cuando no hay coincidencias', async () => {
    const { user, campo } = montar();
    await user.type(campo, 'zzzz');
    expect(await screen.findByText(/sin resultados para/i)).toBeInTheDocument();
  });

  it('muestra el error con reintento si la búsqueda falla', async () => {
    const { user, campo } = montar(crearMockAtlasApi({ fallar: true }));
    await user.type(campo, 'puente');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled(),
    );
  });

  it('limita el texto a 100 caracteres, como el backend', () => {
    const { campo } = montar();
    expect(campo).toHaveAttribute('maxlength', '100');
  });
});
