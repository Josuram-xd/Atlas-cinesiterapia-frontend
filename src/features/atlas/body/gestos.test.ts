import { describe, expect, it } from 'vitest';
import { esToque, limitarCaja, moverGesto, type Rect } from './gestos';

const LIMITE = { x: 0, y: 0, w: 400, h: 900 };
/** Contenedor de 400x900 px que muestra 400x900 unidades: 1 px = 1 unidad. */
const RECT: Rect = { left: 0, top: 0, width: 400, height: 900 };

describe('limitarCaja', () => {
  it('mantiene la caja dentro del cuerpo', () => {
    expect(limitarCaja({ x: -50, y: -20, w: 200, h: 450 }, LIMITE)).toEqual({
      x: 0,
      y: 0,
      w: 200,
      h: 450,
    });
    expect(limitarCaja({ x: 350, y: 700, w: 200, h: 450 }, LIMITE)).toEqual({
      x: 200,
      y: 450,
      w: 200,
      h: 450,
    });
  });

  it('si la caja es más grande que el límite, la centra', () => {
    const caja = limitarCaja({ x: -300, y: 0, w: 900, h: 900 }, LIMITE);
    expect(caja.x).toBe(-250);
  });
});

describe('moverGesto', () => {
  const caja = { x: 100, y: 200, w: 200, h: 450 };

  it('un dedo arrastra: la caja se mueve en sentido contrario al dedo', () => {
    const nueva = moverGesto(
      caja,
      [{ x: 100, y: 100 }],
      [{ x: 110, y: 130 }],
      RECT,
      LIMITE,
    );
    // El contenedor muestra 200 unidades en 400 px: 1 px = 0.5 unidades.
    expect(nueva.x).toBeCloseTo(95);
    expect(nueva.y).toBeCloseTo(185);
    expect(nueva.w).toBe(200);
  });

  it('el arrastre no saca el cuerpo del límite', () => {
    const nueva = moverGesto(
      { x: 5, y: 5, w: 200, h: 450 },
      [{ x: 100, y: 100 }],
      [{ x: 300, y: 300 }],
      RECT,
      LIMITE,
    );
    expect(nueva.x).toBe(0);
    expect(nueva.y).toBe(0);
  });

  it('dos dedos que se separan acercan, manteniendo el punto bajo los dedos', () => {
    const antes = [
      { x: 150, y: 400 },
      { x: 250, y: 400 },
    ];
    const despues = [
      { x: 100, y: 400 },
      { x: 300, y: 400 },
    ];
    const nueva = moverGesto(caja, antes, despues, RECT, LIMITE);
    expect(nueva.w).toBeCloseTo(100);
    expect(nueva.h).toBeCloseTo(225);
    // El punto medio (200 px) caía en la unidad 100 + 200*0.5 = 200; sigue ahí.
    expect(nueva.x + (200 / 400) * nueva.w).toBeCloseTo(200);
  });

  it('dos dedos que se juntan alejan, sin pasar del cuerpo completo', () => {
    const antes = [
      { x: 100, y: 400 },
      { x: 300, y: 400 },
    ];
    const despues = [
      { x: 190, y: 400 },
      { x: 210, y: 400 },
    ];
    const nueva = moverGesto(caja, antes, despues, RECT, LIMITE);
    expect(nueva.w).toBe(400);
    expect(nueva.h).toBe(900);
  });

  it('no se acerca más allá del mínimo', () => {
    const antes = [
      { x: 190, y: 400 },
      { x: 210, y: 400 },
    ];
    const despues = [
      { x: 0, y: 400 },
      { x: 400, y: 400 },
    ];
    const nueva = moverGesto(caja, antes, despues, RECT, LIMITE);
    expect(nueva.h).toBeGreaterThanOrEqual(120);
  });

  it('sin movimiento devuelve la misma caja', () => {
    const p = [{ x: 10, y: 10 }];
    expect(moverGesto(caja, p, p, RECT, LIMITE)).toEqual(caja);
  });
});

describe('esToque', () => {
  it('un desplazamiento pequeño sigue siendo un toque', () => {
    expect(esToque({ x: 10, y: 10 }, { x: 13, y: 12 })).toBe(true);
  });
  it('un desplazamiento grande es un arrastre', () => {
    expect(esToque({ x: 10, y: 10 }, { x: 30, y: 10 })).toBe(false);
  });
});
