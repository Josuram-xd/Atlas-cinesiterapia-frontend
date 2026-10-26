import type { MediaAdmin, MediaRol, MediaTipo } from '@/lib/api';
import type { AdminApi } from '../api/adminApi';
import { validarArchivo } from './validacion';

export interface OpcionesSubida {
  api: AdminApi;
  fichaId: number;
  archivo: File;
  tipo: MediaTipo;
  /** Obligatorio en imágenes. */
  rol?: MediaRol;
  /** Cuántos archivos de este tipo tiene ya la ficha (confirmados). */
  yaSubidos: number;
  onProgreso: (fraccion: number) => void;
  signal?: AbortSignal;
}

/** Fallo de validación local: el archivo ni siquiera se envía. */
export class ArchivoInvalidoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ArchivoInvalidoError';
  }
}

/**
 * Sube un archivo en tres pasos: 1) pide la URL prefirmada, 2) `PUT` con progreso a esa URL,
 * 3) confirma. Valida tipo y tamaño antes del paso 1. El archivo no pasa por el backend.
 */
export async function subirMedia(o: OpcionesSubida): Promise<MediaAdmin> {
  const motivo = validarArchivo(o.archivo, o.tipo, o.yaSubidos);
  if (motivo) throw new ArchivoInvalidoError(motivo);

  const subida = await o.api.solicitarSubida(o.fichaId, {
    tipo: o.tipo,
    rol: o.tipo === 'IMAGEN' ? o.rol : undefined,
    nombreArchivo: o.archivo.name.slice(0, 200),
    contentType: o.archivo.type,
    tamanoBytes: o.archivo.size,
  });
  await o.api.subirArchivo(subida, o.archivo, o.onProgreso, o.signal);
  return o.api.confirmarMedia(o.fichaId, subida.mediaId);
}
