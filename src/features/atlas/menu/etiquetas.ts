/**
 * Texto corto de cada categoría para los botones que rodean el cuerpo, donde caben una o
 * dos palabras. El nombre completo se conserva como etiqueta accesible y como título del
 * panel de ejercicios. Una categoría nueva sin entrada aquí usa su nombre completo.
 */
const CORTAS: Record<string, string> = {
  'Movilización pasiva': 'Pasiva',
  'Movilización activo-asistida': 'Asistida',
  'Movilización activa libre': 'Libre',
  'Ejercicio activo resistido': 'Resistido',
  'Estiramiento y elongación': 'Elongación',
  'Fortalecimiento isométrico': 'Isométrico',
  'Propiocepción y equilibrio': 'Equilibrio',
  'Control motor y estabilización': 'Control motor',
  'Facilitación neuromuscular propioceptiva (FNP)': 'FNP',
};

export function etiquetaCorta(nombre: string): string {
  return CORTAS[nombre] ?? nombre;
}
