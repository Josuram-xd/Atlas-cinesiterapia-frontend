import type {
  Agrupacion,
  Rango,
  Sesion,
  TopEjercicios,
  UsuariosActivos,
  VisitasPeriodo,
} from '@/lib/api';

/** Lo que el front necesita de `/metricas/**` y `/admin/metricas/**` (docs/API.md, sección 9). */
export interface MetricasApi {
  /**
   * Latido de la sesión de uso (RF_032, HU-34): continúa la sesión vigente o abre otra si
   * pasaron más de 30 minutos desde el último. Sin cuerpo.
   */
  registrarPing(): Promise<Sesion>;
  /** Visitas (atlas y fichas) por día, semana o mes dentro del rango (HU-31). */
  visitasPorPeriodo(
    rango: Rango,
    agrupacion: Agrupacion,
    signal?: AbortSignal,
  ): Promise<VisitasPeriodo>;
  /** Fichas publicadas más vistas dentro del rango (HU-32). */
  ejerciciosMasConsultados(rango: Rango, signal?: AbortSignal): Promise<TopEjercicios>;
  /** Usuarios con actividad en el rango, por rol de perfil (HU-33). */
  usuariosActivos(rango: Rango, signal?: AbortSignal): Promise<UsuariosActivos>;
}
