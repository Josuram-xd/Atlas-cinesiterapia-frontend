import { registerSW } from 'virtual:pwa-register';
import { useSession } from '@/features/auth/sessionStore';
import { useActualizacion } from './actualizacion';
import { limpiarCachesDeDatos } from './limpiarCaches';

/**
 * Registra el service worker (solo en producción) y enlaza dos comportamientos:
 * - una versión nueva se anuncia con un aviso; se aplica cuando la persona lo decide;
 * - al cerrar y al iniciar sesión (y en una pestaña nueva sin sesión) se borran los datos
 *   guardados, para que no queden disponibles sin conexión para otra persona. Borrar también
 *   al entrar cubre la respuesta que estaba en vuelo al cerrar y se guardó después.
 */
export function iniciarPwa(): void {
  useSession.subscribe(({ estado }, previo) => {
    if (
      estado !== previo.estado &&
      (estado === 'anonimo' || previo.estado === 'anonimo')
    ) {
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
