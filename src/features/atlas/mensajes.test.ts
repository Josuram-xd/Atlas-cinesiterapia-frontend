import { describe, expect, it } from 'vitest';
import { ApiError, NetworkError } from '@/lib/api';
import { mensajeDeErrorAtlas } from './mensajes';

describe('mensajeDeErrorAtlas', () => {
  it('explica los fallos de red', () => {
    expect(mensajeDeErrorAtlas(new NetworkError())).toMatch(/conectar/i);
  });

  it('explica los errores del servidor', () => {
    expect(mensajeDeErrorAtlas(new ApiError(503, { code: 'INTERNAL_ERROR' }))).toMatch(
      /servidor/i,
    );
  });

  it('explica la sesión vencida', () => {
    expect(mensajeDeErrorAtlas(new ApiError(401, { code: 'NO_AUTENTICADO' }))).toMatch(
      /sesión/i,
    );
  });

  it('usa un mensaje genérico para cualquier otro error', () => {
    expect(mensajeDeErrorAtlas(new Error('x'))).toMatch(/No pudimos cargar/);
  });
});
