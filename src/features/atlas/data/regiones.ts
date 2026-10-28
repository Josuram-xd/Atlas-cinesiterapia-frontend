import type { Categoria, Region } from '@/lib/api';

/**
 * Datos de ejemplo del catálogo mientras no exista la API (GET /regiones y
 * /regiones/{id}/categorias). Reflejan el seed descrito en el plan del backend.
 * El `svgId` es el id del `<path>` en el SVG: `<vista>-<region>`.
 */
const anterior: Array<[string, string]> = [
  ['cabeza-cuello', 'Cabeza y cuello'],
  ['hombro', 'Hombro'],
  ['brazo', 'Brazo'],
  ['codo', 'Codo'],
  ['antebrazo', 'Antebrazo'],
  ['muneca-mano', 'Muñeca y mano'],
  ['torax', 'Tórax'],
  ['abdomen', 'Abdomen'],
  ['cadera', 'Cadera'],
  ['muslo', 'Muslo'],
  ['rodilla', 'Rodilla'],
  ['pierna', 'Pierna'],
  ['tobillo-pie', 'Tobillo y pie'],
];

const posterior: Array<[string, string]> = [
  ['cabeza-cuello', 'Cabeza y cuello'],
  ['cervical', 'Columna cervical'],
  ['hombro-escapula', 'Hombro y escápula'],
  ['brazo', 'Brazo'],
  ['codo', 'Codo'],
  ['antebrazo', 'Antebrazo'],
  ['muneca-mano', 'Muñeca y mano'],
  ['dorsal', 'Columna dorsal'],
  ['lumbar', 'Columna lumbar'],
  ['gluteo', 'Glúteo'],
  ['muslo', 'Muslo'],
  ['rodilla', 'Rodilla'],
  ['pierna', 'Pierna'],
  ['tobillo-pie', 'Tobillo y pie'],
];

export const REGIONES_MOCK: Region[] = [
  ...anterior.map(([slug, nombre], i): Region => ({
    id: i + 1,
    nombre,
    svgId: `anterior-${slug}`,
    vista: 'ANTERIOR',
    orden: i + 1,
  })),
  ...posterior.map(([slug, nombre], i): Region => ({
    id: 100 + i + 1,
    nombre,
    svgId: `posterior-${slug}`,
    vista: 'POSTERIOR',
    orden: i + 1,
  })),
];

export const CATEGORIAS_MOCK: Categoria[] = [
  'Movilización pasiva',
  'Movilización activo-asistida',
  'Movilización activa libre',
  'Ejercicio activo resistido',
  'Estiramiento y elongación',
  'Fortalecimiento isométrico',
  'Propiocepción y equilibrio',
  'Control motor y estabilización',
  'Facilitación neuromuscular propioceptiva (FNP)',
].map((nombre, i) => ({ id: i + 1, nombre, orden: i + 1 }));
