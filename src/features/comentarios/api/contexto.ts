import { usaBackend } from '@/lib/api/config';
import { createContext, useContext } from 'react';
import type { ComentariosApi } from './comentariosApi';
import { httpComentariosApi } from './httpComentariosApi';
import { crearMockComentariosApi } from './mockComentariosApi';

export const ComentariosApiContext = createContext<ComentariosApi | null>(null);

export function useComentariosApi(): ComentariosApi {
  const api = useContext(ComentariosApiContext);
  if (!api) {
    throw new Error('useComentariosApi debe usarse dentro de ComentariosApiProvider');
  }
  return api;
}

/** Misma variable que el atlas: `usaBackend` (`lib/api/config`) elige backend real o datos en memoria. */
export function comentariosApiDesdeEntorno(): ComentariosApi {
  if (usaBackend) return httpComentariosApi;
  return crearMockComentariosApi({ latenciaMs: 300 });
}
