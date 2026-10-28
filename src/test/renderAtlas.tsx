import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AtlasApiProvider } from '@/features/atlas/api/AtlasApiProvider';
import type { AtlasApi } from '@/features/atlas/api/atlasApi';
import { crearMockAtlasApi } from '@/features/atlas/api/mockAtlasApi';

/** Renderiza un componente del atlas con un QueryClient limpio y la API indicada (mock por defecto). */
export function renderAtlas(
  ui: ReactElement,
  api: AtlasApi = crearMockAtlasApi(),
  ruta = '/',
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[ruta]}>
        <AtlasApiProvider api={api}>{ui}</AtlasApiProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
