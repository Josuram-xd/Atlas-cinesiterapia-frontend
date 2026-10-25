import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Region } from '@/lib/api';
import { prefersReducedMotion } from '@/lib/motion';
import { BodyFigure } from './BodyFigure';
import { BODY_VIEWBOX, type VistaId } from './geometry';

interface BodyAtlasProps {
  vista: VistaId;
  /** Regiones de ambas vistas; se usan las de la vista que se muestra. */
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

const VISTA_ORIGEN = `${BODY_VIEWBOX.w / 2} ${BODY_VIEWBOX.h / 2}`;

/**
 * El cuerpo como menú: cada región es un control que se elige con ratón, toque o teclado.
 * Al cambiar de vista el cuerpo "gira": se estrecha hasta una línea y se abre por el otro lado.
 */
export function BodyAtlas({
  vista,
  regiones,
  seleccionada,
  onSelect,
  onHover,
  className,
}: BodyAtlasProps) {
  const [mostrada, setMostrada] = useState<VistaId>(vista);
  const grupo = useRef<SVGGElement>(null);
  const entrando = useRef(false);

  // Salida: la vista actual se cierra y, al terminar, se monta la nueva.
  useEffect(() => {
    if (vista === mostrada) return;
    const g = grupo.current;
    if (!g || prefersReducedMotion()) {
      setMostrada(vista);
      return;
    }
    entrando.current = true;
    const tween = gsap.to(g, {
      scaleX: 0,
      svgOrigin: VISTA_ORIGEN,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => setMostrada(vista),
    });
    return () => {
      tween.kill();
    };
  }, [vista, mostrada]);

  // Entrada: la vista nueva se abre desde la línea central.
  useEffect(() => {
    const g = grupo.current;
    if (!entrando.current || !g) return;
    entrando.current = false;
    const tween = gsap.fromTo(
      g,
      { scaleX: 0 },
      {
        scaleX: 1,
        svgOrigin: VISTA_ORIGEN,
        duration: 0.3,
        ease: 'power2.out',
        clearProps: 'transform',
      },
    );
    return () => {
      tween.kill();
      gsap.set(g, { clearProps: 'transform' });
    };
  }, [mostrada]);

  const { x, y, w, h } = BODY_VIEWBOX;
  return (
    <svg
      viewBox={`${x} ${y} ${w} ${h}`}
      role="group"
      aria-label={`Cuerpo humano, ${NOMBRE_VISTA[mostrada]}. Elige una región.`}
      className={className}
    >
      <g ref={grupo}>
        <BodyFigure
          vista={mostrada}
          regiones={regiones}
          seleccionada={seleccionada}
          onSelect={(region) => onSelect(region)}
          onHover={onHover}
        />
      </g>
    </svg>
  );
}
