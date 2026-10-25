import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import gsap from 'gsap';
import type { Region } from '@/lib/api';
import { prefersReducedMotion } from '@/lib/motion';
import { BodyFigure, type EventoSeleccion } from './BodyFigure';
import { BODY_VIEWBOX, type VistaId } from './geometry';
import { aTexto, encuadreCompleto, encuadreDe, focoDe, type Lado } from './zoom';

interface BodyAtlasProps {
  vista: VistaId;
  /** Regiones de ambas vistas; se usan las de la vista que se muestra. */
  regiones: Region[];
  /** svgId de la región elegida: la cámara se acerca a ella. `null` muestra el cuerpo entero. */
  seleccionada?: string | null;
  onSelect: (region: Region) => void;
  /** Se pide volver al cuerpo completo (clic en el fondo o tecla Escape). */
  onClear?: () => void;
  onHover?: (region: Region | null) => void;
  className?: string;
}

const NOMBRE_VISTA: Record<VistaId, string> = {
  anterior: 'vista anterior',
  posterior: 'vista posterior',
};

const VISTA_ORIGEN = `${BODY_VIEWBOX.w / 2} ${BODY_VIEWBOX.h / 2}`;
const VIEWBOX_REPOSO = aTexto(BODY_VIEWBOX);

/**
 * El cuerpo como menú: cada región es un control que se elige con ratón, toque o teclado.
 * - Al elegir una región la cámara se acerca animando el viewBox.
 * - Al cambiar de vista el cuerpo "gira": se estrecha hasta una línea y se abre por el otro lado.
 * Con `prefers-reduced-motion` los cambios son instantáneos.
 */
export function BodyAtlas({
  vista,
  regiones,
  seleccionada,
  onSelect,
  onClear,
  onHover,
  className,
}: BodyAtlasProps) {
  const [mostrada, setMostrada] = useState<VistaId>(vista);
  const svg = useRef<SVGSVGElement>(null);
  const grupo = useRef<SVGGElement>(null);
  const entrando = useRef(false);
  const lado = useRef<Lado>('izquierdo');
  const camara = useRef({ x: 0, y: 0, w: BODY_VIEWBOX.w, h: BODY_VIEWBOX.h });

  const proporcion = useCallback(() => {
    const el = svg.current;
    return el && el.clientWidth > 0 && el.clientHeight > 0
      ? el.clientWidth / el.clientHeight
      : BODY_VIEWBOX.w / BODY_VIEWBOX.h;
  }, []);

  const aplicar = useCallback(() => {
    const c = camara.current;
    svg.current?.setAttribute('viewBox', aTexto(c));
  }, []);

  // Cámara: se acerca a la región elegida o vuelve al cuerpo completo.
  useEffect(() => {
    const destino = seleccionada ? focoDe(mostrada, seleccionada, lado.current) : null;
    const objetivo = destino
      ? encuadreDe(destino, proporcion())
      : encuadreCompleto(proporcion());
    const volverAReposo = !destino;

    if (prefersReducedMotion()) {
      Object.assign(camara.current, objetivo);
      if (volverAReposo) svg.current?.setAttribute('viewBox', VIEWBOX_REPOSO);
      else aplicar();
      return;
    }
    const tween = gsap.to(camara.current, {
      ...objetivo,
      duration: 0.85,
      ease: 'power3.inOut',
      overwrite: true,
      onUpdate: aplicar,
      onComplete: () => {
        if (volverAReposo) svg.current?.setAttribute('viewBox', VIEWBOX_REPOSO);
      },
    });
    return () => {
      tween.kill();
    };
  }, [seleccionada, mostrada, proporcion, aplicar]);

  // Al cambiar el tamaño de la ventana se reencuadra al instante.
  useEffect(() => {
    function alRedimensionar() {
      const destino = seleccionada ? focoDe(mostrada, seleccionada, lado.current) : null;
      if (!destino) return;
      Object.assign(camara.current, encuadreDe(destino, proporcion()));
      aplicar();
    }
    window.addEventListener('resize', alRedimensionar);
    return () => window.removeEventListener('resize', alRedimensionar);
  }, [seleccionada, mostrada, proporcion, aplicar]);

  // Escape vuelve al cuerpo completo.
  useEffect(() => {
    if (!seleccionada || !onClear) return;
    function alTeclear(e: KeyboardEvent) {
      if (e.key === 'Escape') onClear?.();
    }
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [seleccionada, onClear]);

  // Giro entre vistas, parte 1: la vista actual se cierra y, al terminar, se monta la nueva.
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

  // Giro entre vistas, parte 2: la vista nueva se abre desde la línea central.
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

  /** Con un clic o toque se acerca al lado tocado; con teclado, al izquierdo del dibujo. */
  function alElegir(region: Region, evento: EventoSeleccion) {
    lado.current = 'izquierdo';
    const el = svg.current;
    if ('clientX' in evento && el?.getScreenCTM) {
      const ctm = el.getScreenCTM();
      if (ctm) {
        const x = (evento.clientX - ctm.e) / ctm.a;
        if (x > BODY_VIEWBOX.w / 2) lado.current = 'derecho';
      }
    }
    onSelect(region);
  }

  function alPulsarFondo(evento: MouseEvent<SVGSVGElement>) {
    if (evento.target === evento.currentTarget) onClear?.();
  }

  return (
    <svg
      ref={svg}
      viewBox={VIEWBOX_REPOSO}
      role="group"
      aria-label={`Cuerpo humano, ${NOMBRE_VISTA[mostrada]}. Elige una región.`}
      data-zoom={seleccionada ? 'si' : 'no'}
      onClick={alPulsarFondo}
      className={className}
    >
      <g ref={grupo}>
        <BodyFigure
          vista={mostrada}
          regiones={regiones}
          seleccionada={seleccionada}
          onSelect={alElegir}
          onHover={onHover}
        />
      </g>
    </svg>
  );
}
