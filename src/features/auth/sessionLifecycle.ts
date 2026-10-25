import { useEffect } from 'react';
import { API_URL, tokenStorage, type CierrePendienteRequest } from '@/lib/api';
import { useSession } from './sessionStore';

/**
 * Avisa al backend de que la pestaña se está cerrando (RF_029). El backend espera 60 s
 * antes de invalidar la sesión (RF_030); un refresh exitoso dentro de ese margen cancela
 * el cierre.
 *
 * El endpoint es público y toma el refresh token del cuerpo JSON, así que no necesita
 * Authorization. Como el cuerpo es `application/json`, entre orígenes distintos el navegador
 * hace una petición previa CORS: el backend la admite (Content-Type permitido, maxAge 3600)
 * siempre que el origen del frontend esté en su variable CORS_ORIGINS.
 * `sendBeacon` sobrevive al cierre de la página; si el navegador lo rechaza (devuelve
 * false) se reintenta con `fetch` y `keepalive`, que también sobrevive.
 */
export function enviarCierrePendiente(): boolean {
  const tokens = tokenStorage.get();
  if (!tokens) return false;
  const cuerpo: CierrePendienteRequest = { refreshToken: tokens.refreshToken };
  const json = JSON.stringify(cuerpo);
  const url = `${API_URL}/auth/cierre-pendiente`;

  if (typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([json], { type: 'application/json' });
    if (navigator.sendBeacon(url, blob)) return true;
  }
  if (typeof fetch !== 'function') return false;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json,
    keepalive: true,
  }).catch(() => {
    /* si falla, el refresh token expirará por su cuenta */
  });
  return true;
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
