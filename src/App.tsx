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
import { AvisosSistema } from './pwa/AvisosSistema';

const queryClient = new QueryClient({
  defaultOptions: {
    // `offlineFirst`: sin conexi�n tambi�n se intenta la petici�n; el service worker
    // responde con lo guardado si lo tiene (si no, falla como cualquier error de red).
    queries: { retry: 1, refetchOnWindowFocus: false, networkMode: 'offlineFirst' },
  },
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
          <AvisosSistema />
          <RouterProvider router={router} />
        </AdminApiProvider>
      </AtlasApiProvider>
    </QueryClientProvider>
  );
}
