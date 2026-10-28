import { api } from '@/lib/api';
import type { Sesion, TopEjercicios, VisitasPeriodo } from '@/lib/api';
import type { MetricasApi } from './metricasApi';

export const RUTA_PING = '/metricas/sesion/ping';

export const httpMetricasApi: MetricasApi = {
  registrarPing: () => api.post<Sesion>(RUTA_PING),
  visitasPorPeriodo: (rango, agrupacion, signal) =>
    api.get<VisitasPeriodo>(
      `/admin/metricas/visitas?${new URLSearchParams({ ...rango, agrupacion })}`,
      { signal },
    ),
  ejerciciosMasConsultados: (rango, signal) =>
    api.get<TopEjercicios>(
      `/admin/metricas/ejercicios-mas-consultados?${new URLSearchParams({ ...rango, limite: '10' })}`,
      { signal },
    ),
};
