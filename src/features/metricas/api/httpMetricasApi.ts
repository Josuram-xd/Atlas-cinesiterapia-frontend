import { api } from '@/lib/api';
import type {
  Sesion,
  TiempoPromedio,
  TopEjercicios,
  UsuariosActivos,
  VisitasPeriodo,
} from '@/lib/api';
import type { MetricasApi } from './metricasApi';

export const RUTA_PING = '/metricas/sesion/ping';

/** GET a `/admin/metricas/{ruta}` con el rango (y lo demás) como query string. */
const pedir = <T>(ruta: string, params: Record<string, string>, signal?: AbortSignal) =>
  api.get<T>(`/admin/metricas/${ruta}?${new URLSearchParams(params)}`, { signal });

export const httpMetricasApi: MetricasApi = {
  registrarPing: () => api.post<Sesion>(RUTA_PING),
  visitasPorPeriodo: (rango, agrupacion, signal) =>
    pedir<VisitasPeriodo>('visitas', { ...rango, agrupacion }, signal),
  // Sin `limite`: el backend da 10 por defecto, lo que pide HU-32.
  ejerciciosMasConsultados: (rango, signal) =>
    pedir<TopEjercicios>('ejercicios-mas-consultados', { ...rango }, signal),
  usuariosActivos: (rango, signal) =>
    pedir<UsuariosActivos>('usuarios-activos', { ...rango }, signal),
  tiempoPromedio: (rango, signal) =>
    pedir<TiempoPromedio>('tiempo-promedio', { ...rango }, signal),
};
