import { describe, expect, it } from 'vitest';
import { validarCorreo, validarPasswordNueva } from './validation';

describe('validación alineada con el backend', () => {
  it('rechaza contraseñas de menos de 8 caracteres', () => {
    expect(validarPasswordNueva('corta12')).toMatch(/8/);
  });
  it('rechaza contraseñas de más de 72 caracteres (límite de BCrypt)', () => {
    expect(validarPasswordNueva('a'.repeat(73))).toMatch(/72/);
    expect(validarPasswordNueva('a'.repeat(72))).toBeUndefined();
  });
  it('rechaza correos de más de 255 caracteres', () => {
    expect(validarCorreo(`${'a'.repeat(260)}@b.co`)).toMatch(/255/);
  });
});
