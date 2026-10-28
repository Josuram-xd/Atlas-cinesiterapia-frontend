import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError, type TopEjercicios } from '@/lib/api';
import { renderWithRouter } from '@/test/renderWithRouter';
import { PanelEjercicios } from './PanelEjercicios';
import { crearMockMetricasApi } from './api/mockMetricasApi';

const RANGO = { desde: '2026-10-01', hasta: '2026-10-28' };

const top: TopEjercicios = {
  ...RANGO,
  limite: 10,
  items: [
    {
      ejercicioId: 1,
      nombre: 'Flexoextensión pasiva de rodilla',
      region: { id: 11, nombre: 'Rodilla', svgId: 'anterior-rodilla' },
      categoria: { id: 1, nombre: 'Movilización pasiva' },
      visitas: 42,
    },
    {
      ejercicioId: 2,
      nombre: 'Péndulo de Codman',
      region: { id: 2, nombre: 'Hombro', svgId: 'anterior-hombro' },
      categoria: { id: 1, nombre: 'Movilización pasiva' },
      visitas: 27,
    },
  ],
};

function montar(rango: typeof RANGO | null, consulta: () => Promise<TopEjercicios>) {
  const api = crearMockMetricasApi();
  const espia = vi.spyOn(api, 'ejerciciosMasConsultados').mockImplementation(consulta);
  renderWithRouter(
    [{ path: '/', element: <PanelEjercicios rango={rango} /> }],
    ['/'],
    undefined,
    undefined,
    undefined,
    api,
  );
  return espia;
}

describe('PanelEjercicios', () => {
  it('lista de más a menos consultadas, con región, categoría y visualizaciones', async () => {
    montar(RANGO, () => Promise.resolve(top));
    const filas = await screen.findAllByRole('listitem');
    expect(filas).toHaveLength(2);
    expect(
      within(filas[0]).getByText('Flexoextensión pasiva de rodilla'),
    ).toBeInTheDocument();
    expect(
      within(filas[0]).getByText('Rodilla · Movilización pasiva'),
    ).toBeInTheDocument();
    expect(within(filas[0]).getByText('42 visualizaciones')).toBeInTheDocument();
    expect(within(filas[1]).getByText('27 visualizaciones')).toBeInTheDocument();
  });

  it('consulta con el rango de la página', async () => {
    const espia = montar(RANGO, () => Promise.resolve(top));
    await screen.findAllByRole('listitem');
    expect(espia).toHaveBeenCalledWith(RANGO, expect.anything());
  });

  it('sin fichas consultadas en el periodo lo dice', async () => {
    montar(RANGO, () => Promise.resolve({ ...top, items: [] }));
    expect(
      await screen.findByText(
        'Ninguna ficha publicada tiene visualizaciones en este periodo.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('muestra cargando mientras llega el ranking', () => {
    montar(RANGO, () => new Promise(() => {}));
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ranking');
  });

  it('muestra el error con reintento que vuelve a consultar', async () => {
    const user = userEvent.setup();
    const consulta = vi
      .fn()
      .mockRejectedValueOnce(new ApiError(500, { message: 'caído' }))
      .mockResolvedValue(top);
    const espia = montar(RANGO, consulta);
    expect(
      await screen.findByText('El servidor tuvo un problema. Inténtalo en unos minutos.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findAllByRole('listitem')).toHaveLength(2);
    expect(espia).toHaveBeenCalledTimes(2);
  });

  it('con un rango no válido no consulta', () => {
    const espia = montar(null, () => Promise.resolve(top));
    expect(
      screen.getByText('Corrige las fechas para ver el ranking.'),
    ).toBeInTheDocument();
    expect(espia).not.toHaveBeenCalled();
  });
});
