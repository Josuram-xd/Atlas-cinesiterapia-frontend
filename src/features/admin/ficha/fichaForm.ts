import type { Dosificacion, EjercicioAdmin, EjercicioRequest } from '@/lib/api';

export const MAX_NOMBRE = 200;
export const MAX_TEXTO = 5000;
export const MAX_DOSIS = 100;
export const MAX_AUTORES = 20;
export const MAX_AUTOR = 150;
export const MAX_REVISORA = 150;
const COHORTE = /^\d{4}-\d{1,2}$/;

export type DosisClave = keyof Dosificacion;
export const DOSIS_CLAVES: DosisClave[] = [
  'series',
  'repeticiones',
  'intensidad',
  'tiempo',
  'descanso',
  'frecuencia',
];

/** Campos de texto largo de la ficha (todos opcionales al guardar un borrador). */
export type CampoTexto =
  | 'objetivoTerapeutico'
  | 'estructurasIntervenidas'
  | 'indicaciones'
  | 'precaucionesContraindicaciones'
  | 'posicionPaciente'
  | 'posicionFisioterapeuta'
  | 'ejecucion'
  | 'comandosVerbales'
  | 'progresion'
  | 'erroresComunes';

/** Estado del formulario: todo son cadenas, nunca `null`, para que los campos sean controlados. */
export interface FormFicha extends Record<CampoTexto, string> {
  nombre: string;
  regionId: number | null;
  categoriaId: number | null;
  dosificacion: Record<DosisClave, string>;
  estudiantesCreadores: string[];
  cohorte: string;
  profesoraRevisora: string;
}

export function formVacio(): FormFicha {
  return {
    nombre: '',
    regionId: null,
    categoriaId: null,
    objetivoTerapeutico: '',
    estructurasIntervenidas: '',
    indicaciones: '',
    precaucionesContraindicaciones: '',
    posicionPaciente: '',
    posicionFisioterapeuta: '',
    ejecucion: '',
    comandosVerbales: '',
    dosificacion: {
      series: '',
      repeticiones: '',
      intensidad: '',
      tiempo: '',
      descanso: '',
      frecuencia: '',
    },
    progresion: '',
    erroresComunes: '',
    estudiantesCreadores: [''],
    cohorte: '',
    profesoraRevisora: '',
  };
}

export function fichaAForm(e: EjercicioAdmin): FormFicha {
  const vacio = formVacio();
  const texto = (v: string | null | undefined) => v ?? '';
  return {
    nombre: e.nombre,
    regionId: e.region.id,
    categoriaId: e.categoria.id,
    objetivoTerapeutico: texto(e.objetivoTerapeutico),
    estructurasIntervenidas: texto(e.estructurasIntervenidas),
    indicaciones: texto(e.indicaciones),
    precaucionesContraindicaciones: texto(e.precaucionesContraindicaciones),
    posicionPaciente: texto(e.posicionPaciente),
    posicionFisioterapeuta: texto(e.posicionFisioterapeuta),
    ejecucion: texto(e.ejecucion),
    comandosVerbales: texto(e.comandosVerbales),
    dosificacion: Object.fromEntries(
      DOSIS_CLAVES.map((k) => [k, texto(e.dosificacion?.[k])]),
    ) as Record<DosisClave, string>,
    progresion: texto(e.progresion),
    erroresComunes: texto(e.erroresComunes),
    estudiantesCreadores:
      e.estudiantesCreadores && e.estudiantesCreadores.length > 0
        ? [...e.estudiantesCreadores]
        : vacio.estudiantesCreadores,
    cohorte: texto(e.cohorte),
    profesoraRevisora: texto(e.profesoraRevisora),
  };
}

const orNull = (v: string) => (v.trim() === '' ? null : v.trim());

/** Cuerpo para POST/PUT: textos recortados y vacíos como `null` (el backend hace lo mismo). */
export function formARequest(f: FormFicha): EjercicioRequest {
  return {
    nombre: f.nombre.trim(),
    regionId: f.regionId as number,
    categoriaId: f.categoriaId as number,
    objetivoTerapeutico: orNull(f.objetivoTerapeutico),
    estructurasIntervenidas: orNull(f.estructurasIntervenidas),
    indicaciones: orNull(f.indicaciones),
    precaucionesContraindicaciones: orNull(f.precaucionesContraindicaciones),
    posicionPaciente: orNull(f.posicionPaciente),
    posicionFisioterapeuta: orNull(f.posicionFisioterapeuta),
    ejecucion: orNull(f.ejecucion),
    comandosVerbales: orNull(f.comandosVerbales),
    dosificacion: Object.fromEntries(
      DOSIS_CLAVES.map((k) => [k, orNull(f.dosificacion[k])]),
    ),
    progresion: orNull(f.progresion),
    erroresComunes: orNull(f.erroresComunes),
    estudiantesCreadores: f.estudiantesCreadores.map((a) => a.trim()).filter(Boolean),
    cohorte: orNull(f.cohorte),
    profesoraRevisora: orNull(f.profesoraRevisora),
  };
}

/** Compara lo que se enviaría al guardar: los espacios sobrantes no cuentan como cambio. */
export function hayCambios(base: FormFicha, actual: FormFicha): boolean {
  return JSON.stringify(formARequest(base)) !== JSON.stringify(formARequest(actual));
}

