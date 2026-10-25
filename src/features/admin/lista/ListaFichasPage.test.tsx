import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '@/test/renderWithRouter';
import { crearMockAdminApi } from '../api/mockAdminApi';
import { crearMockAtlasApi } from '../../atlas/api/mockAtlasApi';
import { ListaFichasPage } from './ListaFichasPage';

function montar(ruta = '/admin', api = crearMockAdminApi()) {
  const utils = renderWithRouter(
    [{ path: '/admin', element: <ListaFichasPage /> }],
    [ruta],
    crearMockAtlasApi(),
    api,
  );
  return { api, ...utils };
}

async function filas() {
  return screen.findAllByRole('link', { name: /actualizada el/ });
}

describe('ListaFichasPage', () => {
  it('lista las fichas de todas las personas administradoras con su estado', async () => {
    montar();
    const enlaces = await filas();
    expect(enlaces).toHaveLength(4);
    expect(
      screen.getAllByText('profe@correo.com', { exact: false }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText('admin@correo.com', { exact: false }).length,
    ).toBeGreaterThan(0);
    expect(
      within(screen.getByRole('link', { name: /Elevación activa/ })).getByText(
        'Borrador',
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('link', { name: /Rodillas al pecho/ })).getByText(
        'Archivada',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('4 fichas')).toBeInTheDocument();
  });

  it('cada ficha enlaza a su edición', async () => {
    montar();
    const enlace = await screen.findByRole('link', { name: /Péndulo de Codman/ });
    expect(enlace).toHaveAttribute('href', '/admin/fichas/2');
    expect(screen.getByRole('link', { name: 'Nueva ficha' })).toHaveAttribute(
      'href',
      '/admin/fichas/nueva',
    );
  });

  it('filtra por estado y lo guarda en la URL', async () => {
    const user = userEvent.setup();
    const { router } = montar();
    await filas();
    await user.selectOptions(screen.getByLabelText('Estado'), 'ARCHIVADO');
    await waitFor(() =>
      expect(screen.getAllByRole('link', { name: /actualizada el/ })).toHaveLength(1),
    );
    expect(screen.getByRole('link', { name: /Rodillas al pecho/ })).toBeInTheDocument();
    expect(router.state.location.search).toContain('estado=ARCHIVADO');
  });

  it('filtra por región y por categoría', async () => {
    const user = userEvent.setup();
    montar();
    await filas();
    await screen.findAllByRole('option', { name: 'Rodilla' });
    await user.selectOptions(screen.getByLabelText('Región'), '11');
    await waitFor(() =>
      expect(screen.getAllByRole('link', { name: /actualizada el/ })).toHaveLength(1),
    );
    expect(
      screen.getByRole('link', { name: /Flexoextensión pasiva/ }),
    ).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Región'), '');
    await screen.findByRole('option', { name: /Estiramiento/ });
    await user.selectOptions(screen.getByLabelText('Categoría'), '5');
    await waitFor(() =>
      expect(screen.getAllByRole('link', { name: /actualizada el/ })).toHaveLength(1),
    );
    expect(screen.getByRole('link', { name: /Rodillas al pecho/ })).toBeInTheDocument();
  });

  it('busca por nombre con debounce', async () => {
    const user = userEvent.setup();
    const api = crearMockAdminApi();
    const espia = vi.spyOn(api, 'listarFichas');
    montar('/admin', api);
    await filas();
    await user.type(screen.getByLabelText('Nombre'), 'pendulo');
    await waitFor(() =>
      expect(screen.getAllByRole('link', { name: /actualizada el/ })).toHaveLength(1),
    );
    expect(screen.getByRole('link', { name: /Péndulo de Codman/ })).toBeInTheDocument();
    // una consulta por la carga inicial y una sola por el texto completo, no una por tecla
    expect(espia.mock.calls.filter((c) => c[0].q).length).toBe(1);
  });

  it('lee los filtros de la URL al entrar', async () => {
    montar('/admin?estado=BORRADOR');
    const enlaces = await filas();
    expect(enlaces).toHaveLength(1);
    expect(screen.getByLabelText('Estado')).toHaveValue('BORRADOR');
  });

  it('explica cuando ninguna ficha coincide', async () => {
    montar('/admin?estado=BORRADOR&categoriaId=9');
    expect(
      await screen.findByText('Ninguna ficha coincide con los filtros.'),
    ).toBeInTheDocument();
  });

  it('pagina cuando hay más fichas que el tamaño de página', async () => {
    const user = userEvent.setup();
    const api = crearMockAdminApi();
    const original = api.listarFichas.bind(api);
    api.listarFichas = async (f, s) => {
      const p = await original({ ...f, size: 2 }, s);
      return { ...p, size: 20 };
    };
    montar('/admin', api);
    expect(await screen.findByText('Página 1 de 2')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Paginación' });
    expect(within(nav).getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    await user.click(within(nav).getByRole('button', { name: 'Página siguiente' }));
    expect(await screen.findByText('Página 2 de 2')).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
  });

  it('muestra el error con reintento si falla la carga', async () => {
    const api = crearMockAdminApi();
    api.listarFichas = () => Promise.reject(new Error('caído'));
    montar('/admin', api);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
