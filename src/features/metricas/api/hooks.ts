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

/** Ranking de fichas más vistas del rango; con `rango` nulo no consulta. */
export function useEjerciciosMasConsultados(rango: Rango | null) {
  const api = useMetricasApi();
  return useQuery({
    queryKey: ['metricas', 'ejercicios', rango],
    queryFn: ({ signal }) => api.ejerciciosMasConsultados(rango!, signal),
    enabled: rango !== null,
  });
}

/** Usuarios activos por rol del rango; con `rango` nulo no consulta. */
export function useUsuariosActivos(rango: Rango | null) {
  const api = useMetricasApi();
  return useQuery({
    queryKey: ['metricas', 'usuarios', rango],
    queryFn: ({ signal }) => api.usuariosActivos(rango!, signal),
    enabled: rango !== null,
  });
}