/** Validación mínima antes de guardar un borrador; los mismos límites que el backend. */
export function validarBorrador(f: FormFicha): Record<string, string> {
  const errores: Record<string, string> = {};
  if (!f.nombre.trim()) errores.nombre = 'Escribe el nombre del ejercicio.';
  else if (f.nombre.trim().length > MAX_NOMBRE) {
    errores.nombre = `El nombre admite hasta ${MAX_NOMBRE} caracteres.`;
  }
  if (f.regionId === null) errores.regionId = 'Elige la región.';
  if (f.categoriaId === null) errores.categoriaId = 'Elige la categoría.';

  const largos: CampoTexto[] = [
    'objetivoTerapeutico',
    'estructurasIntervenidas',
    'indicaciones',
    'precaucionesContraindicaciones',
    'posicionPaciente',
    'posicionFisioterapeuta',
    'ejecucion',
    'comandosVerbales',
    'progresion',
    'erroresComunes',
  ];
  for (const campo of largos) {
    if (f[campo].trim().length > MAX_TEXTO) {
      errores[campo] = `Admite hasta ${MAX_TEXTO} caracteres.`;
    }
  }
  for (const k of DOSIS_CLAVES) {
    if (f.dosificacion[k].trim().length > MAX_DOSIS) {
      errores[`dosificacion.${k}`] = `Admite hasta ${MAX_DOSIS} caracteres.`;
    }
  }
  const autores = f.estudiantesCreadores.map((a) => a.trim()).filter(Boolean);
  if (autores.length > MAX_AUTORES) {
    errores.estudiantesCreadores = `Máximo ${MAX_AUTORES} estudiantes.`;
  } else if (autores.some((a) => a.length > MAX_AUTOR)) {
    errores.estudiantesCreadores = `Cada nombre admite hasta ${MAX_AUTOR} caracteres.`;
  }
  if (f.cohorte.trim() && !COHORTE.test(f.cohorte.trim())) {
    errores.cohorte = 'Usa el formato año-periodo, por ejemplo 2025-1.';
  }
  if (f.profesoraRevisora.trim().length > MAX_REVISORA) {
    errores.profesoraRevisora = `Admite hasta ${MAX_REVISORA} caracteres.`;
  }
  return errores;
}

// --- Pasos del formulario ---------------------------------------------------------

export type PasoId =
  'general' | 'protocolo' | 'ejecucion' | 'dosificacion' | 'multimedia' | 'metadatos';

export const PASOS: Array<{ id: PasoId; titulo: string }> = [
  { id: 'general', titulo: 'Información general' },
  { id: 'protocolo', titulo: 'Protocolo clínico' },
  { id: 'ejecucion', titulo: 'Ejecución' },
  { id: 'dosificacion', titulo: 'Dosificación y progresión' },
  { id: 'multimedia', titulo: 'Multimedia' },
  { id: 'metadatos', titulo: 'Metadatos académicos' },
];

const ETIQUETAS: Record<string, string> = {
  nombre: 'Nombre',
  regionId: 'Región',
  categoriaId: 'Categoría',
  objetivoTerapeutico: 'Objetivo terapéutico',
  estructurasIntervenidas: 'Estructuras intervenidas',
  indicaciones: 'Indicaciones',
  precaucionesContraindicaciones: 'Precauciones y contraindicaciones',
  posicionPaciente: 'Posición del paciente',
  posicionFisioterapeuta: 'Posición del fisioterapeuta',
  ejecucion: 'Pasos de la ejecución',
  comandosVerbales: 'Comandos verbales',
  'dosificacion.series': 'Series',
  'dosificacion.repeticiones': 'Repeticiones',
  'dosificacion.intensidad': 'Intensidad',
  'dosificacion.tiempo': 'Tiempo',
  'dosificacion.descanso': 'Descanso',
  'dosificacion.frecuencia': 'Frecuencia',
  progresion: 'Progresión',
  erroresComunes: 'Errores comunes',
  media: 'Imagen o video',
  estudiantesCreadores: 'Estudiantes creadores',
  cohorte: 'Cohorte',
  profesoraRevisora: 'Profesora revisora',
};

/** Quita índices de lista (`estudiantesCreadores[0]` pasa a `estudiantesCreadores`). */
const sinIndice = (campo: string) => campo.replace(/\[\d+\]$/, '');

export function etiquetaCampo(campo: string): string {
  return ETIQUETAS[sinIndice(campo)] ?? campo;
}

export function pasoDeCampo(campo: string): PasoId {
  const c = sinIndice(campo);
  if (c.startsWith('dosificacion') || c === 'progresion' || c === 'erroresComunes') {
    return 'dosificacion';
  }
  if (c === 'media') return 'multimedia';
  if (c === 'indicaciones' || c === 'precaucionesContraindicaciones') return 'protocolo';
  if (
    c === 'posicionPaciente' ||
    c === 'posicionFisioterapeuta' ||
    c === 'ejecucion' ||
    c === 'comandosVerbales'
  ) {
    return 'ejecucion';
  }
  if (c === 'estudiantesCreadores' || c === 'cohorte' || c === 'profesoraRevisora') {
    return 'metadatos';
  }
  return 'general';
}
