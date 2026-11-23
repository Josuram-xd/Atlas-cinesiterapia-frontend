import { describe, expect, it } from 'vitest';
import { validarCorreo, validarPasswordNueva } from './validation';

describe('validación alineada con el backend', () => {
  it('rechaza contraseñas de menos de 10 caracteres', () => {
    expect(validarPasswordNueva('corta1234')).toMatch(/10/);
  });
  it('rechaza contraseñas de más de 72 caracteres (límite de BCrypt)', () => {
    expect(validarPasswordNueva('a1'.repeat(37))).toMatch(/72/);
    expect(validarPasswordNueva('a1'.repeat(36))).toBeUndefined();
  });
  it('exige letras y números', () => {
    expect(validarPasswordNueva('soloLetrasAqui')).toMatch(/letras y números/);
    expect(validarPasswordNueva('12345678901')).toMatch(/letras y números/);
    expect(validarPasswordNueva('rodilla2026x')).toBeUndefined();
  });
  it('rechaza correos de más de 254 caracteres y dominios sin extensión', () => {
    expect(validarCorreo(`${'a'.repeat(260)}@b.co`)).toMatch(/254/);
    expect(validarCorreo('ana@b')).toBeDefined();
  });
});
