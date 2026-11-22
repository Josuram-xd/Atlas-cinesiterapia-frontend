import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './app/routes';
import { AdminApiProvider } from './features/admin/api/AdminApiProvider';
import { adminApiDesdeEntorno } from './features/admin/api/contexto';
import { apiDesdeEntorno } from './features/atlas/api/apiDesdeEntorno';
import { AtlasApiProvider } from './features/atlas/api/AtlasApiProvider';
import { comentariosApiDesdeEntorno } from './features/comentarios/api/contexto';
import { ComentariosApiProvider } from './features/comentarios/api/ComentariosApiProvider';
import { useSessionLifecycle } from './features/auth/sessionLifecycle';
import { useSession } from './features/auth/sessionStore';
import { AvisosSistema } from './pwa/AvisosSistema';
import { metricasApiDesdeEntorno } from './features/metricas/api/contexto';
import { MetricasApiProvider } from './features/metricas/api/MetricasApiProvider';
import { PingDeSesion } from './features/metricas/PingDeSesion';
import { moderacionApiDesdeEntorno } from './features/moderacion/api/contexto';
import { ModeracionApiProvider } from './features/moderacion/api/ModeracionApiProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    // `offlineFirst`: sin conexión también se intenta la petición; el service worker
    // responde con lo guardado si lo tiene (si no, falla como cualquier error de red).
    queries: { retry: 1, refetchOnWindowFocus: false, networkMode: 'offlineFirst' },
    // Una escritura sin red falla al momento; no se queda en cola para enviarse sola luego.
    mutations: { networkMode: 'always' },
  },
});

export function App() {
  const [router] = useState(() => createBrowserRouter(routes));
  const [atlasApi] = useState(apiDesdeEntorno);
  const [adminApi] = useState(adminApiDesdeEntorno);
  const [comentariosApi] = useState(comentariosApiDesdeEntorno);
  const [metricasApi] = useState(metricasApiDesdeEntorno);
  const [moderacionApi] = useState(moderacionApiDesdeEntorno);
  useSessionLifecycle();
  useEffect(() => {
    void useSession.getState().recuperar();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AtlasApiProvider api={atlasApi}>
        <AdminApiProvider api={adminApi}>
          <AvisosSistema />
          <MetricasApiProvider api={metricasApi}>
            <ComentariosApiProvider api={comentariosApi}>
              <ModeracionApiProvider api={moderacionApi}>
                <PingDeSesion />
                <RouterProvider router={router} />
              </ModeracionApiProvider>
            </ComentariosApiProvider>
          </MetricasApiProvider>
        </AdminApiProvider>
      </AtlasApiProvider>
    </QueryClientProvider>
  );
}
