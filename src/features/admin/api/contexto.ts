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

/** Misma variable que el atlas: `VITE_ATLAS_API=http` usa el backend; si no, datos en memoria. */
export function adminApiDesdeEntorno(): AdminApi {
  if (import.meta.env.VITE_ATLAS_API === 'http') return httpAdminApi;
  return crearMockAdminApi({ latenciaMs: 300 });
}
