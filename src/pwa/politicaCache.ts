/**
 * Qué respuestas del backend puede guardar el service worker. Es una lista blanca:
 * solo la lectura del atlas (regiones, categorías, ejercicios, fichas y búsqueda).
 * Nunca se guarda autenticación, administración, comentarios, visitas ni métricas,
 * y las respuestas se descartan al cerrar sesión (véase `limpiarCachesDeDatos`).
 * Este archivo no importa nada: también lo usa el service worker.
 */
export const CACHE_DATOS = 'atlas-datos-v1';

const RAIZ_PERMITIDA = new Set(['regiones', 'ejercicios']);
const SEGMENTOS_PROHIBIDOS = new Set([
  'auth',
  'admin',
  'comentarios',
  'reportes',
  'visitas',
  'metricas',
]);

interface PeticionMinima {
  url: URL;
  method: string;
}

export function esLecturaCacheable(
  { url, method }: PeticionMinima,
  origenApi: string,
): boolean {
  if (method !== 'GET' || url.origin !== origenApi) return false;
  const segmentos = url.pathname.split('/').filter(Boolean);
  if (segmentos.length === 0 || !RAIZ_PERMITIDA.has(segmentos[0])) return false;
  return !segmentos.some((s) => SEGMENTOS_PROHIBIDOS.has(s));
}
