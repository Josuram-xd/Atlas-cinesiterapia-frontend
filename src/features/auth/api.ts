import { api } from '@/lib/api';
import type {
  AuthResponse,
  LoginRequest,
  LogoutRequest,
  RecuperarRequest,
  RegistroRequest,
  RegistroResponse,
  RestablecerRequest,
} from '@/lib/api';

export const authApi = {
  login: (datos: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', datos, { auth: false }),
  registro: (datos: RegistroRequest) =>
    api.post<RegistroResponse>('/auth/registro', datos, { auth: false }),
  logout: (datos: LogoutRequest) =>
    api.post<void>('/auth/logout', datos, { auth: false }),
  recuperar: (datos: RecuperarRequest) =>
    api.post<void>('/auth/recuperar', datos, { auth: false }),
  restablecer: (datos: RestablecerRequest) =>
    api.post<void>('/auth/restablecer', datos, { auth: false }),
};
