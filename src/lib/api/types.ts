/**
 * Contrato de la API en un solo lugar. Fuente de verdad: el backend
 * (Atlas-cinesiterapia-backend, rama task-1-autenticacion: DTOs de auth y ApiError).
 */

/** Rol elegido al registrarse (HU-17). */
export type RolPerfil = 'ESTUDIANTE' | 'PROFESIONAL' | 'PRACTICANTE' | 'VISITANTE';

/** Rol de sistema que decide los permisos. */
export type RolSistema = 'USER' | 'ADMIN';

export interface Usuario {
  id: number;
  correo: string;
  rolPerfil: RolPerfil;
  rolSistema: RolSistema;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/** Respuesta de /auth/login y /auth/refresh. */
export interface AuthResponse extends Tokens {
  tokenType: 'Bearer';
  /** Vigencia del access token en segundos. */
  expiresIn: number;
  usuario: Usuario;
}

// --- Peticiones de autenticación -------------------------------------------------

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface RegistroRequest {
  correo: string;
  password: string;
  rolPerfil: RolPerfil;
}

/** Respuesta de /auth/registro: la cuenta queda creada y la persona inicia sesión aparte. */
export type RegistroResponse = Usuario;

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface RecuperarRequest {
  correo: string;
}

/** POST /auth/recuperar responde 202 con un mensaje neutro (no revela si el correo existe). */
export interface RecuperarResponse {
  mensaje: string;
}

export interface RestablecerRequest {
  token: string;
  /** El backend la llama nuevaPassword (no password). */
  nuevaPassword: string;
}

/** POST /auth/cierre-pendiente: lo envía `navigator.sendBeacon` en `pagehide`. */
export interface CierrePendienteRequest {
  refreshToken: string;
}

// --- Catálogo del atlas ----------------------------------------------------------

export type VistaCuerpo = 'ANTERIOR' | 'POSTERIOR';

export interface Region {
  id: number;
  nombre: string;
  /**
   * Id del `<path>` dentro del SVG (columna `svg_id` del backend). Lleva el prefijo de la
   * vista, `<vista>-<region>` (ej. `anterior-rodilla`), porque algunas regiones como
   * cabeza-cuello existen en ambas vistas y el id debe ser único.
   */
  svgId: string;
  vista: VistaCuerpo;
  orden: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  orden: number;
}

/** GET /regiones/{id}/categorias: las 9 categorías con las fichas publicadas de esa región. */
export interface CategoriaConConteo extends Categoria {
  totalEjercicios: number;
}

export interface RegionRef {
  id: number;
  nombre: string;
  svgId: string;
  vista?: VistaCuerpo;
}

export interface CategoriaRef {
  id: number;
  nombre: string;
}

/** Ejercicio publicado tal como aparece en listados y búsqueda (EjercicioResumenResponse). */
export interface EjercicioResumen {
  id: number;
  nombre: string;
  region: RegionRef;
  categoria: CategoriaRef;
}

// --- Ficha de ejercicio ----------------------------------------------------------

export type MediaTipo = 'VIDEO' | 'IMAGEN';
export type MediaRol = 'POSICION_INICIAL' | 'POSICION_FINAL' | 'TOMA_TERAPEUTA' | 'OTRO';

export interface Media {
  id: number;
  tipo: MediaTipo;
  /** `null` en video. */
  rol: MediaRol | null;
  contentType: string;
  tamanoBytes: number;
  /** URL de lectura; puede ser temporal, se usa tal cual. */
  url: string;
  orden: number;
}

/** Texto libre por campo ("3x12", "hasta fatiga"). */
export interface Dosificacion {
  series: string;
  repeticiones: string;
  intensidad: string;
  tiempo: string;
  descanso: string;
  frecuencia: string;
}

/** Ficha completa publicada (GET /ejercicios/{id}). */
export interface Ejercicio {
  id: number;
  nombre: string;
  region: RegionRef & { vista: VistaCuerpo };
  categoria: CategoriaRef;
  objetivoTerapeutico: string;
  estructurasIntervenidas: string;
  indicaciones: string;
  precaucionesContraindicaciones: string;
  posicionPaciente: string;
  posicionFisioterapeuta: string;
  ejecucion: string;
  comandosVerbales: string;
  dosificacion: Dosificacion;
  progresion: string | null;
  erroresComunes: string | null;
  estudiantesCreadores: string[];
  /** "AAAA-N", p. ej. "2025-1". */
  cohorte: string;
  profesoraRevisora: string;
  video: Media | null;
  imagenes: Media[];
  actualizadoEn: string;
}

// --- Errores ---------------------------------------------------------------------

/** Un campo inválido dentro de `fieldErrors`. */
export interface FieldViolation {
  field: string;
  message: string;
}

/**
 * Formato uniforme de error del backend (ApiError). `code` es estable; `message` va en
 * español sin tildes y no se muestra tal cual. `fieldErrors` se omite si está vacío.
 */
export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  code?: string;
  message?: string;
  path?: string;
  fieldErrors?: FieldViolation[];
}
