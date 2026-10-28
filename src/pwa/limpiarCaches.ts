import { CACHE_DATOS } from './politicaCache';

/**
 * Borra las respuestas de datos guardadas por el service worker. Se llama cuando la sesión
 * termina (cierre, expiración o pestaña nueva sin sesión): así el contenido de una persona
 * no queda disponible sin conexión para la siguiente que use el mismo navegador.
 */
export async function limpiarCachesDeDatos(): Promise<void> {
  if (typeof caches === 'undefined') return;
  try {
    await caches.delete(CACHE_DATOS);
  } catch {
    /* sin acceso a Cache Storage: no hay nada que limpiar */
  }
}
