import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { routes } from '@/app/routes';
import { useSession } from '@/features/auth/sessionStore';
import { adminDemo, authDemo, usuarioDemo } from '@/test/fixtures';
import { renderWithRouter } from '@/test/renderWithRouter';
import { MetricasPage } from './MetricasPage';
import { crearMockMetricasApi } from './api/mockMetricasApi';
import { hoyUtc, inicioCubo } from './rangos';

function conSesion(usuario: typeof adminDemo) {
  useSession.getState().iniciar(authDemo({ usuario }));
}

function montarPagina() {
  const api = crearMockMetricasApi();
  const espia = vi.spyOn(api, 'visitasPorPeriodo');
  renderWithRouter(
    [{ path: '/admin/metricas', element: <MetricasPage /> }],
    ['/admin/metricas'],
    undefined,
    undefined,
    undefined,
    api,
  );
  return espia;
}

describe('página de métricas (solo administración)', () => {
  it('un administrador la ve y tiene el enlace desde la cabecera', async () => {
    conSesion(adminDemo);
    renderWithRouter(routes, ['/admin/metricas']);
    expect(
      await screen.findByRole('heading', { name: 'Métricas de uso' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Métricas' })).toHaveAttribute(
      'href',
      '/admin/metricas',
    );
  });

  it('un usuario común ve «Sin permiso» en lugar de la página', async () => {
    conSesion(usuarioDemo);
    renderWithRouter(routes, ['/admin/metricas']);
    expect(
      await screen.findByRole('heading', { name: 'Sin permiso' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Métricas de uso' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Métricas' })).not.toBeInTheDocument();
  });

  it('sin sesión redirige al inicio de sesión', async () => {
    renderWithRouter(routes, ['/admin/metricas']);
    expect(
      await screen.findByRole('heading', { name: 'Inicia sesión' }),
    ).toBeInTheDocument();
  });
});

describe('selector de rango de la página', () => {
  it('por defecto consulta el mes en curso agrupado por día', async () => {
    const hoy = hoyUtc();
    const espia = montarPagina();
    await waitFor(() =>
      expect(espia).toHaveBeenLastCalledWith(
        { desde: `${hoy.slice(0, 8)}01`, hasta: hoy },
        'DIA',
        expect.anything(),
      ),
    );
    expect(
      screen.getByRole('button', { name: 'Mes', pressed: true }),
    ).toBeInTheDocument();
  });

  it('elegir Semana consulta desde el lunes de la semana actual', async () => {
    const user = userEvent.setup();
    const hoy = hoyUtc();
    const espia = montarPagina();
    await user.click(screen.getByRole('button', { name: 'Semana' }));
    await waitFor(() =>
      expect(espia).toHaveBeenLastCalledWith(
        { desde: inicioCubo(hoy, 'SEMANA'), hasta: hoy },
        'DIA',
        expect.anything(),
      ),
    );
  });

  it('en Fechas consulta el rango elegido', async () => {
    const user = userEvent.setup();
    const espia = montarPagina();
    await user.click(screen.getByRole('button', { name: 'Fechas' }));
    fireEvent.change(screen.getByLabelText('Desde'), {
      target: { value: '2026-10-05' },
    });
    fireEvent.change(screen.getByLabelText('Hasta'), {
      target: { value: '2026-10-09' },
    });
    await waitFor(() =>
      expect(espia).toHaveBeenLastCalledWith(
        { desde: '2026-10-05', hasta: '2026-10-09' },
        'DIA',
        expect.anything(),
      ),
    );
  });

  it('avisa de un rango al revés y no consulta con esas fechas', async () => {
    const user = userEvent.setup();
    const espia = montarPagina();
    await user.click(screen.getByRole('button', { name: 'Fechas' }));
    fireEvent.change(screen.getByLabelText('Desde'), {
      target: { value: '2026-10-09' },
    });
    fireEvent.change(screen.getByLabelText('Hasta'), {
      target: { value: '2026-10-05' },
    });
    expect(
      await screen.findByText(/no puede ser posterior a la final/),
    ).toBeInTheDocument();
    expect(espia).not.toHaveBeenCalledWith(
      { desde: '2026-10-09', hasta: '2026-10-05' },
      expect.anything(),
      expect.anything(),
    );
  });
});
