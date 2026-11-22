import { usaBackend } from '@/lib/api/config';
import { createContext, useContext } from 'react';
import type { AdminApi } from './adminApi';
import { httpAdminApi } from './httpAdminApi';
import { crearMockAdminApi } from './mockAdminApi';

export const AdminApiContext = createContext<AdminApi | null>(null);

export function useAdminApi(): AdminApi {
  const api = useContext(AdminApiContext);
  if (!api) throw new Error('useAdminApi debe usarse dentro de AdminApiProvider');
  return api;
}

/** Misma variable que el atlas: `usaBackend` (`lib/api/config`) elige backend real o datos en memoria. */
export function adminApiDesdeEntorno(): AdminApi {
  if (usaBackend) return httpAdminApi;
  return crearMockAdminApi({ latenciaMs: 300 });
}
