/**
 * Contrato de la API en un solo lugar.
 * El backend aún no está desplegado: estos tipos reflejan el contrato descrito en
 * Atlas-cinesiterapia-backend/TASKS.md y deben ajustarse cuando exista el OpenAPI real.
 */

/** Rol elegido al registrarse (HU-17). */
export type RolPerfil = 'ESTUDIANTE' | 'PROFESIONAL' | 'PRACTICANTE' | 'VISITANTE';

/** Rol de sistema que decide los permisos. */
export type RolSistema = 'USUARIO' | 'ADMIN';

export interface Usuario {
  id: string;
  correo: string;
  rolPerfil: RolPerfil;
  rol: RolSistema;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/** Respuesta de /auth/login, /auth/registro y /auth/refresh. */
export interface AuthResponse extends Tokens {
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

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface RecuperarRequest {
  correo: string;
}

export interface RestablecerRequest {
  token: string;
  password: string;
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
  /** Id del `<path>` dentro del SVG del cuerpo. */
  svgId: string;
  vista: VistaCuerpo;
}

export interface Categoria {
  id: number;
  nombre: string;
}

// --- Errores ---------------------------------------------------------------------

/** Formato uniforme de error del backend (ControllerAdvice). */
export interface ApiErrorBody {
  message?: string;
  code?: string;
  /** Errores por campo, cuando aplica. */
  errors?: Record<string, string>;
}
