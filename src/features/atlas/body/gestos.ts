import type { Box } from './curves';

export interface Punto {
  x: number;
  y: number;
}

/** Posición y tamaño en pantalla (px) del elemento SVG. */
export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Alto mínimo de la cámara con el pellizco: evita acercarse hasta perder la forma. */
export const ALTO_MIN_GESTO = 120;
/** Desplazamiento (px) a partir del cual un toque se considera arrastre. */
export const UMBRAL_TOQUE = 8;

const distancia = (a: Punto, b: Punto) => Math.hypot(a.x - b.x, a.y - b.y);
const medio = (a: Punto, b: Punto): Punto => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/** Mantiene la caja dentro del límite; si es mayor que el límite, la centra. */
export function limitarCaja(caja: Box, limite: Box): Box {
  const eje = (pos: number, tam: number, lpos: number, ltam: number) =>
    tam >= ltam
      ? lpos + ltam / 2 - tam / 2
      : Math.min(Math.max(pos, lpos), lpos + ltam - tam);
  return {
    x: eje(caja.x, caja.w, limite.x, limite.w),
    y: eje(caja.y, caja.h, limite.y, limite.h),
    w: caja.w,
    h: caja.h,
  };
}

/** True si el dedo apenas se movió: es un toque (elige la región), no un arrastre. */
export function esToque(inicio: Punto, fin: Punto): boolean {
  return distancia(inicio, fin) < UMBRAL_TOQUE;
}

/**
 * Nueva cámara tras mover los dedos de `antes` a `despues` (px de pantalla, mismos índices).
 * - Un dedo: arrastra el dibujo con el dedo.
 * - Dos dedos: pellizco (zoom) manteniendo bajo los dedos el punto que estaba entre ellos,
 *   y también arrastra si el punto medio se desplaza.
 * El resultado nunca sale de `limite` ni baja de `ALTO_MIN_GESTO` de alto.
 */
export function moverGesto(
  caja: Box,
  antes: Punto[],
  despues: Punto[],
  rect: Rect,
  limite: Box,
): Box {
  if (antes.length === 0 || antes.length !== despues.length) return caja;
  if (rect.width <= 0 || caja.w <= 0 || caja.h <= 0) return caja;
  const pxPorUnidad = rect.width / caja.w;

  const mAntes = antes.length > 1 ? medio(antes[0], antes[1]) : antes[0];
  const mDespues = despues.length > 1 ? medio(despues[0], despues[1]) : despues[0];

  let factor = 1;
  if (antes.length > 1 && despues.length > 1) {
    const dA = distancia(antes[0], antes[1]);
    const dD = distancia(despues[0], despues[1]);
    if (dA > 0 && dD > 0) factor = dA / dD;
  }
  const minFactor = ALTO_MIN_GESTO / caja.h;
  const maxFactor = limite.h / caja.h;
  factor = Math.min(Math.max(factor, minFactor), maxFactor);

  // Punto del dibujo (unidades) que estaba bajo el punto medio de los dedos.
  const bajoDedos: Punto = {
    x: caja.x + (mAntes.x - rect.left) / pxPorUnidad,
    y: caja.y + (mAntes.y - rect.top) / pxPorUnidad,
  };
  const w = caja.w * factor;
  const h = caja.h * factor;
  const nuevoPx = rect.width / w;
  const nueva: Box = {
    x: bajoDedos.x - (mDespues.x - rect.left) / nuevoPx,
    y: bajoDedos.y - (mDespues.y - rect.top) / nuevoPx,
    w,
    h,
  };
  return limitarCaja(nueva, limite);
}
