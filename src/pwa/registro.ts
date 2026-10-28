import { registerSW } from 'virtual:pwa-register';
import { useSession } from '@/features/auth/sessionStore';
import { useActualizacion } from './actualizacion';
import { limpiarCachesDeDatos } from './limpiarCaches';

/**
 * Registra el service worker (solo en producción) y enlaza dos comportamientos:
 * - una versión nueva se anuncia con un aviso; se aplica cuando la persona lo decide;
 * - cada vez que no hay sesión (cierre, expiración o pestaña nueva) se borran los datos
 *   guardados, para que no queden disponibles sin conexión para otra persona.
 */
export function iniciarPwa(): void {
  useSession.subscribe((estado, previo) => {
    if (estado.estado === 'anonimo' && previo.estado !== 'anonimo') {
      void limpiarCachesDeDatos();
    }
  });
  if (useSession.getState().estado === 'anonimo') void limpiarCachesDeDatos();

  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  const actualizar = registerSW({
    onNeedRefresh: () =>
      useActualizacion.getState().anunciar(() => void actualizar(true)),
  });
}
