import type { Tokens } from './types';

const KEY = 'atlas.tokens';

/**
 * Los tokens viven en sessionStorage: se borran al cerrar la pestaña (RF_029).
 * Todo acceso va envuelto en try/catch porque el almacenamiento puede estar bloqueado.
 */
export const tokenStorage = {
  get(): Tokens | null {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<Tokens>;
      if (
        typeof parsed.accessToken === 'string' &&
        typeof parsed.refreshToken === 'string'
      ) {
        return { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken };
      }
      return null;
    } catch {
      return null;
    }
  },
  set(tokens: Tokens): void {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(tokens));
    } catch {
      /* sin almacenamiento: la sesión dura lo que dure la memoria */
    }
  },
  clear(): void {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* nada que limpiar */
    }
  },
};
