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

/** Misma variable que el resto de la app: `VITE_ATLAS_API=http` usa el backend; si no, datos en memoria. */
export function moderacionApiDesdeEntorno(): ModeracionApi {
  if (import.meta.env.VITE_ATLAS_API === 'http') return httpModeracionApi;
  return crearMockModeracionApi({ latenciaMs: 300 });
}
