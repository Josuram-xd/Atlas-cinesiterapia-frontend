import { describe, expect, it } from 'vitest';
import { rutaLocal } from './rutaLocal';

describe('rutaLocal', () => {
  it('acepta rutas internas', () => {
    expect(rutaLocal('/admin')).toBe('/admin');
    expect(rutaLocal('/restablecer?token=1')).toBe('/restablecer?token=1');
  });

  it('descarta destinos externos o ambiguos', () => {
    expect(rutaLocal('https://malo.example')).toBe('/');
    expect(rutaLocal('//malo.example')).toBe('/');
    expect(rutaLocal('/\\malo.example')).toBe('/');
    expect(rutaLocal('javascript:alert(1)')).toBe('/');
    expect(rutaLocal(undefined)).toBe('/');
  });
});
