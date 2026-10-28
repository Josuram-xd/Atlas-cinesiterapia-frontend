import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError, type VisitasPeriodo } from '@/lib/api';
import { renderWithRouter } from '@/test/renderWithRouter';
import { MetricasApiProvider } from './api/MetricasApiProvider';
import { PanelVisitas } from './PanelVisitas';
import { crearMockMetricasApi } from './api/mockMetricasApi';

const RANGO = { desde: '2026-10-01', hasta: '2026-10-03' };

const datos: VisitasPeriodo = {
  ...RANGO,
  agrupacion: 'DIA',
  total: 12,
  serie: [
    { inicio: '2026-10-01', visitas: 5 },
    { inicio: '2026-10-02', visitas: 0 },
    { inicio: '2026-10-03', visitas: 7 },
  ],
};

function montar(rango: typeof RANGO | null, visitas: () => Promise<VisitasPeriodo>) {
  const api = crearMockMetricasApi();
  const espia = vi.spyOn(api, 'visitasPorPeriodo').mockImplementation(visitas);
  renderWithRouter(
    [
      {
        path: '/',
        element: (
          <MetricasApiProvider api={api}>
            <PanelVisitas rango={rango} />
          </MetricasApiProvider>
        ),
      },
    ],
    ['/'],
  );
  return espia;
}

describe('PanelVisitas', () => {
  it('dibuja una barra por periodo y anuncia el total', async () => {
    montar(RANGO, () => Promise.resolve(datos));
    const grafico = await screen.findByRole('img', { name: /12 en total/ });
    expect(grafico.querySelectorAll('rect')).toHaveLength(3);
  });

  it('ofrece la tabla equivalente con el valor de cada periodo', async () => {
    montar(RANGO, () => Promise.resolve(datos));
    const tabla = await screen.findByRole('table');
    expect(within(tabla).getByRole('cell', { name: '5' })).toBeInTheDocument();
    expect(within(tabla).getByRole('cell', { name: '0' })).toBeInTheDocument();
    expect(within(tabla).getByRole('cell', { name: '7' })).toBeInTheDocument();
  });

  it('al cambiar la agrupación vuelve a consultar con ella', async () => {
    const user = userEvent.setup();
    const espia = montar(RANGO, () => Promise.resolve(datos));
    await screen.findByRole('img');
    await user.selectOptions(screen.getByLabelText('Agrupar por'), 'SEMANA');
    await waitFor(() =>
      expect(espia).toHaveBeenLastCalledWith(RANGO, 'SEMANA', expect.anything()),
    );
  });

  it('sin visitas en el periodo lo dice y no dibuja gráfico', async () => {
    montar(RANGO, () =>
      Promise.resolve({
        ...datos,
        total: 0,
        serie: [{ inicio: '2026-10-01', visitas: 0 }],
      }),
    );
    expect(
      await screen.findByText('No hay visitas en este periodo.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('muestra cargando mientras llega la respuesta', () => {
    montar(RANGO, () => new Promise(() => {}));
    expect(screen.getByRole('status')).toHaveTextContent('Cargando el gráfico');
  });

  it('muestra el error con reintento que vuelve a consultar', async () => {
    const user = userEvent.setup();
    const visitas = vi
      .fn()
      .mockRejectedValueOnce(new ApiError(500, { message: 'caído' }))
      .mockResolvedValue(datos);
    const espia = montar(RANGO, visitas);
    expect(
      await screen.findByText('El servidor tuvo un problema. Inténtalo en unos minutos.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('img', { name: /12 en total/ })).toBeInTheDocument();
    expect(espia).toHaveBeenCalledTimes(2);
  });

  it('con un rango no válido no consulta y lo indica', async () => {
    const espia = montar(null, () => Promise.resolve(datos));
    expect(
      screen.getByText('Corrige las fechas para ver el gráfico.'),
    ).toBeInTheDocument();
    expect(espia).not.toHaveBeenCalled();
  });
});
