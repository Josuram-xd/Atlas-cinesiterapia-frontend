import { usaBackend } from '@/lib/api/config';
import type { AtlasApi } from './atlasApi';
import { httpAtlasApi } from './httpAtlasApi';
import { crearMockAtlasApi } from './mockAtlasApi';

/**
 * Elige la implementación con `VITE_ATLAS_API` (`mock` por defecto en desarrollo, `http` por defecto en producción).
 * En desarrollo, `?mock=error` o `?mock=lento` en la URL fuerzan esos estados del mock.
 */
export function apiDesdeEntorno(): AtlasApi {
  if (usaBackend) return httpAtlasApi;
  const modo = import.meta.env.DEV
    ? new URLSearchParams(location.search).get('mock')
    : null;
  return crearMockAtlasApi({
    latenciaMs: modo === 'lento' ? 3000 : 400,
    fallar: modo === 'error',
  });
}
