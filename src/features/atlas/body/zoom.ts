import { BODY_VIEWBOX, GEOMETRIA, type VistaId } from './geometry';
import type { Box } from './curves';

export type Lado = 'izquierdo' | 'derecho';

/** Alto mínimo del encuadre: evita acercarse demasiado a regiones pequeñas (codo, muñeca). */
const ALTO_MIN = 170;
const MARGEN = 0.28;

/**
 * Encuadre (viewBox) que muestra una caja con margen y con la proporción del contenedor,
 * para que el SVG no deje bandas vacías a los lados.
 */
export function encuadreDe(caja: Box, proporcion: number): Box {
  let w = caja.w * (1 + MARGEN * 2);
  let h = caja.h * (1 + MARGEN * 2);
  h = Math.max(h, ALTO_MIN);
  w = Math.max(w, h * proporcion);
  h = Math.max(h, w / proporcion);
  return { x: caja.x + caja.w / 2 - w / 2, y: caja.y + caja.h / 2 - h / 2, w, h };
}

/** Caja de una región en la vista dada; las regiones de ambos lados usan el lado elegido. */
export function focoDe(vista: VistaId, svgId: string, lado: Lado): Box | null {
  const slug = svgId.replace(`${vista}-`, '');
  const geo = GEOMETRIA[vista][slug];
  if (!geo) return null;
  return geo.focos.length > 1 && lado === 'derecho' ? geo.focos[1] : geo.focos[0];
}

/** Encuadre del cuerpo completo para la proporción dada (equivale al viewBox de reposo). */
export function encuadreCompleto(proporcion: number): Box {
  const { x, y, w, h } = BODY_VIEWBOX;
  const ancho = Math.max(w, h * proporcion);
  return { x: x + w / 2 - ancho / 2, y, w: ancho, h };
}

export const aTexto = (b: Box): string =>
  `${round(b.x)} ${round(b.y)} ${round(b.w)} ${round(b.h)}`;

const round = (n: number) => Math.round(n * 100) / 100;

/** Posición y tamaño en pantalla (px). */
export interface RectPx {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Encuadre que deja la caja centrada y ajustada dentro de una `ventana` (por ejemplo, el
 * hueco que dejan los menús alrededor del dibujo), pero con un viewBox que cubre todo el
 * `contenedor` del SVG: el dibujo sigue siendo visible bajo y alrededor de los menús.
 * Ambos rectángulos están en coordenadas de pantalla.
 */
export function encuadreEnVentana(caja: Box, contenedor: RectPx, ventana: RectPx): Box {
  const ajustado = encuadreDe(caja, ventana.width / ventana.height);
  const escala = ventana.width / ajustado.w; // px por unidad
  const centroVentana = {
    x: ventana.left + ventana.width / 2 - contenedor.left,
    y: ventana.top + ventana.height / 2 - contenedor.top,
  };
  const w = contenedor.width / escala;
  const h = contenedor.height / escala;
  return {
    x: ajustado.x + ajustado.w / 2 - centroVentana.x / escala,
    y: ajustado.y + ajustado.h / 2 - centroVentana.y / escala,
    w,
    h,
  };
}
