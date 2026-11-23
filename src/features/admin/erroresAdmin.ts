import { ApiError, NetworkError } from '@/lib/api';
import { SubidaRechazadaError } from './api/putConProgreso';
import { ArchivoInvalidoError } from './media/subida';

export interface ErrorAdmin {
  /** Mensaje para mostrar arriba del formulario. */
  mensaje: string;
  /** Texto por campo, con los nombres de campo del backend. */
  campos: Record<string, string>;
  /** Campos obligatorios pendientes (422 FICHA_INCOMPLETA), en el orden del backend. */
  faltantes: string[];
}

const MENSAJES_POR_CODIGO: Record<string, string> = {
  EJERCICIO_NO_ENCONTRADO:
    'La ficha ya no existe. Puede que otra persona la haya eliminado.',
  ESTADO_INVALIDO:
    'La ficha cambió de estado mientras la editabas. Recarga para ver el estado actual.',
  REGION_INVALIDA: 'La región elegida no existe.',
  CATEGORIA_INVALIDA: 'La categoría elegida no existe.',
  MEDIA_TIPO_NO_SOPORTADO: 'Ese formato de archivo no está permitido.',
  MEDIA_DEMASIADO_GRANDE: 'El archivo supera el tamaño máximo permitido.',
  MEDIA_ROL_REQUERIDO: 'Indica qué muestra la imagen.',
  MEDIA_LIMITE_ALCANZADO: 'La ficha ya alcanzó el máximo de archivos de ese tipo.',
  MEDIA_NO_SUBIDA: 'El archivo no llegó al almacenamiento. Inténtalo de nuevo.',
  MEDIA_TAMANO_INVALIDO:
    'El archivo subido no coincide con el declarado. Sube uno nuevo.',
  MEDIA_NO_ENCONTRADA: 'Ese archivo ya no existe en la ficha.',
  MEDIA_REQUERIDA: 'Una ficha publicada o archivada debe conservar al menos un archivo.',
};

/** Traduce cualquier fallo de las operaciones de administración a algo que se pueda mostrar. */
export function describirError(error: unknown): ErrorAdmin {
  const base: ErrorAdmin = { mensaje: '', campos: {}, faltantes: [] };
  if (error instanceof ArchivoInvalidoError) return { ...base, mensaje: error.message };
  if (error instanceof SubidaRechazadaError) {
    return {
      ...base,
      mensaje:
        'El almacenamiento rechazó el archivo. Puede que la URL haya vencido: inténtalo de nuevo.',
    };
  }
  if (error instanceof NetworkError) {
    return {
      ...base,
      mensaje:
        'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
    };
  }
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return {
        ...base,
        mensaje: 'Tu sesión ya no es válida o no tienes permiso para esta acción.',
      };
    }
    if (error.status === 429) {
      return {
        ...base,
        mensaje: 'Demasiadas acciones seguidas. Espera un momento e inténtalo de nuevo.',
      };
    }
    if (error.status >= 500) {
      return {
        ...base,
        mensaje: 'El servidor tuvo un problema. Inténtalo en unos minutos.',
      };
    }
    if (error.code === 'FICHA_INCOMPLETA') {
      return {
        mensaje: 'Faltan datos obligatorios para publicar la ficha.',
        campos: { ...error.fieldErrors },
        faltantes: Object.keys(error.fieldErrors),
      };
    }
    if (error.code === 'VALIDATION_ERROR') {
      return {
        mensaje: 'Revisa los campos marcados.',
        campos: { ...error.fieldErrors },
        faltantes: [],
      };
    }
    const porCodigo = error.code ? MENSAJES_POR_CODIGO[error.code] : undefined;
    if (porCodigo) return { ...base, mensaje: porCodigo };
  }
  return { ...base, mensaje: 'No se pudo completar la acción. Inténtalo de nuevo.' };
}
