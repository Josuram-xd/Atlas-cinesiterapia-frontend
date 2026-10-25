import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './app/routes';
import { AdminApiProvider } from './features/admin/api/AdminApiProvider';
import { adminApiDesdeEntorno } from './features/admin/api/contexto';
import { apiDesdeEntorno } from './features/atlas/api/apiDesdeEntorno';
import { AtlasApiProvider } from './features/atlas/api/AtlasApiProvider';
import { useSessionLifecycle } from './features/auth/sessionLifecycle';
import { useSession } from './features/auth/sessionStore';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export function App() {
  const [router] = useState(() => createBrowserRouter(routes));
  const [atlasApi] = useState(apiDesdeEntorno);
  const [adminApi] = useState(adminApiDesdeEntorno);
  useSessionLifecycle();
  useEffect(() => {
    void useSession.getState().recuperar();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AtlasApiProvider api={atlasApi}>
        <AdminApiProvider api={adminApi}>
          <RouterProvider router={router} />
        </AdminApiProvider>
      </AtlasApiProvider>
    </QueryClientProvider>
  );
}
