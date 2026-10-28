import { useEffect } from 'react';

/** Cada cuánto se avisa que la persona sigue usando la app (docs/API.md: ~60 s). */
export const INTERVALO_PING_MS = 60_000;

/**
 * Latido de la sesión de uso (HU-34). Solo corre mientras hay sesión iniciada (`activa`) y la
 * pestaña está visible: envía un ping al volver a verse y luego uno por intervalo; al ocultarse
 * la pestaña o al cerrar la sesión se detiene. Un fallo del ping nunca interrumpe a la persona.
 */
export function useSesionPing(
  activa: boolean,
  enviar: () => Promise<unknown>,
  intervaloMs: number = INTERVALO_PING_MS,
): void {
  useEffect(() => {
    if (!activa) return;
    let temporizador: ReturnType<typeof setInterval> | undefined;

    const ping = () => {
      void enviar().catch(() => {});
    };
    const parar = () => {
      if (temporizador === undefined) return;
      clearInterval(temporizador);
      temporizador = undefined;
    };
    const arrancar = () => {
      if (temporizador !== undefined) return;
      ping();
      temporizador = setInterval(ping, intervaloMs);
    };
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'visible') arrancar();
      else parar();
    };

    alCambiarVisibilidad();
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    return () => {
      parar();
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    };
  }, [activa, enviar, intervaloMs]);
}
