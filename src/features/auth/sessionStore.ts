import { create } from 'zustand';
import {
  refreshSession,
  setSessionExpiredHandler,
  setTokensRefreshedHandler,
  tokenStorage,
  type AuthResponse,
  type Usuario,
} from '@/lib/api';
import { authApi } from './api';

const USUARIO_KEY = 'atlas.usuario';

type EstadoSesion = 'iniciando' | 'autenticado' | 'anonimo';

interface SessionState {
  estado: EstadoSesion;
  usuario: Usuario | null;
  /** Guarda tokens y usuario tras un login exitoso. */
  iniciar: (auth: AuthResponse) => void;
  /** Cierra la sesión de inmediato (HU-19): limpia local y avisa al backend. */
  cerrarSesion: () => Promise<void>;
  /** Al abrir la app: renueva la sesión guardada. El refresh cancela un cierre pendiente. */
  recuperar: () => Promise<void>;
}

function leerUsuario(): Usuario | null {
  try {
    const raw = sessionStorage.getItem(USUARIO_KEY);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  } catch {
    return null;
  }
}

function guardarUsuario(usuario: Usuario | null): void {
  try {
    if (usuario) sessionStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
    else sessionStorage.removeItem(USUARIO_KEY);
  } catch {
    /* sin almacenamiento: el usuario se vuelve a pedir en el próximo refresh */
  }
}

let recuperacion: Promise<void> | null = null;

export const useSession = create<SessionState>((set) => ({
  estado: tokenStorage.get() ? 'iniciando' : 'anonimo',
  usuario: null,

  iniciar: (auth) => {
    tokenStorage.set({ accessToken: auth.accessToken, refreshToken: auth.refreshToken });
    guardarUsuario(auth.usuario);
    set({ estado: 'autenticado', usuario: auth.usuario });
  },

  cerrarSesion: async () => {
    const tokens = tokenStorage.get();
    tokenStorage.clear();
    guardarUsuario(null);
    set({ estado: 'anonimo', usuario: null });
    if (tokens) {
      try {
        await authApi.logout({ refreshToken: tokens.refreshToken });
      } catch {
        /* la sesión local ya está cerrada; el backend la invalidará al expirar */
      }
    }
  },

  recuperar: () => {
    recuperacion ??= (async () => {
      if (!tokenStorage.get()) {
        set({ estado: 'anonimo', usuario: null });
        return;
      }
      const renovada = await refreshSession();
      if (renovada) return; // el handler de refresh ya dejó la sesión autenticada
      // Sin red: se conserva la sesión con el usuario guardado para poder leer el atlas.
      const guardado = leerUsuario();
      if (tokenStorage.get() && guardado)
        set({ estado: 'autenticado', usuario: guardado });
      else set({ estado: 'anonimo', usuario: null });
    })().finally(() => {
      recuperacion = null;
    });
    return recuperacion;
  },
}));

// El cliente HTTP avisa al store cuando renueva o pierde la sesión.
setTokensRefreshedHandler((auth) => {
  guardarUsuario(auth.usuario);
  useSession.setState({ estado: 'autenticado', usuario: auth.usuario });
});
setSessionExpiredHandler(() => {
  guardarUsuario(null);
  useSession.setState({ estado: 'anonimo', usuario: null });
});

/** Restablece el store al estado inicial (pruebas). */
export function reiniciarSesionParaPruebas(): void {
  recuperacion = null;
  useSession.setState({ estado: 'anonimo', usuario: null });
}
