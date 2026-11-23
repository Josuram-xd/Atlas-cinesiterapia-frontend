import { describe, expect, it } from 'vitest';
import { urlSegura } from './urlSegura';

describe('urlSegura', () => {
  it('acepta http, https y rutas del propio sitio', () => {
    expect(urlSegura('https://cdn.ejemplo.com/a.png?firma=1')).toBe(
      'https://cdn.ejemplo.com/a.png?firma=1',
    );
    expect(urlSegura('http://localhost:9000/a.png')).toBe('http://localhost:9000/a.png');
    expect(urlSegura('/mock/toma.svg')).toBe('/mock/toma.svg');
  });
  it('rechaza esquemas peligrosos y valores vacíos', () => {
    for (const mala of [
      'javascript:alert(1)',
      'data:text/html;base64,AAAA',
      'file:///etc/passwd',
      '//evil.com/x.png',
      '/\\evil.com',
      'no es url',
      '',
      null,
      undefined,
    ]) {
      expect(urlSegura(mala)).toBeNull();
    }
  });
});
