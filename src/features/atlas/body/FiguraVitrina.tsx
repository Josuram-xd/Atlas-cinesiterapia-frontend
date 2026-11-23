import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import { BodyFondo, BodyRelieve } from './BodyDetalle';
import { BODY_VIEWBOX, GEOMETRIA, ORDEN_REGIONES, type VistaId } from './geometry';

/** Regiones que se encienden por turnos: un recorrido de arriba abajo, sin repetir vecinas. */
const RECORRIDO = [
  'hombro',
  'rodilla',
  'torax',
  'tobillo-pie',
  'codo',
  'cadera',
  'muslo',
];
const PASO_MS = 1800;

interface FiguraVitrinaProps {
  className?: string;
  vista?: VistaId;
  /** Región fija encendida (slug sin vista, ej. `rodilla`). Sin ella, el recorrido gira solo. */
  region?: string;
}

/**
 * El cuerpo como vitrina: solo decorativo, no se puede elegir nada. En las pantallas de acceso
 * una región se ilumina cada pocos segundos para mostrar la idea del atlas (sin movimiento si
 * la persona lo pidió: queda la rodilla); en la ficha marca la región del ejercicio.
 */
export function FiguraVitrina({
  className = '',
  vista = 'anterior',
  region,
}: FiguraVitrinaProps) {
  const [paso, setPaso] = useState(1);

  useEffect(() => {
    if (region || prefersReducedMotion()) return;
    const id = window.setInterval(
      () => setPaso((p) => (p + 1) % RECORRIDO.length),
      PASO_MS,
    );
    return () => window.clearInterval(id);
  }, [region]);

  const encendida = region ?? RECORRIDO[paso];
  return (
    <svg
      viewBox={`0 0 ${BODY_VIEWBOX.w} ${BODY_VIEWBOX.h}`}
      aria-hidden
      focusable="false"
      className={className}
    >
      <BodyFondo vista={vista} />
      {ORDEN_REGIONES[vista].map((slug) => (
        <path
          key={slug}
          d={GEOMETRIA[vista][slug].d}
          className="region region-vitrina"
          data-encendida={slug === encendida || undefined}
        />
      ))}
      <BodyRelieve vista={vista} />
    </svg>
  );
}
