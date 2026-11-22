import { usaBackend } from '@/lib/api/config';
import { createContext, useContext } from 'react';
import type { ModeracionApi } from './moderacionApi';
import { httpModeracionApi } from './httpModeracionApi';
import { crearMockModeracionApi } from './mockModeracionApi';

export const ModeracionApiContext = createContext<ModeracionApi | null>(null);

export function useModeracionApi(): ModeracionApi {
  const api = useContext(ModeracionApiContext);
  if (!api)
    throw new Error('useModeracionApi debe usarse dentro de ModeracionApiProvider');
  return api;
}

/** Misma variable que el resto de la app: `usaBackend` (`lib/api/config`) elige backend real o datos en memoria. */
export function moderacionApiDesdeEntorno(): ModeracionApi {
  if (usaBackend) return httpModeracionApi;
  return crearMockModeracionApi({ latenciaMs: 300 });
}
