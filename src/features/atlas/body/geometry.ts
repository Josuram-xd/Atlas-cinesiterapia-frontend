import {
  bilateral,
  boundsOf,
  Curve,
  symmetric,
  toPath,
  type Box,
  type Pt,
} from './curves';

/**
 * Silueta estilizada del cuerpo, dibujada por nosotros (sin licencias externas).
 * Lienzo de 400 x 900. Todo se define para el lado izquierdo del dibujo (x < 200) y se
 * refleja. Las regiones se recortan de las mismas curvas, así que comparten bordes.
 */
export const BODY_VIEWBOX: Box = { x: 0, y: 0, w: 400, h: 900 };

export type VistaId = 'anterior' | 'posterior';

// --- Cabeza y cuello ------------------------------------------------------------------

const HEAD = { cx: 200, cy: 64, rx: 31, ry: 44 };
const CHIN_CUT_Y = 104;

/** Mitad izquierda de la cabeza, desde la coronilla hasta el corte de la mandíbula. */
function headLeft(): Pt[] {
  const t1 = Math.acos((HEAD.cy - CHIN_CUT_Y) / HEAD.ry);
  const pts: Pt[] = [];
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const t = (t1 * i) / steps;
    // La mandíbula se estrecha un poco: la cabeza queda en forma de huevo.
    const taper = Math.cos(t) < 0 ? 1 - 0.1 * Math.cos(t) ** 2 : 1;
    pts.push([HEAD.cx - HEAD.rx * Math.sin(t) * taper, HEAD.cy - HEAD.ry * Math.cos(t)]);
  }
  return pts;
}

const headPts = headLeft();
const chinL = headPts[headPts.length - 1];

const neck = new Curve([
  [chinL[0], chinL[1], 'chin'],
  [188, 118],
  [186, 130],
  [178, 141, 'N'],
]);

// --- Brazo (lado izquierdo del dibujo) -----------------------------------------------

/** Contorno exterior: base del cuello, trapecio, deltoides y brazo hasta la mano. */
const armOuter = new Curve([
  [178, 141, 'N'],
  [160, 144],
  [150, 148, 'P'],
  [132, 155],
  [116, 168],
  [108, 182],
  [106, 196, 'D'],
  [101, 220],
  [95, 260],
  [90, 300, 'brazo'],
  [88, 325],
  [86, 342, 'codo'],
  [77, 380],
  [70, 420],
  [66, 442, 'antebrazo'],
  [62, 470],
  [59, 500],
  [58, 520, 'mano'],
]);

const armInner = new Curve([
  [147, 214, 'Q'],
  [139, 240],
  [129, 270],
  [121, 300, 'brazo'],
  [117, 325],
  [114, 342, 'codo'],
  [106, 380],
  [95, 420],
  [89, 442, 'antebrazo'],
  [87, 470],
  [84, 500],
  [78, 520, 'mano'],
]);

const handCap = new Curve([
  [58, 520],
  [60, 533],
  [68, 540],
  [76, 534],
  [78, 520],
]).all();

// --- Tronco y pierna -----------------------------------------------------------------

/** Costado del tronco, cadera y cara externa de la pierna hasta el dedo del pie. */
const sideOuter = new Curve([
  [147, 214, 'Q'],
  [151, 262, 'R'],
  [152, 270, 'torax'],
  [157, 330, 'lumbar'],
  [153, 385, 'abdomen'],
  [147, 405, 'gluteo'],
  [139, 452, 'hip'],
  [138, 488, 'gluteoFin'],
  [138, 525],
  [142, 570],
  [148, 612, 'muslo'],
  [150, 644],
  [151, 676, 'rodilla'],
  [149, 710],
  [148, 742],
  [154, 780],
  [159, 800, 'ankle'],
  [153, 830],
  [143, 858],
  [141, 876, 'toe'],
]);

/** Cara interna de la pierna, desde la entrepierna. */
const legInner = new Curve([
  [197, 472, 'crotch'],
  [195, 488, 'gluteoFin'],
  [191, 525],
  [188, 570],
  [187, 612, 'muslo'],
  [188, 644],
  [188, 676, 'rodilla'],
  [186, 710],
  [184, 742],
  [181, 800, 'ankle'],
  [184, 830],
  [188, 858],
  [190, 877, 'toe'],
]);

const footCap = new Curve([
  [141, 876],
  [146, 884],
  [165, 887],
  [184, 884],
  [190, 877],
]).all();

// --- Regiones ------------------------------------------------------------------------

interface Geometria {
  d: string;
  /** Cajas que enmarcan cada lado de la región; sirven para acercar la cámara. */
  focos: Box[];
}

function build(polys: Pt[][]): Geometria {
  return { d: toPath(polys), focos: polys.map(boundsOf) };
}

const CENTRO_ARRIBA = (y: number): Pt => [200, y];

const brazo = (a: string, b: string): Pt[] => [
  ...armOuter.slice(a, b),
  ...armInner.slice(b, a),
];

const D: Pt = [106, 196];
const Q: Pt = [147, 214];
const P: Pt = [150, 148];

