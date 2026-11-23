import { describe, expect, it } from 'vitest';
import { ApiError, NetworkError } from '@/lib/api';
import { mensajeDeError } from './messages';

describe('mensajeDeError', () => {
  it('prioriza el código estable del backend sobre el estado HTTP', () => {
    const error = new ApiError(400, { code: 'TOKEN_INVALIDO' });
    expect(mensajeDeError(error, {}, { TOKEN_INVALIDO: 'Enlace vencido' })).toBe(
      'Enlace vencido',
    );
  });

  it('distingue otro 400 (validación) de un token inválido', () => {
    const error = new ApiError(400, { code: 'VALIDATION_ERROR' });
    expect(
      mensajeDeError(error, { 400: 'x' }, { TOKEN_INVALIDO: 'Enlace vencido' }),
    ).toBe('x');
  });

  it('explica el límite de intentos', () => {
    expect(mensajeDeError(new ApiError(429, { code: 'DEMASIADOS_INTENTOS' }))).toMatch(
      /Demasiados intentos/,
    );
  });

  it('avisa de la sesión expirada', () => {
    expect(mensajeDeError(new ApiError(401, { code: 'SESION_EXPIRADA' }))).toMatch(
      /sesión expiró/,
    );
  });

  it('avisa de fallos de red', () => {
    expect(mensajeDeError(new NetworkError())).toMatch(/conectar/);
  });
});
