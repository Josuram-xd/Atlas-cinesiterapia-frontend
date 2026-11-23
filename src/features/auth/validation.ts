const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PASSWORD_MIN = 10;
/** BCrypt trunca a 72 bytes; el backend rechaza más. */
export const PASSWORD_MAX = 72;
export const CORREO_MAX = 254;

export function validarCorreo(correo: string): string | undefined {
  const valor = correo.trim();
  if (!valor) return 'Escribe tu correo.';
  if (!EMAIL.test(valor))
    return 'El correo no parece válido. Revisa que tenga @ y dominio.';
  if (valor.length > CORREO_MAX)
    return `El correo es demasiado largo (máximo ${CORREO_MAX}).`;
  return undefined;
}

export function validarPasswordNueva(password: string): string | undefined {
  if (!password) return 'Escribe una contraseña.';
  if (password.length < PASSWORD_MIN) {
    return `Usa al menos ${PASSWORD_MIN} caracteres.`;
  }
  if (password.length > PASSWORD_MAX) {
    return `Usa como máximo ${PASSWORD_MAX} caracteres.`;
  }
  // Misma regla que el backend (PasswordSegura); aquí solo es ayuda, el servidor decide.
  if (!/\p{L}/u.test(password) || !/\p{N}/u.test(password)) {
    return 'Combina letras y números.';
  }
  return undefined;
}
