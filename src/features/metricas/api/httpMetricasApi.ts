import { api } from '@/lib/api';
import type { Sesion } from '@/lib/api';
import type { MetricasApi } from './metricasApi';

export const RUTA_PING = '/metricas/sesion/ping';

export const httpMetricasApi: MetricasApi = {
  registrarPing: () => api.post<Sesion>(RUTA_PING),
};
