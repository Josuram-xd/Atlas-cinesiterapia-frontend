const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN = 8;

export function validarCorreo(correo: string): string | undefined {
  const valor = correo.trim();
  if (!valor) return 'Escribe tu correo.';
  if (!EMAIL.test(valor))
    return 'El correo no parece válido. Revisa que tenga @ y dominio.';
  return undefined;
}

export function validarPasswordNueva(password: string): string | undefined {
  if (!password) return 'Escribe una contraseña.';
  if (password.length < PASSWORD_MIN) {
    return `Usa al menos ${PASSWORD_MIN} caracteres.`;
  }
  return undefined;
}
