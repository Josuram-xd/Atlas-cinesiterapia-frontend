/** True si la persona pidió menos movimiento (o si el entorno no puede animar). */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
