import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError, type TiempoPromedio } from '@/lib/api';
import { renderWithRouter } from '@/test/renderWithRouter';
import { PanelTiempo } from './PanelTiempo';
import { crearMockMetricasApi } from './api/mockMetricasApi';

const RANGO = { desde: '2026-10-01', hasta: '2026-10-28' };
const ANTERIOR = { desde: '2026-09-03', hasta: '2026-09-30', sesiones: 40 };

const tiempo: TiempoPromedio = {
  ...RANGO,
  sesiones: 48,
  promedioSegundos: 512,
  anterior: { ...ANTERIOR, promedioSegundos: 455 },
  variacionPorcentaje: 12.5,
};

function montar(rango: typeof RANGO | null, consulta: () => Promise<TiempoPromedio>) {
  const api = crearMockMetricasApi();
  const espia = vi.spyOn(api, 'tiempoPromedio').mockImplementation(consulta);
  renderWithRouter(
    [{ path: '/', element: <PanelTiempo rango={rango} /> }],
    ['/'],
    undefined,
    undefined,
    undefined,
    api,
  );
  return espia;
}

describe('PanelTiempo', () => {
  it('muestra el promedio y el número de sesiones que lo forman', async () => {
    montar(RANGO, () => Promise.resolve(tiempo));
    expect(await screen.findByText('8 min 32 s')).toBeInTheDocument();
    expect(screen.getByText('Promedio de 48 sesiones')).toBeInTheDocument();
  });

  it('compara con el periodo anterior con la variación y su promedio', async () => {
    montar(RANGO, () => Promise.resolve(tiempo));
    expect(
      await screen.findByText(/\+12,5 % frente al periodo anterior/),
    ).toBeInTheDocument();
    expect(screen.getByText(/7 min 35 s/)).toBeInTheDocument();
  });

  it('sin datos del periodo anterior no inventa la tendencia', async () => {
    montar(RANGO, () =>
      Promise.resolve({
        ...tiempo,
        anterior: { ...ANTERIOR, sesiones: 0 },
        variacionPorcentaje: undefined,
      }),
    );
    expect(
      await screen.findByText(
        'Sin datos suficientes en el periodo anterior para comparar.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/frente al periodo anterior/)).not.toBeInTheDocument();
  });

  it('sin sesiones medibles lo dice en lugar de un promedio', async () => {
    montar(RANGO, () =>
      Promise.resolve({
        ...tiempo,
        sesiones: 0,
        promedioSegundos: undefined,
        variacionPorcentaje: undefined,
        anterior: { ...ANTERIOR, sesiones: 0 },
      }),
    );
    expect(
      await screen.findByText('No hay datos suficientes en este periodo.'),
    ).toBeInTheDocument();
  });

  it('muestra cargando mientras llega la respuesta', () => {
    montar(RANGO, () => new Promise(() => {}));
    expect(screen.getByRole('status')).toHaveTextContent('Cargando tiempo de uso');
  });

  it('muestra el error con reintento que vuelve a consultar', async () => {
    const user = userEvent.setup();
    const consulta = vi
      .fn()
      .mockRejectedValueOnce(new ApiError(500, { message: 'caído' }))
      .mockResolvedValue(tiempo);
    const espia = montar(RANGO, consulta);
    expect(
      await screen.findByText('El servidor tuvo un problema. Inténtalo en unos minutos.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('8 min 32 s')).toBeInTheDocument();
    expect(espia).toHaveBeenCalledTimes(2);
  });

  it('con un rango no válido no consulta', () => {
    const espia = montar(null, () => Promise.resolve(tiempo));
    expect(
      screen.getByText('Corrige las fechas para ver el tiempo de uso.'),
    ).toBeInTheDocument();
    expect(espia).not.toHaveBeenCalled();
  });
});
