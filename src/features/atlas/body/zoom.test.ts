import { describe, expect, it } from 'vitest';
import { encuadreCompleto, encuadreDe, encuadreEnVentana, focoDe } from './zoom';

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

describe('encuadreEnVentana', () => {
  const caja = { x: 150, y: 612, w: 40, h: 64 };
  const svg = { left: 0, top: 0, width: 400, height: 700 };

  it('con una ventana igual al contenedor equivale a encuadreDe', () => {
    const e = encuadreEnVentana(caja, svg, svg);
    const esperado = encuadreDe(caja, svg.width / svg.height);
    expect(e.x).toBeCloseTo(esperado.x);
    expect(e.w).toBeCloseTo(esperado.w);
  });

  it('el viewBox cubre todo el contenedor con la misma escala que la ventana', () => {
    const ventana = { left: 100, top: 80, width: 200, height: 540 };
    const e = encuadreEnVentana(caja, svg, ventana);
    // El contenedor mide el doble de ancho que la ventana: el viewBox, el doble de ancho
    // que el encuadre de la ventana, y las dos proporciones coinciden con las de pantalla.
    expect(e.w / e.h).toBeCloseTo(svg.width / svg.height, 5);
    const escala = svg.width / e.w; // px por unidad
    expect(escala).toBeCloseTo(
      ventana.width / encuadreDe(caja, ventana.width / ventana.height).w,
      5,
    );
  });

  it('centra la caja en el centro de la ventana, no del contenedor', () => {
    const ventana = { left: 0, top: 0, width: 200, height: 700 }; // mitad izquierda
    const e = encuadreEnVentana(caja, svg, ventana);
    const escala = svg.width / e.w;
    const centroCajaPx = (caja.x + caja.w / 2 - e.x) * escala;
    expect(centroCajaPx).toBeCloseTo(100, 3); // centro de la ventana en px
  });
});
