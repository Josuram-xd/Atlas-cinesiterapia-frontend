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
