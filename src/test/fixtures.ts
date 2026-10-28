import type { AuthResponse, Usuario } from '@/lib/api';

/** Usuario con la forma exacta de UsuarioResponse del backend. */
export const usuarioDemo: Usuario = {
  id: 1,
  correo: 'ana@correo.com',
  rolPerfil: 'ESTUDIANTE',
  rolSistema: 'USER',
};

export const adminDemo: Usuario = {
  ...usuarioDemo,
  id: 2,
  correo: 'admin@correo.com',
  rolSistema: 'ADMIN',
};

/** Respuesta de /auth/login y /auth/refresh (TokenResponse del backend). */
export function authDemo(
  extra: Partial<AuthResponse> & { usuario?: Usuario } = {},
): AuthResponse {
  return {
    accessToken: 'a',
    refreshToken: 'r',
    tokenType: 'Bearer',
    expiresIn: 900,
    usuario: usuarioDemo,
    ...extra,
  };
}
