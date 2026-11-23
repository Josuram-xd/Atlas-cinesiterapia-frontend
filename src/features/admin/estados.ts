import type { EstadoFicha } from '@/lib/api';

export const ETIQUETA_ESTADO: Record<EstadoFicha, string> = {
  BORRADOR: 'Borrador',
  PUBLICADO: 'Publicada',
  ARCHIVADO: 'Archivada',
};
