import { useSyncExternalStore } from 'react';

function suscribir(avisar: () => void): () => void {
  window.addEventListener('online', avisar);
  window.addEventListener('offline', avisar);
  return () => {
    window.removeEventListener('online', avisar);
    window.removeEventListener('offline', avisar);
  };
}

/**
 * Si el navegador dice tener conexión. `false` es fiable; `true` puede ser falso (red local
 * sin salida), por eso una petición que falla sigue llegando como error de red.
 */
export function useEnLinea(): boolean {
  return useSyncExternalStore(
    suscribir,
    () => navigator.onLine,
    () => true,
  );
}
