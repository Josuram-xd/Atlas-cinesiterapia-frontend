import {
  arco,
  bilateral,
  boundsOf,
  Curve,
  symmetric,
  toPath,
  type Box,
  type Pt,
} from './curves';

/**
 * Figura anatómica dibujada por nosotros (sin licencias externas), con canon de ~8 cabezas:
 * coronilla en y=22, mentón 126, pezones ~230, ombligo ~345, entrepierna ~452, rodilla ~650,
 * planta 889. Lienzo de 400 x 900. Todo se define para el lado izquierdo del dibujo (x < 200)
 * y se refleja. Las regiones se recortan de las mismas curvas y de cortes curvos compartidos
 * (`arco`), así que encajan sin huecos y sin esquinas de caja.
 */
export const BODY_VIEWBOX: Box = { x: 0, y: 0, w: 400, h: 900 };

export type VistaId = 'anterior' | 'posterior';

// --- Cabeza y cuello ------------------------------------------------------------------

/** Mitad izquierda de la cabeza: cráneo ovalado, pómulo y ángulo de la mandíbula. */
const head = new Curve([
  [200, 24, 'crown'],
  [186, 27],
  [175, 37],
  [170, 54],
  [170, 73],
  [172, 91],
  [178, 108],
  [184, 116, 'jaw'],
]);

const neck = new Curve([
  [184, 116, 'jaw'],
  [183, 126],
  [183, 136],
  [178, 146, 'N'],
]);

// --- Brazo (lado izquierdo del dibujo) -----------------------------------------------

/** Contorno exterior: trapecio, deltoides y brazo hasta la muñeca. */
const armOuter = new Curve([
  [178, 146, 'N'],
  [164, 152],
  [148, 158, 'P'],
  [129, 163],
  [115, 174],
  [108, 191],
  [105, 211],
  [103, 230, 'D'],
  [98, 252],
  [95, 276],
  [94, 298, 'brazo'],
  [92, 316],
  [90, 334, 'codo'],
  [85, 356],
  [81, 384],
  [75, 412],
  [72, 432, 'antebrazo'],
  [71, 446, 'mano'],
]);

/** Contorno interior: axila, bíceps, flexores del antebrazo. */
const armInner = new Curve([
  [150, 226, 'Q'],
  [140, 250],
  [133, 274],
  [125, 298, 'brazo'],
  [121, 316],
  [119, 334, 'codo'],
  [121, 354],
  [113, 384],
  [103, 412],
  [94, 432, 'antebrazo'],
  [92, 446, 'mano'],
]);

/** Mano en posición anatómica, afinada hacia la punta de los dedos. */
const handCap = new Curve([
  [71, 446],
  [68, 462],
  [67, 482],
  [69, 502],
  [75, 516],
  [82, 520],
  [88, 512],
  [91, 494],
  [93, 472],
  [92, 446],
]).all();

// --- Tronco y pierna -----------------------------------------------------------------

/** Costado del tronco, cadera y cara externa de la pierna hasta el pie. */
const sideOuter = new Curve([
  [150, 226, 'Q'],
  [151, 244],
  [152, 262, 'R'],
  [152, 274, 'torax'],
  [155, 300],
  [157, 326, 'lumbar'],
  [156, 350],
  [152, 372],
  [149, 386, 'abdomen'],
  [146, 398, 'gluteo'],
  [141, 420],
  [138, 436, 'hip'],
  [135, 462],
  [136, 488, 'gluteoFin'],
  [135, 520],
  [137, 556],
  [142, 590],
  [150, 614, 'muslo'],
  [152, 636],
  [152, 660],
  [151, 680, 'rodilla'],
  [146, 702],
  [143, 726],
  [146, 756],
  [155, 790],
  [158, 818],
  [158, 836, 'ankle'],
  [155, 852],
  [149, 866],
  [146, 878, 'toe'],
]);

