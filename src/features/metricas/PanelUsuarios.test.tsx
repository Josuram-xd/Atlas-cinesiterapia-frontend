import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError, type UsuariosActivos } from '@/lib/api';
import { renderWithRouter } from '@/test/renderWithRouter';
import { MetricasApiProvider } from './api/MetricasApiProvider';
import { PanelUsuarios } from './PanelUsuarios';
import { crearMockMetricasApi } from './api/mockMetricasApi';

const RANGO = { desde: '2026-10-01', hasta: '2026-10-28' };

const activos: UsuariosActivos = {
  ...RANGO,
  total: 9,
  porRol: [
    { rol: 'ESTUDIANTE', usuarios: 5 },
    { rol: 'PROFESIONAL', usuarios: 2 },
    { rol: 'PRACTICANTE', usuarios: 2 },
    { rol: 'VISITANTE', usuarios: 0 },
  ],
};

function montar(rango: typeof RANGO | null, consulta: () => Promise<UsuariosActivos>) {
  const api = crearMockMetricasApi();
  const espia = vi.spyOn(api, 'usuariosActivos').mockImplementation(consulta);
  renderWithRouter(
    [
      {
        path: '/',
        element: (
          <MetricasApiProvider api={api}>
            <PanelUsuarios rango={rango} />
          </MetricasApiProvider>
        ),
      },
    ],
    ['/'],
  );
  return espia;
}

describe('PanelUsuarios', () => {
  it('muestra el total y una fila por rol, también los que tienen cero', async () => {
    montar(RANGO, () => Promise.resolve(activos));
    expect(await screen.findByText('9 usuarios activos')).toBeInTheDocument();
    const filas = screen.getAllByRole('listitem');
    expect(filas).toHaveLength(4);
    expect(within(filas[0]).getByText('Estudiante')).toBeInTheDocument();
    expect(within(filas[0]).getByText('5')).toBeInTheDocument();
    expect(within(filas[3]).getByText('Visitante')).toBeInTheDocument();
    expect(within(filas[3]).getByText('0')).toBeInTheDocument();
  });

  it('en singular dice «1 usuario activo»', async () => {
    montar(RANGO, () =>
      Promise.resolve({
        ...activos,
        total: 1,
        porRol: [{ rol: 'ESTUDIANTE', usuarios: 1 }],
      }),
    );
    expect(await screen.findByText('1 usuario activo')).toBeInTheDocument();
  });

  it('sin actividad en el periodo lo dice', async () => {
    montar(RANGO, () =>
      Promise.resolve({
        ...activos,
        total: 0,
        porRol: activos.porRol.map((r) => ({ ...r, usuarios: 0 })),
      }),
    );
    expect(
      await screen.findByText('No hubo usuarios activos en este periodo.'),
    ).toBeInTheDocument();
  });

  it('muestra cargando mientras llega la respuesta', () => {
    montar(RANGO, () => new Promise(() => {}));
    expect(screen.getByRole('status')).toHaveTextContent('Cargando los usuarios activos');
  });

  it('muestra el error con reintento que vuelve a consultar', async () => {
    const user = userEvent.setup();
    const consulta = vi
      .fn()
      .mockRejectedValueOnce(new ApiError(500, { message: 'caído' }))
      .mockResolvedValue(activos);
    const espia = montar(RANGO, consulta);
    expect(
      await screen.findByText('El servidor tuvo un problema. Inténtalo en unos minutos.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('9 usuarios activos')).toBeInTheDocument();
    expect(espia).toHaveBeenCalledTimes(2);
  });

  it('con un rango no válido no consulta', () => {
    const espia = montar(null, () => Promise.resolve(activos));
    expect(
      screen.getByText('Corrige las fechas para ver los usuarios activos.'),
    ).toBeInTheDocument();
    expect(espia).not.toHaveBeenCalled();
  });
});
