import type {
  Categoria,
  EjercicioAdmin,
  EjercicioAdminResumen,
  EjercicioRequest,
  FiltroFichas,
  MediaAdmin,
  Pagina,
  SolicitudSubida,
  SubidaPrefirmada,
} from '@/lib/api';

/** Lo que el panel de administración necesita del backend (`/admin/ejercicios/**`). */
export interface AdminApi {
  /** Todas las fichas de todos los administradores, paginadas y filtradas. */
  listarFichas(
    filtro: FiltroFichas,
    signal?: AbortSignal,
  ): Promise<Pagina<EjercicioAdminResumen>>;
  obtenerFicha(id: number, signal?: AbortSignal): Promise<EjercicioAdmin>;
  /** Crea un borrador (validación mínima: nombre, región y categoría). */
  crearFicha(datos: EjercicioRequest): Promise<EjercicioAdmin>;
  /** Reemplaza el contenido. En fichas publicadas puede responder 422 FICHA_INCOMPLETA. */
  actualizarFicha(id: number, datos: EjercicioRequest): Promise<EjercicioAdmin>;
  /** BORRADOR a PUBLICADO. 422 FICHA_INCOMPLETA si faltan campos obligatorios. */
  publicarFicha(id: number): Promise<EjercicioAdmin>;
  archivarFicha(id: number): Promise<EjercicioAdmin>;
  restaurarFicha(id: number): Promise<EjercicioAdmin>;
  /** Borrado blando. */
  eliminarFicha(id: number): Promise<void>;
  /** Las 9 categorías, para los filtros y el formulario. */
  listarCategorias(signal?: AbortSignal): Promise<Categoria[]>;

  // Subida de multimedia con URL prefirmada, en tres pasos (docs/API.md, sección 6).
  /** Paso 1: pide la URL de subida. */
  solicitarSubida(fichaId: number, solicitud: SolicitudSubida): Promise<SubidaPrefirmada>;
  /** Paso 2: envía el archivo con `PUT` a la URL prefirmada, informando el progreso (0 a 1). */
  subirArchivo(
    subida: SubidaPrefirmada,
    archivo: Blob,
    onProgreso: (fraccion: number) => void,
    signal?: AbortSignal,
  ): Promise<void>;
  /** Paso 3: el backend verifica el objeto y lo marca CONFIRMADO. */
  confirmarMedia(fichaId: number, mediaId: number): Promise<MediaAdmin>;
  eliminarMedia(fichaId: number, mediaId: number): Promise<void>;
}
