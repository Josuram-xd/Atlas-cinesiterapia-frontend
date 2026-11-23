import type { MediaTipo } from '@/lib/api';

/** Reglas de `docs/API.md` sección 6; el backend las vuelve a validar en el paso 1. */
export const REGLAS_MEDIA: Record<
  MediaTipo,
  { tipos: string[]; maxBytes: number; maxCantidad: number; etiquetaTipos: string }
> = {
  VIDEO: {
    tipos: ['video/mp4', 'video/webm', 'image/gif'],
    maxBytes: 26_214_400,
    maxCantidad: 1,
    etiquetaTipos: 'MP4, WebM o GIF',
  },
  IMAGEN: {
    tipos: ['image/jpeg', 'image/png', 'image/webp'],
    maxBytes: 5_242_880,
    maxCantidad: 8,
    etiquetaTipos: 'JPG, PNG o WebP',
  },
};

export function formatearTamano(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1).replace('.0', '')} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Valida el archivo antes de pedir la URL de subida: tipo MIME permitido, no vacío, dentro
 * del tamaño y con espacio libre en la ficha. Devuelve el motivo del rechazo o `null`.
 * Se mira el tipo declarado por el navegador; la firma real la comprueba el almacenamiento.
 */
export function validarArchivo(
  archivo: { type: string; size: number },
  tipo: MediaTipo,
  yaSubidos: number,
): string | null {
  const reglas = REGLAS_MEDIA[tipo];
  if (yaSubidos >= reglas.maxCantidad) {
    return tipo === 'VIDEO'
      ? 'La ficha ya tiene un video. Elimínalo para subir otro.'
      : `La ficha ya tiene ${reglas.maxCantidad} imágenes, el máximo permitido.`;
  }
  if (!reglas.tipos.includes(archivo.type)) {
    return `Formato no permitido. Usa ${reglas.etiquetaTipos}.`;
  }
  if (archivo.size <= 0) return 'El archivo está vacío.';
  if (archivo.size > reglas.maxBytes) {
    return `El archivo pesa ${formatearTamano(archivo.size)} y el máximo es ${formatearTamano(reglas.maxBytes)}.`;
  }
  return null;
}
