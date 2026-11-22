import { usaBackend } from '@/lib/api/config';
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

/** Misma variable que el atlas: `usaBackend` (`lib/api/config`) elige backend real o datos en memoria. */
export function metricasApiDesdeEntorno(): MetricasApi {
  if (usaBackend) return httpMetricasApi;
  return crearMockMetricasApi();
}
