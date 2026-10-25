import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AtlasApiProvider } from '@/features/atlas/api/AtlasApiProvider';
import type { AtlasApi } from '@/features/atlas/api/atlasApi';
import { crearMockAtlasApi } from '@/features/atlas/api/mockAtlasApi';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';

/** Renderiza rutas reales con un router en memoria y un QueryClient limpio. */
export function renderWithRouter(
  routes: RouteObject[],
  initialEntries: Array<string | { pathname: string; state?: unknown }> = ['/'],
  atlasApi: AtlasApi = crearMockAtlasApi(),
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
        <RouterProvider router={router} />
      </AtlasApiProvider>
    </QueryClientProvider>,
  );
  return { router, ...utils };
}
