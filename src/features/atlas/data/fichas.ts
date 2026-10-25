import type { Categoria, Ejercicio, EjercicioResumen, Media, Region } from '@/lib/api';
import type { EjercicioMock } from './ejercicios';

function imagen(id: number, rol: Media['rol'], archivo: string, orden: number): Media {
  return {
    id,
    tipo: 'IMAGEN',
    rol,
    contentType: 'image/svg+xml',
    tamanoBytes: 900,
    url: `/mock/${archivo}.svg`,
    orden,
  };
}

/** Resumen de listado con la forma del backend. */
export function resumenMock(
  e: EjercicioMock,
  region: Region,
  categoria: Categoria,
): EjercicioResumen {
  return {
    id: e.id,
    nombre: e.nombre,
    region: { id: region.id, nombre: region.nombre, svgId: region.svgId },
    categoria: { id: categoria.id, nombre: categoria.nombre },
  };
}

/** Ficha completa de ejemplo derivada del ejercicio: texto genérico, pero completo. */
export function fichaMock(
  e: EjercicioMock,
  region: Region,
  categoria: Categoria,
): Ejercicio {
  const zona = region.nombre.toLowerCase();
  return {
    id: e.id,
    nombre: e.nombre,
    region: {
      id: region.id,
      nombre: region.nombre,
      svgId: region.svgId,
      vista: region.vista,
    },
    categoria: { id: categoria.id, nombre: categoria.nombre },
    objetivoTerapeutico: e.objetivo,
    estructurasIntervenidas: `Musculatura y articulaciones de la región de ${zona}, con sus cápsulas y partes blandas periarticulares.`,
    indicaciones: `Déficit de movilidad o fuerza en ${zona} tras inmovilización, cirugía o lesión, con dolor controlado.\nFase subaguda o crónica según la indicación del equipo tratante.`,
    precaucionesContraindicaciones: `Suspender ante dolor agudo, inflamación creciente o signos de inestabilidad.\nNo realizar en fase aguda sin indicación médica.`,
    posicionPaciente: `Cómoda y estable, con ${zona} apoyada y sin tensión en el resto del cuerpo.`,
    posicionFisioterapeuta: `De pie junto al paciente, con una toma estable sobre ${zona} y la columna en posición neutra.`,
    ejecucion: `Llevar el movimiento de forma lenta y controlada hasta el rango indicado.\nMantener un instante en el final del recorrido.\nRegresar a la posición inicial sin compensaciones.`,
    comandosVerbales: '«Relájese», «ahora muévase despacio», «mantenga» y «vuelva».',
    dosificacion: {
      series: '3',
      repeticiones: '10',
      intensidad: 'Leve a moderada',
      tiempo: '2 s por fase',
      descanso: '60 s entre series',
      frecuencia: '1 vez al día',
    },
    progresion:
      e.id % 2 === 0
        ? null
        : 'Aumentar el rango o añadir resistencia cuando no haya dolor.',
    erroresComunes:
      e.id % 3 === 0
        ? null
        : 'Compensar con el tronco, perder el control en el regreso o acelerar el ritmo.',
    estudiantesCreadores: ['Laura Gómez', 'Andrés Pérez'],
    cohorte: '2025-1',
    profesoraRevisora: 'Dra. María Rojas',
    video: null,
    imagenes: [
      imagen(e.id * 10 + 1, 'POSICION_INICIAL', 'posicion-inicial', 1),
      imagen(e.id * 10 + 2, 'POSICION_FINAL', 'posicion-final', 2),
      imagen(e.id * 10 + 3, 'TOMA_TERAPEUTA', 'toma', 3),
    ],
    actualizadoEn: '2026-10-20T15:30:00Z',
  };
}
