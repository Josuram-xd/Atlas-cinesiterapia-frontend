import { createContext, useContext } from 'react';
import type { MetricasApi } from './metricasApi';
import { httpMetricasApi } from './httpMetricasApi';
import { crearMockMetricasApi } from './mockMetricasApi';

export const MetricasApiContext = createContext<MetricasApi | null>(null);

export function useMetricasApi(): MetricasApi {
  const api = useContext(MetricasApiContext);
  if (!api) throw new Error('useMetricasApi debe usarse dentro de MetricasApiProvider');
  return api;
}

/** Misma variable que el atlas: `VITE_ATLAS_API=http` usa el backend; si no, datos en memoria. */
export function metricasApiDesdeEntorno(): MetricasApi {
  if (import.meta.env.VITE_ATLAS_API === 'http') return httpMetricasApi;
  return crearMockMetricasApi();
}
