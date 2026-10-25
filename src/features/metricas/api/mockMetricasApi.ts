import type { MetricasApi } from './metricasApi';

/** Datos de ejemplo detrás de la misma interfaz que el backend. */
export function crearMockMetricasApi(): MetricasApi {
  const inicio = new Date().toISOString();
  return {
    registrarPing: () =>
      Promise.resolve({
        sesionId: 1,
        nuevaSesion: false,
        inicio,
        ultimoPing: new Date().toISOString(),
        duracionSegundos: 0,
      }),
  };
}
