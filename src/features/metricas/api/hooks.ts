import { useQuery } from '@tanstack/react-query';
import type { Agrupacion, Rango } from '@/lib/api';
import { useMetricasApi } from './contexto';

/** Visitas del rango; con `rango` nulo (fechas no válidas) no consulta. */
export function useVisitasPeriodo(rango: Rango | null, agrupacion: Agrupacion) {
  const api = useMetricasApi();
  return useQuery({
    queryKey: ['metricas', 'visitas', rango, agrupacion],
    queryFn: ({ signal }) => api.visitasPorPeriodo(rango!, agrupacion, signal),
    enabled: rango !== null,
  });
}
