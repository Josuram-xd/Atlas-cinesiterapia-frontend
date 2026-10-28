/**
 * Qué respuestas del backend puede guardar el service worker. Es una lista blanca exacta:
 * solo la lectura del atlas (regiones, categorías de una región, ejercicios, búsqueda y
 * ficha). Cualquier otra ruta (auth, admin, comentarios, visitas, métricas o una nueva bajo
 * /ejercicios/{id}/...) no se guarda, y lo guardado se descarta al cambiar de sesión
 * (véase `limpiarCachesDeDatos`). Este archivo no importa nada: también lo usa el service worker.
 */
export const CACHE_DATOS = 'atlas-datos-v1';

const LECTURA_ATLAS = /^\/(regiones(\/\d+\/categorias)?|ejercicios(\/(buscar|\d+))?)\/?$/;

export function esLecturaCacheable(url: URL, method: string, origenApi: string): boolean {
  return method === 'GET' && url.origin === origenApi && LECTURA_ATLAS.test(url.pathname);
}