/** Cara interna de la pierna, desde la entrepierna: aductores, vasto medial, gemelo. */
const legInner = new Curve([
  [198, 452, 'crotch'],
  [196, 488, 'gluteoFin'],
  [195, 520],
  [192, 556],
  [187, 590],
  [184, 614, 'muslo'],
  [186, 634],
  [185, 658],
  [182, 680, 'rodilla'],
  [187, 700],
  [191, 724],
  [188, 752],
  [179, 790],
  [177, 818],
  [178, 836, 'ankle'],
  [182, 852],
  [187, 866],
  [190, 880, 'toe'],
]);

const footCap = new Curve([
  [146, 878],
  [149, 886],
  [166, 890],
  [184, 888],
  [190, 880],
]).all();

// --- Cortes curvos compartidos -------------------------------------------------------

const rev = (pts: Pt[]): Pt[] => [...pts].reverse();
const C = (y: number): Pt => [200, y];

/** Corte de extremidad entre el borde exterior y el interior en la misma etiqueta. */
const corteBrazo = (l: string, c: Pt) => arco(armOuter.at(l), armInner.at(l), c);
const cortePierna = (l: string, c: Pt) => arco(sideOuter.at(l), legInner.at(l), c);

const CORTE = {
  // Borde inferior del deltoides y surco deltopectoral.
  deltoides: arco(armOuter.at('D'), armInner.at('Q'), [125, 246]),
  surco: arco(armInner.at('Q'), armOuter.at('P'), [160, 194]),
  brazo: corteBrazo('brazo', [109, 292]),
  codo: corteBrazo('codo', [105, 342]),
  muneca: corteBrazo('antebrazo', [83, 437]),
  muslo: cortePierna('muslo', [167, 600]),
  rodilla: cortePierna('rodilla', [166, 692]),
  tobillo: cortePierna('ankle', [168, 830]),
  // Anterior: base del cuello, arco costal, línea inguinal y pliegue de la ingle.
  cuello: arco(neck.at('N'), C(152), [190, 152]),
  costal: arco(sideOuter.at('torax'), C(246), [180, 272]),
  inguinal: arco(sideOuter.at('abdomen'), C(420), [174, 412]),
  ingle: arco(sideOuter.at('hip'), legInner.at('crotch'), [166, 460]),
  // Posterior: nuca, trapecio, escápula, dorsal, cresta ilíaca y pliegue glúteo.
  nuca: arco(neck.at('jaw'), C(118), [192, 120]),
  trapecio: arco(armOuter.at('P'), C(190), [172, 184]),
  escapula: arco(sideOuter.at('R'), C(214), [188, 256]),
  dorsal: arco(sideOuter.at('lumbar'), C(338), [182, 340]),
  cresta: arco(sideOuter.at('gluteo'), C(394), [172, 384]),
  pliegue: arco(sideOuter.at('gluteoFin'), legInner.at('gluteoFin'), [167, 504]),
};

// --- Regiones ------------------------------------------------------------------------

interface Geometria {
  d: string;
  /** Cajas que enmarcan cada lado de la región; sirven para acercar la cámara. */
  focos: Box[];
}

function build(polys: Pt[][]): Geometria {
  return { d: toPath(polys), focos: polys.map(boundsOf) };
}

