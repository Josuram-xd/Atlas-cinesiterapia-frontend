import { describe, expect, it } from 'vitest';
import { ApiError } from './errors';

describe('ApiError', () => {
  it('lee el formato ApiError del backend', () => {
    const error = new ApiError(400, {
      timestamp: '2026-01-01T00:00:00Z',
      status: 400,
      error: 'Bad Request',
      code: 'VALIDATION_ERROR',
      message: 'Datos de entrada invalidos',
      path: '/auth/registro',
      fieldErrors: [
        { field: 'correo', message: 'Correo invalido' },
        {
          field: 'password',
          message: 'La contrasena debe tener entre 8 y 72 caracteres',
        },
      ],
    });
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Datos de entrada invalidos');
    expect(error.fieldErrors).toEqual({
      correo: 'Correo invalido',
      password: 'La contrasena debe tener entre 8 y 72 caracteres',
    });
  });

  it('sin errores por campo deja fieldErrors vacío (el backend omite la lista)', () => {
    const error = new ApiError(401, { status: 401, code: 'CREDENCIALES_INVALIDAS' });
    expect(error.fieldErrors).toEqual({});
  });

  it('guarda Retry-After cuando el límite de intentos responde 429', () => {
    const error = new ApiError(429, { code: 'DEMASIADOS_INTENTOS' }, { retryAfter: 60 });
    expect(error.retryAfter).toBe(60);
  });

  it('usa un mensaje por defecto si el cuerpo no es JSON', () => {
    expect(new ApiError(502, undefined).message).toBe('Error inesperado');
  });
});
