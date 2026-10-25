import { GEOMETRIA, ORDEN_REGIONES, type VistaId } from './geometry';

/** Dibujo estático de una vista: un `<path>` por región, con id `<vista>-<region>`. */
export function BodyFigure({ vista }: { vista: VistaId }) {
  return (
    <g id={`vista-${vista}`}>
      {ORDEN_REGIONES[vista].map((slug) => (
        <path
          key={slug}
          id={`${vista}-${slug}`}
          d={GEOMETRIA[vista][slug].d}
          className="fill-fondo-2 stroke-tinta"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
}
