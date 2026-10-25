import { describe, expect, it } from 'vitest';
import { encuadreCompleto, encuadreDe, focoDe } from './zoom';

describe('zoom', () => {
  it('el encuadre conserva la proporción del contenedor y contiene la caja', () => {
    const caja = { x: 150, y: 612, w: 40, h: 64 };
    const e = encuadreDe(caja, 0.8);
    expect(e.w / e.h).toBeCloseTo(0.8, 5);
    expect(e.x).toBeLessThan(caja.x);
    expect(e.x + e.w).toBeGreaterThan(caja.x + caja.w);
    expect(e.y).toBeLessThan(caja.y);
    expect(e.y + e.h).toBeGreaterThan(caja.y + caja.h);
  });

  it('no se acerca más allá del alto mínimo en regiones pequeñas', () => {
    const e = encuadreDe({ x: 88, y: 300, w: 30, h: 42 }, 1);
    expect(e.h).toBeGreaterThanOrEqual(170);
  });

  it('elige el lado izquierdo o derecho del dibujo en regiones de ambos lados', () => {
    const izq = focoDe('anterior', 'anterior-rodilla', 'izquierdo')!;
    const der = focoDe('anterior', 'anterior-rodilla', 'derecho')!;
    expect(izq.x).toBeLessThan(200);
    expect(der.x).toBeGreaterThan(200);
  });

  it('las regiones centrales usan siempre la misma caja', () => {
    expect(focoDe('anterior', 'anterior-abdomen', 'derecho')).toEqual(
      focoDe('anterior', 'anterior-abdomen', 'izquierdo'),
    );
    expect(focoDe('anterior', 'anterior-nada', 'izquierdo')).toBeNull();
  });

  it('el encuadre completo equivale al lienzo cuando la proporción es la del cuerpo', () => {
    expect(encuadreCompleto(400 / 900)).toEqual({ x: 0, y: 0, w: 400, h: 900 });
    expect(encuadreCompleto(2).w).toBe(1800);
  });
});
