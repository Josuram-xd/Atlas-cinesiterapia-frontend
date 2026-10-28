import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AtlasApiProvider } from '@/features/atlas/api/AtlasApiProvider';
import type { AtlasApi } from '@/features/atlas/api/atlasApi';
import { crearMockAtlasApi } from '@/features/atlas/api/mockAtlasApi';
import { AdminApiProvider } from '@/features/admin/api/AdminApiProvider';
import type { AdminApi } from '@/features/admin/api/adminApi';
import { crearMockAdminApi } from '@/features/admin/api/mockAdminApi';
import { ComentariosApiProvider } from '@/features/comentarios/api/ComentariosApiProvider';
import type { ComentariosApi } from '@/features/comentarios/api/comentariosApi';
import { crearMockComentariosApi } from '@/features/comentarios/api/mockComentariosApi';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';

/** Renderiza rutas reales con un router en memoria y un QueryClient limpio. */
export function renderWithRouter(
  routes: RouteObject[],
  initialEntries: Array<string | { pathname: string; state?: unknown }> = ['/'],
  atlasApi: AtlasApi = crearMockAtlasApi(),
  adminApi: AdminApi = crearMockAdminApi(),
  comentariosApi: ComentariosApi = crearMockComentariosApi(),
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(routes, {
    initialEntries: initialEntries as string[],
  });
  const utils = render(
    <QueryClientProvider client={client}>
      <AtlasApiProvider api={atlasApi}>
        <AdminApiProvider api={adminApi}>
          <ComentariosApiProvider api={comentariosApi}>
            <RouterProvider router={router} />
          </ComentariosApiProvider>
        </AdminApiProvider>
      </AtlasApiProvider>
    </QueryClientProvider>,
  );
  return { router, ...utils };
}
