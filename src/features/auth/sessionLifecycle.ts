import { useEffect } from 'react';
import { API_URL, tokenStorage, type CierrePendienteRequest } from '@/lib/api';
import { useSession } from './sessionStore';

/**
 * Avisa al backend de que la pestaña se está cerrando (RF_029). El backend espera 60 s
 * antes de invalidar la sesión (RF_030); un refresh exitoso dentro de ese margen cancela
 * el cierre. `sendBeacon` sobrevive al cierre de la página, a diferencia de `fetch`.
 */
export function enviarCierrePendiente(): boolean {
  const tokens = tokenStorage.get();
  if (!tokens || typeof navigator.sendBeacon !== 'function') return false;
  const cuerpo: CierrePendienteRequest = { refreshToken: tokens.refreshToken };
  const blob = new Blob([JSON.stringify(cuerpo)], { type: 'application/json' });
  return navigator.sendBeacon(`${API_URL}/auth/cierre-pendiente`, blob);
}

/**
 * - `pagehide`: envía el cierre pendiente si hay sesión iniciada.
 * - `pageshow` desde la caché de retroceso: la página vuelve sin recargarse, así que se
 *   renueva la sesión para cancelar el cierre que acabamos de avisar.
 * Al recargar o reabrir la pestaña, `useSession.recuperar()` ya hace ese refresh.
 */
export function useSessionLifecycle(): void {
  useEffect(() => {
    function alOcultar() {
      if (useSession.getState().estado === 'autenticado') enviarCierrePendiente();
    }
    function alMostrar(evento: PageTransitionEvent) {
      if (evento.persisted && tokenStorage.get()) void useSession.getState().recuperar();
    }
    window.addEventListener('pagehide', alOcultar);
    window.addEventListener('pageshow', alMostrar);
    return () => {
      window.removeEventListener('pagehide', alOcultar);
      window.removeEventListener('pageshow', alMostrar);
    };
  }, []);
}
