/**
 * Acepta solo URLs que es seguro poner en `src` de una imagen o un video: http(s) absolutas
 * o rutas del propio sitio. Rechaza `javascript:`, `data:`, `file:` y similares, porque la URL
 * viene del backend y no se debe confiar en ella a ciegas.
 */
export function urlSegura(url: string | null | undefined): string | null {
  if (!url) return null;
  const limpia = url.trim();
  if (/^\/(?![/\\])/.test(limpia)) return limpia;
  try {
    const u = new URL(limpia);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null;
  } catch {
    return null;
  }
}
