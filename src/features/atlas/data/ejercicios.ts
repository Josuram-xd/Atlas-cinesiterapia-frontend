/** Ejercicio de ejemplo: lo mínimo del que el mock deriva el resumen y la ficha completa. */
export interface EjercicioMock {
  id: number;
  nombre: string;
  /** Objetivo terapéutico (una frase). */
  objetivo: string;
}

/**
 * Ejercicios de ejemplo para el modo `mock`. Se indexan por `svgId` de la
 * región y por id de categoría (1 a 9, en el orden de CATEGORIAS_MOCK). Lo que no está aquí
 * devuelve una lista vacía, como haría el backend con una combinación sin fichas publicadas.
 */
let siguienteId = 1;
const ej = (nombre: string, objetivo: string): EjercicioMock => ({
  id: siguienteId++,
  nombre,
  objetivo,
});

export const EJERCICIOS_MOCK: Record<string, Record<number, EjercicioMock[]>> = {
  'anterior-rodilla': {
    1: [
      ej(
        'Flexoextensión pasiva de rodilla',
        'Mantener el rango articular mientras la persona no puede mover la pierna.',
      ),
      ej(
        'Deslizamiento rotuliano pasivo',
        'Recuperar la movilidad de la rótula tras inmovilización.',
      ),
    ],
    3: [
      ej(
        'Deslizamiento de talón en camilla',
        'Ganar flexión de rodilla sin carga y con control del dolor.',
      ),
      ej(
        'Flexoextensión activa en sedestación',
        'Reeducar el movimiento completo de la rodilla.',
      ),
    ],
    4: [
      ej(
        'Extensión de rodilla con banda elástica',
        'Fortalecer el cuádriceps con resistencia progresiva.',
      ),
      ej(
        'Sentadilla parcial con apoyo',
        'Fortalecer la cadena extensora en carga controlada.',
      ),
      ej(
        'Flexión de rodilla con tobillera',
        'Fortalecer los isquiotibiales en decúbito prono.',
      ),
    ],
    5: [
      ej(
        'Estiramiento de cuádriceps en bipedestación',
        'Recuperar longitud de la musculatura anterior del muslo.',
      ),
    ],
    6: [
      ej(
        'Isométrico de cuádriceps con toalla',
        'Activar el cuádriceps sin mover la articulación.',
      ),
      ej(
        'Isométrico de rodilla contra la pared',
        'Mantener fuerza en ángulos fijos de la rodilla.',
      ),
    ],
    7: [
      ej(
        'Apoyo monopodal en superficie estable',
        'Mejorar el control postural de la rodilla operada.',
      ),
      ej(
        'Equilibrio sobre cojín inestable',
        'Entrenar la respuesta propioceptiva ante perturbaciones.',
      ),
    ],
  },
  'anterior-hombro': {
    1: [
      ej('Péndulo de Codman', 'Movilizar el hombro con la gravedad y sin contracción.'),
    ],
    3: [
      ej(
        'Elevación activa en el plano escapular',
        'Recuperar la elevación del brazo sin compensar con el tronco.',
      ),
      ej('Rotación externa activa con el codo pegado', 'Reeducar el manguito rotador.'),
    ],
    5: [
      ej(
        'Estiramiento posterior del hombro',
        'Ganar aducción horizontal y flexibilidad de la cápsula posterior.',
      ),
    ],
  },
  'posterior-lumbar': {
    5: [ej('Rodillas al pecho', 'Descomprimir y elongar la región lumbar.')],
    6: [ej('Puente isométrico', 'Activar glúteos y extensores lumbares en estático.')],
    8: [
      ej(
        'Cuadrupedia con brazo y pierna opuestos',
        'Estabilizar la columna lumbopélvica.',
      ),
      ej('Plancha sobre antebrazos', 'Controlar la posición neutra de la columna.'),
    ],
  },
};
