import type { Media, MediaRol } from '@/lib/api';

const ROLES: Record<MediaRol, string> = {
  POSICION_INICIAL: 'Posición inicial',
  POSICION_FINAL: 'Posición final',
  TOMA_TERAPEUTA: 'Toma del terapeuta',
  OTRO: 'Imagen adicional',
};

/** Descripción corta de una imagen según su rol; sirve de pie y de texto alternativo. */
export function etiquetaImagen(imagen: Media, posicion: number): string {
  if (imagen.rol && imagen.rol !== 'OTRO') return ROLES[imagen.rol];
  return `${ROLES.OTRO} ${posicion}`;
}
