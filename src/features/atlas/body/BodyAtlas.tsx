import type { Region } from '@/lib/api';
import { BodyFigure } from './BodyFigure';
import { BODY_VIEWBOX, type VistaId } from './geometry';

interface BodyAtlasProps {
  vista: VistaId;
  regiones: Region[];
  seleccionada?: string | null;
  onSelect: (region: Region) => void;
  onHover?: (region: Region | null) => void;
  className?: string;
}

const NOMBRE_VISTA: Record<VistaId, string> = {
  anterior: 'vista anterior',
  posterior: 'vista posterior',
};

/** El cuerpo como menú: cada región es un control que se elige con ratón, toque o teclado. */
export function BodyAtlas({
  vista,
  regiones,
  seleccionada,
  onSelect,
  onHover,
  className,
}: BodyAtlasProps) {
  const { x, y, w, h } = BODY_VIEWBOX;
  return (
    <svg
      viewBox={`${x} ${y} ${w} ${h}`}
      role="group"
      aria-label={`Cuerpo humano, ${NOMBRE_VISTA[vista]}. Elige una región.`}
      className={className}
    >
      <BodyFigure
        vista={vista}
        regiones={regiones}
        seleccionada={seleccionada}
        onSelect={(region) => onSelect(region)}
        onHover={onHover}
      />
    </svg>
  );
}
