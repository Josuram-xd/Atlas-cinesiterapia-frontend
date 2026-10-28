import type { Agrupacion, Rango } from '@/lib/api';
import { inicioCubo } from '../rangos';
import type { MetricasApi } from './metricasApi';

const DIA_MS = 86_400_000;

/** Visitas de ejemplo de un día: fijas por fecha, así el gráfico no cambia entre cargas. */
const visitasDelDia = (dia: string) => ((Date.parse(dia) / DIA_MS) * 37) % 23;

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
    visitasPorPeriodo: (rango: Rango, agrupacion: Agrupacion) => {
      const cubos = new Map<string, number>();
      for (let t = Date.parse(rango.desde); t <= Date.parse(rango.hasta); t += DIA_MS) {
        const dia = new Date(t).toISOString().slice(0, 10);
        const clave = inicioCubo(dia, agrupacion);
        cubos.set(clave, (cubos.get(clave) ?? 0) + visitasDelDia(dia));
      }
      const serie = [...cubos].map(([fecha, visitas]) => ({ inicio: fecha, visitas }));
      const total = serie.reduce((suma, c) => suma + c.visitas, 0);
      return Promise.resolve({ ...rango, agrupacion, total, serie });
    },
  };
}
