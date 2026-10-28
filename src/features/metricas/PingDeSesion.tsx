import { useSession } from '../auth/sessionStore';
import { useMetricasApi } from './api/contexto';
import { useSesionPing } from './sesionPing';

/** No dibuja nada: mantiene vivo el latido de la sesión de uso mientras haya sesión. */
export function PingDeSesion() {
  const api = useMetricasApi();
  const autenticado = useSession((s) => s.estado === 'autenticado');
  useSesionPing(autenticado, api.registrarPing);
  return null;
}
