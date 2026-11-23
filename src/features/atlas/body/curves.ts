/**
 * Utilidades para dibujar el cuerpo con código: curvas suaves (Catmull-Rom centrípeto)
 * que pasan exactamente por los puntos clave, de modo que las regiones vecinas comparten
 * sus bordes sin huecos ni solapes.
 */

export type Pt = [number, number];

/** Punto clave [x, y] con una etiqueta opcional para cortar la curva ahí. */
export type Key = [number, number, string?];

const STEP = 3.5; // distancia aproximada entre puntos densos, en unidades del viewBox

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function lerp(a: Pt, b: Pt, t: number): Pt {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Segmento p1 -> p2 de una Catmull-Rom centrípeta (Barry-Goldman). Excluye p1, incluye p2. */
function segment(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number): Pt[] {
  const d01 = Math.max(Math.sqrt(dist(p0, p1)), 1e-6);
  const d12 = Math.max(Math.sqrt(dist(p1, p2)), 1e-6);
  const d23 = Math.max(Math.sqrt(dist(p2, p3)), 1e-6);
  const t0 = 0;
  const t1 = t0 + d01;
  const t2 = t1 + d12;
  const t3 = t2 + d23;
  const out: Pt[] = [];
  for (let i = 1; i <= n; i++) {
    const t = t1 + ((t2 - t1) * i) / n;
    const a1 = lerp(p0, p1, (t - t0) / (t1 - t0));
    const a2 = lerp(p1, p2, (t - t1) / (t2 - t1));
    const a3 = lerp(p2, p3, (t - t2) / (t3 - t2));
    const b1 = lerp(a1, a2, (t - t0) / (t2 - t0));
    const b2 = lerp(a2, a3, (t - t1) / (t3 - t1));
    out.push(lerp(b1, b2, (t - t1) / (t2 - t1)));
  }
  return out;
}

export class Curve {
  private readonly pts: Pt[] = [];
  private readonly idx = new Map<string, number>();

  constructor(keys: Key[]) {
    const p = keys.map((k): Pt => [k[0], k[1]]);
    this.pts.push(p[0]);
    keys.forEach((k, i) => {
      if (i > 0) {
        const before =
          p[i - 2] ?? ([2 * p[i - 1][0] - p[i][0], 2 * p[i - 1][1] - p[i][1]] as Pt);
        const after =
          p[i + 1] ?? ([2 * p[i][0] - p[i - 1][0], 2 * p[i][1] - p[i - 1][1]] as Pt);
        const n = Math.max(2, Math.ceil(dist(p[i - 1], p[i]) / STEP));
        this.pts.push(...segment(before, p[i - 1], p[i], after, n));
      }
      if (k[2]) this.idx.set(k[2], this.pts.length - 1);
    });
  }

  /** Puntos entre dos etiquetas (en orden inverso si `a` está después de `b`). */
  slice(a: string, b: string): Pt[] {
    const i = this.idx.get(a);
    const j = this.idx.get(b);
    if (i === undefined || j === undefined)
      throw new Error(`Etiqueta desconocida: ${a} o ${b}`);
    return i <= j ? this.pts.slice(i, j + 1) : this.pts.slice(j, i + 1).reverse();
  }

  /** Todos los puntos, de la primera clave a la última. */
  all(): Pt[] {
    return [...this.pts];
  }
}

export const mirror = (p: Pt): Pt => [400 - p[0], p[1]];

/** Región centrada: se da la mitad izquierda de arriba abajo y se refleja la derecha. */
export function symmetric(left: Pt[]): Pt[][] {
  return [[...left, ...left.map(mirror).reverse()]];
}

/** Región de ambos lados (brazos, piernas, hombros): el contorno y su reflejo. */
export function bilateral(poly: Pt[]): Pt[][] {
  return [poly, poly.map(mirror)];
}

const r = (n: number) => Math.round(n * 10) / 10;

export function toPath(polys: Pt[][]): string {
  return polys
    .map((poly) => `M${poly.map((p) => `${r(p[0])} ${r(p[1])}`).join('L')}Z`)
    .join('');
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function boundsOf(poly: Pt[]): Box {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}
