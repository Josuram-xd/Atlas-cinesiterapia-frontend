/** True en pantallas anchas (breakpoint `lg` de Tailwind). Sin `matchMedia` cuenta como ancha. */
export function esPantallaAncha(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return true;
  return window.matchMedia('(min-width: 1024px)').matches;
}
