import type { Sesion } from '@/lib/api';

/** Lo que el front necesita de `/metricas/**` y `/admin/metricas/**` (docs/API.md, sección 9). */
export interface MetricasApi {
  /**
   * Latido de la sesión de uso (RF_032, HU-34): continúa la sesión vigente o abre otra si
   * pasaron más de 30 minutos desde el último. Sin cuerpo.
   */
  registrarPing(): Promise<Sesion>;
}
