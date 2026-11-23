const raw =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:8080');
if (!raw) throw new Error('Falta VITE_API_URL en la compilación de producción.');

/** URL base del backend, sin barra final. */
export const API_URL = raw.replace(/\/+$/, '');

/** Backend real con `VITE_ATLAS_API=http`; en producción también por defecto (solo `mock` lo evita). */
export const usaBackend =
  import.meta.env.VITE_ATLAS_API === 'http' ||
  (import.meta.env.PROD && import.meta.env.VITE_ATLAS_API !== 'mock');
