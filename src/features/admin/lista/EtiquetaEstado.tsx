import type { EstadoFicha } from '@/lib/api';
import { ETIQUETA_ESTADO } from '../estados';

const TONO: Record<EstadoFicha, string> = {
  BORRADOR: 'bg-fondo-3 text-tinta',
  PUBLICADO: 'bg-acento text-fondo',
  ARCHIVADO: 'bg-tinta text-fondo',
};

/** Estado de la ficha en texto sobre un campo de color plano (el color nunca es lo único). */
export function EtiquetaEstado({ estado }: { estado: EstadoFicha }) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-base font-semibold ${TONO[estado]}`}
    >
      {ETIQUETA_ESTADO[estado]}
    </span>
  );
}
