import type { Agrupacion, Rango, UsuariosActivos } from '@/lib/api';
import { CATEGORIAS_MOCK, REGIONES_MOCK } from '../../atlas/data/regiones';
import { inicioCubo } from '../rangos';
import type { MetricasApi } from './metricasApi';

const DIA_MS = 86_400_000;

/** Visitas de ejemplo de un día: fijas por fecha, así el gráfico no cambia entre cargas. */
const visitasDelDia = (dia: string) => ((Date.parse(dia) / DIA_MS) * 37) % 23;

/** Ranking de ejemplo ya ordenado de mayor a menor (el backend lo ordena igual). */
const RANKING_MOCK = [
  {
    ejercicioId: 1,
    nombre: 'Flexoextensión pasiva de rodilla',
    regionId: 11,
    categoriaId: 1,
    visitas: 42,
  },
  {
    ejercicioId: 2,
    nombre: 'Péndulo de Codman',
    regionId: 2,
    categoriaId: 1,
    visitas: 27,
  },
  {
    ejercicioId: 3,
    nombre: 'Flexión de rodilla en sedestación',
    regionId: 112,
    categoriaId: 3,
    visitas: 9,
  },
];

/** Usuarios activos de ejemplo por rol, en el orden que devuelve el backend. */
const ACTIVOS_MOCK: UsuariosActivos['porRol'] = [
  { rol: 'ESTUDIANTE', usuarios: 14 },
  { rol: 'PROFESIONAL', usuarios: 6 },
  { rol: 'PRACTICANTE', usuarios: 3 },
  { rol: 'VISITANTE', usuarios: 0 },
];

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
    // shortcut: ignora el rango y devuelve siempre el mismo ranking, usar la API real al tenerla
    ejerciciosMasConsultados: (rango: Rango) =>
      Promise.resolve({
        ...rango,
        limite: 10,
        items: RANKING_MOCK.map((f) => ({
          ejercicioId: f.ejercicioId,
          nombre: f.nombre,
          region: REGIONES_MOCK.find((r) => r.id === f.regionId)!,
          categoria: CATEGORIAS_MOCK.find((c) => c.id === f.categoriaId)!,
          visitas: f.visitas,
        })),
      }),
    usuariosActivos: (rango: Rango) =>
      Promise.resolve({
        ...rango,
        total: ACTIVOS_MOCK.reduce((suma, x) => suma + x.usuarios, 0),
        porRol: ACTIVOS_MOCK,
      }),
    // shortcut: cifras fijas y el periodo anterior no se recalcula, usar la API real al tenerla
    tiempoPromedio: (rango: Rango) =>
      Promise.resolve({
        ...rango,
        sesiones: 48,
        promedioSegundos: 512,
        anterior: { ...rango, sesiones: 40, promedioSegundos: 455 },
        variacionPorcentaje: 12.5,
      }),
  };
}
