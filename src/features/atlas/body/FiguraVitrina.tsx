import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import { BodyFondo, BodyRelieve } from './BodyDetalle';
import { BODY_VIEWBOX, GEOMETRIA, ORDEN_REGIONES } from './geometry';

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

/**
 * El cuerpo como vitrina (pantallas de acceso): solo decorativo, no se puede elegir nada.
 * Una región se ilumina cada pocos segundos para mostrar la idea del atlas. Sin movimiento
 * si la persona lo pidió: queda encendida la rodilla.
 */
export function FiguraVitrina({ className = '' }: { className?: string }) {
  const [paso, setPaso] = useState(1);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(
      () => setPaso((p) => (p + 1) % RECORRIDO.length),
      PASO_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  const encendida = RECORRIDO[paso];
  return (
    <svg
      viewBox={`0 0 ${BODY_VIEWBOX.w} ${BODY_VIEWBOX.h}`}
      aria-hidden
      focusable="false"
      className={className}
    >
      <BodyFondo vista="anterior" />
      {ORDEN_REGIONES.anterior.map((slug) => (
        <path
          key={slug}
          d={GEOMETRIA.anterior[slug].d}
          className="region region-vitrina"
          data-encendida={slug === encendida || undefined}
        />
      ))}
      <BodyRelieve vista="anterior" />
    </svg>
  );
}
