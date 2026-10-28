import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { routes } from '@/app/routes';
import { useSession } from '@/features/auth/sessionStore';
import { adminDemo, authDemo, usuarioDemo } from '@/test/fixtures';
import { renderWithRouter } from '@/test/renderWithRouter';

function conSesion(usuario: typeof adminDemo) {
  useSession.getState().iniciar(authDemo({ usuario }));
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
