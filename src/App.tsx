import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './app/routes';
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
  useSessionLifecycle();
  useEffect(() => {
    void useSession.getState().recuperar();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AtlasApiProvider api={atlasApi}>
        <RouterProvider router={router} />
      </AtlasApiProvider>
    </QueryClientProvider>
  );
}