/** Tramo de extremidad entre dos cortes (cada corte va de fuera hacia dentro). */
function tramo(
  outer: Curve,
  inner: Curve,
  a: string,
  b: string,
  corteA: Pt[],
  corteB: Pt[],
): Pt[] {
  return [...outer.slice(a, b), ...corteB, ...inner.slice(b, a), ...rev(corteA)];
}

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
        ...armOuter.slice('D', 'brazo'),
        ...CORTE.brazo,
        ...armInner.slice('brazo', 'Q'),
        ...rev(CORTE.deltoides),
      ]),
    ),
    codo: build(
      bilateral(tramo(armOuter, armInner, 'brazo', 'codo', CORTE.brazo, CORTE.codo)),
    ),
    antebrazo: build(
      bilateral(tramo(armOuter, armInner, 'codo', 'antebrazo', CORTE.codo, CORTE.muneca)),
    ),
    'muneca-mano': build(
      bilateral([
        ...armOuter.slice('antebrazo', 'mano'),
        ...handCap,
        ...armInner.slice('mano', 'antebrazo'),
        ...rev(CORTE.muneca),
      ]),
    ),
    muslo: build(bilateral(muslo)),
    rodilla: build(
      bilateral(
        tramo(sideOuter, legInner, 'muslo', 'rodilla', CORTE.muslo, CORTE.rodilla),
      ),
    ),
    pierna: build(
      bilateral(
        tramo(sideOuter, legInner, 'rodilla', 'ankle', CORTE.rodilla, CORTE.tobillo),
      ),
    ),
    'tobillo-pie': build(
      bilateral([
        ...sideOuter.slice('ankle', 'toe'),
        ...footCap,
        ...legInner.slice('toe', 'ankle'),
        ...rev(CORTE.tobillo),
      ]),
    ),
  };
}

const anteriorBase = extremidades([
  ...sideOuter.slice('hip', 'muslo'),
  ...CORTE.muslo,
  ...legInner.slice('muslo', 'crotch'),
  ...rev(CORTE.ingle),
]);

const posteriorBase = extremidades([
  ...sideOuter.slice('gluteoFin', 'muslo'),
  ...CORTE.muslo,
  ...legInner.slice('muslo', 'gluteoFin'),
  ...rev(CORTE.pliegue),
]);

const hombroBase = [...armOuter.slice('P', 'D'), ...CORTE.deltoides];

const anterior: Record<string, Geometria> = {
  'cabeza-cuello': build(
    symmetric([
      ...head.slice('crown', 'jaw'),
      ...neck.slice('jaw', 'N'),
      ...CORTE.cuello,
    ]),
  ),
  hombro: build(bilateral([...hombroBase, ...CORTE.surco])),
  ...anteriorBase,
  torax: build(
    symmetric([
      ...rev(CORTE.cuello),
      ...armOuter.slice('N', 'P'),
      ...rev(CORTE.surco),
      ...sideOuter.slice('Q', 'torax'),
      ...CORTE.costal,
    ]),
  ),
  abdomen: build(
    symmetric([
      ...rev(CORTE.costal),
      ...sideOuter.slice('torax', 'abdomen'),
      ...CORTE.inguinal,
    ]),
  ),
  cadera: build(
    symmetric([
      ...rev(CORTE.inguinal),
      ...sideOuter.slice('abdomen', 'hip'),
      ...CORTE.ingle,
      C(456),
    ]),
  ),
};

const posterior: Record<string, Geometria> = {
  'cabeza-cuello': build(symmetric([...head.slice('crown', 'jaw'), ...CORTE.nuca])),
  cervical: build(
    symmetric([
      ...rev(CORTE.nuca),
      ...neck.slice('jaw', 'N'),
      ...armOuter.slice('N', 'P'),
      ...CORTE.trapecio,
    ]),
  ),
  'hombro-escapula': build(
    bilateral([
      ...hombroBase,
      ...sideOuter.slice('Q', 'R'),
      ...CORTE.escapula,
      ...rev(CORTE.trapecio),
    ]),
  ),
  ...posteriorBase,
  dorsal: build(
    symmetric([
      ...rev(CORTE.escapula),
      ...sideOuter.slice('R', 'lumbar'),
      ...CORTE.dorsal,
    ]),
  ),
  lumbar: build(
    symmetric([
      ...rev(CORTE.dorsal),
      ...sideOuter.slice('lumbar', 'gluteo'),
      ...CORTE.cresta,
    ]),
  ),
  gluteo: build(
    symmetric([
      ...rev(CORTE.cresta),
      ...sideOuter.slice('gluteo', 'gluteoFin'),
      ...CORTE.pliegue,
      ...legInner.slice('gluteoFin', 'crotch'),
      C(456),
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
