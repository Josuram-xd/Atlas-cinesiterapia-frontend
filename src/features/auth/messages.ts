import { ApiError, NetworkError } from '@/lib/api';

/** Mensajes por código estable del backend; valen para cualquier pantalla. */
const POR_CODIGO: Record<string, string> = {
  CREDENCIALES_INVALIDAS: 'Correo o contraseña incorrectos.',
  CORREO_EN_USO: 'Ese correo ya tiene una cuenta.',
  SESION_EXPIRADA: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  REFRESH_INVALIDO: 'Tu sesión ya no es válida. Vuelve a iniciar sesión.',
  DEMASIADOS_INTENTOS: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
};

/**
 * Traduce un error de la API a un mensaje para la persona. Orden: `porCodigo` de la
 * pantalla, código estable global, `porEstado` de la pantalla y, al final, genérico.
 */
export function mensajeDeError(
  error: unknown,
  porEstado: Partial<Record<number, string>> = {},
  porCodigo: Record<string, string> = {},
): string {
  if (error instanceof NetworkError) {
    return 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  }
  if (error instanceof ApiError) {
    if (error.code && porCodigo[error.code]) return porCodigo[error.code];
    if (porEstado[error.status]) return porEstado[error.status]!;
    if (error.code && POR_CODIGO[error.code]) return POR_CODIGO[error.code];
    if (error.status === 429) return POR_CODIGO.DEMASIADOS_INTENTOS;
    if (error.status >= 500)
      return 'El servidor tuvo un problema. Inténtalo en unos minutos.';
  }
  return 'Algo salió mal. Inténtalo de nuevo.';
}