/** Cortes comunes a las dos vistas: extremidades superiores e inferiores. */
function extremidades(
  muslo: Pt[],
): Record<
  | 'brazo'
  | 'codo'
  | 'antebrazo'
  | 'muneca-mano'
  | 'muslo'
  | 'rodilla'
  | 'pierna'
  | 'tobillo-pie',
  Geometria
> {
  return {
    brazo: build(
      bilateral([
        D,
        ...armOuter.slice('D', 'brazo').slice(1),
        ...armInner.slice('brazo', 'Q'),
      ]),
    ),
    codo: build(bilateral(brazo('brazo', 'codo'))),
    antebrazo: build(bilateral(brazo('codo', 'antebrazo'))),
    'muneca-mano': build(
      bilateral([
        ...armOuter.slice('antebrazo', 'mano'),
        ...handCap,
        ...armInner.slice('mano', 'antebrazo'),
      ]),
    ),
    muslo: build(bilateral(muslo)),
    rodilla: build(
      bilateral([
        ...sideOuter.slice('muslo', 'rodilla'),
        ...legInner.slice('rodilla', 'muslo'),
      ]),
    ),
    pierna: build(
      bilateral([
        ...sideOuter.slice('rodilla', 'ankle'),
        ...legInner.slice('ankle', 'rodilla'),
      ]),
    ),
    'tobillo-pie': build(
      bilateral([
        ...sideOuter.slice('ankle', 'toe'),
        ...footCap,
        ...legInner.slice('toe', 'ankle'),
      ]),
    ),
  };
}

const anteriorBase = extremidades([
  ...sideOuter.slice('hip', 'muslo'),
  ...legInner.slice('muslo', 'crotch'),
]);

const posteriorBase = extremidades([
  ...sideOuter.slice('gluteoFin', 'muslo'),
  ...legInner.slice('muslo', 'gluteoFin'),
]);

const trapecio = armOuter.slice('N', 'P');

const anterior: Record<string, Geometria> = {
  'cabeza-cuello': build(
    symmetric([...headPts, ...neck.slice('chin', 'N'), CENTRO_ARRIBA(141)]),
  ),
  hombro: build(bilateral([...armOuter.slice('P', 'D'), Q])),
  ...anteriorBase,
  torax: build(
    symmetric([
      CENTRO_ARRIBA(141),
      ...trapecio,
      ...sideOuter.slice('Q', 'torax'),
      CENTRO_ARRIBA(270),
    ]),
  ),
  abdomen: build(
    symmetric([
      CENTRO_ARRIBA(270),
      ...sideOuter.slice('torax', 'abdomen'),
      CENTRO_ARRIBA(385),
    ]),
  ),
  cadera: build(
    symmetric([
      CENTRO_ARRIBA(385),
      ...sideOuter.slice('abdomen', 'hip'),
      ...legInner.slice('crotch', 'crotch'),
      CENTRO_ARRIBA(472),
    ]),
  ),
};

const posterior: Record<string, Geometria> = {
  'cabeza-cuello': build(symmetric([...headPts, CENTRO_ARRIBA(CHIN_CUT_Y)])),
  cervical: build(
    symmetric([
      CENTRO_ARRIBA(CHIN_CUT_Y),
      ...neck.slice('chin', 'N'),
      ...trapecio,
      [150, 172],
      CENTRO_ARRIBA(172),
    ]),
  ),
  'hombro-escapula': build(
    bilateral([
      ...armOuter.slice('P', 'D'),
      ...sideOuter.slice('Q', 'R'),
      [184, 262],
      [184, 172],
      [150, 172],
    ]),
  ),
  ...posteriorBase,
  dorsal: build(
    symmetric([
      CENTRO_ARRIBA(172),
      [184, 172],
      [184, 262],
      ...sideOuter.slice('R', 'lumbar'),
      CENTRO_ARRIBA(330),
    ]),
  ),
  lumbar: build(
    symmetric([
      CENTRO_ARRIBA(330),
      ...sideOuter.slice('lumbar', 'gluteo'),
      CENTRO_ARRIBA(405),
    ]),
  ),
  gluteo: build(
    symmetric([
      CENTRO_ARRIBA(405),
      ...sideOuter.slice('gluteo', 'gluteoFin'),
      ...legInner.slice('gluteoFin', 'crotch'),
      CENTRO_ARRIBA(472),
    ]),
  ),
};

export const GEOMETRIA: Record<VistaId, Record<string, Geometria>> = {
  anterior,
  posterior,
};

/** Orden de las regiones de arriba abajo: es también el orden de tabulación. */
export const ORDEN_REGIONES: Record<VistaId, string[]> = {
  anterior: [
    'cabeza-cuello',
    'hombro',
    'torax',
    'brazo',
    'abdomen',
    'codo',
    'cadera',
    'antebrazo',
    'muslo',
    'muneca-mano',
    'rodilla',
    'pierna',
    'tobillo-pie',
  ],
  posterior: [
    'cabeza-cuello',
    'cervical',
    'hombro-escapula',
    'dorsal',
    'brazo',
    'lumbar',
    'codo',
    'gluteo',
    'antebrazo',
    'muslo',
    'muneca-mano',
    'rodilla',
    'pierna',
    'tobillo-pie',
  ],
};

export { P as PUNTO_HOMBRO };
