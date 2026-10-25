import type { KeyboardEvent, PointerEvent } from 'react';
import type { Region } from '@/lib/api';
import { GEOMETRIA, ORDEN_REGIONES, type VistaId } from './geometry';

export type EventoSeleccion =
  PointerEvent<SVGPathElement> | KeyboardEvent<SVGPathElement>;

interface BodyFigureProps {
  vista: VistaId;
  /** Catálogo de regiones; el `svgId` de cada una es el id de su `<path>`. */
  regiones: Region[];
  /** svgId de la región elegida. */
  seleccionada?: string | null;
  onSelect?: (region: Region, evento: EventoSeleccion) => void;
  onHover?: (region: Region | null) => void;
}

/**
 * Una vista del cuerpo: un `<path>` por región, con id `<vista>-<region>`.
 * Cada región es un botón: se llega con Tab y se activa con Enter o Espacio.
 * Si no hay `onSelect` el dibujo es solo decorativo.
 */
export function BodyFigure({
  vista,
  regiones,
  seleccionada,
  onSelect,
  onHover,
}: BodyFigureProps) {
  const porId = new Map(regiones.map((r) => [r.svgId, r]));
  return (
    <g id={`vista-${vista}`}>
      {ORDEN_REGIONES[vista].map((slug) => {
        const svgId = `${vista}-${slug}`;
        const region = porId.get(svgId);
        const props =
          onSelect && region
            ? {
                role: 'button',
                tabIndex: 0,
                'aria-label': region.nombre,
                'aria-pressed': seleccionada === svgId,
                onClick: (e: PointerEvent<SVGPathElement>) => onSelect(region, e),
                onKeyDown: (e: KeyboardEvent<SVGPathElement>) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(region, e);
                  }
                },
                onPointerEnter: () => onHover?.(region),
                onPointerLeave: () => onHover?.(null),
                onFocus: () => onHover?.(region),
                onBlur: () => onHover?.(null),
              }
            : { 'aria-hidden': true };
        return (
          <path
            key={svgId}
            id={svgId}
            d={GEOMETRIA[vista][slug].d}
            className="region"
            {...props}
          />
        );
      })}
    </g>
  );
}
