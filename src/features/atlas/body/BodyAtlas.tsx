import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import gsap from 'gsap';
import type { Region } from '@/lib/api';
import { prefersReducedMotion } from '@/lib/motion';
import { BodyFigure, type EventoSeleccion } from './BodyFigure';
import type { Box } from './curves';
import { BODY_VIEWBOX, type VistaId } from './geometry';
import { esToque, moverGesto, type Punto } from './gestos';
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
  const dedos = useRef(new Map<number, Punto>());
  const inicios = useRef(new Map<number, Punto>());
  const arrastrando = useRef(false);
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

  /** Mueve la cámara a `objetivo`; al volver al reposo restaura el viewBox original. */
  const irA = useCallback(
    (objetivo: Box, volverAReposo: boolean) => {
      if (prefersReducedMotion()) {
        Object.assign(camara.current, objetivo);
        if (volverAReposo) svg.current?.setAttribute('viewBox', VIEWBOX_REPOSO);
        else aplicar();
        return null;
      }
      return gsap.to(camara.current, {
        ...objetivo,
        duration: 0.85,
        ease: 'power3.inOut',
        overwrite: true,
        onUpdate: aplicar,
        onComplete: () => {
          if (volverAReposo) svg.current?.setAttribute('viewBox', VIEWBOX_REPOSO);
        },
      });
    },
    [aplicar],
  );

  // Cámara: se acerca a la región elegida o vuelve al cuerpo completo.
  useEffect(() => {
    const destino = seleccionada ? focoDe(mostrada, seleccionada, lado.current) : null;
    const objetivo = destino
      ? encuadreDe(destino, proporcion())
      : encuadreCompleto(proporcion());
    const tween = irA(objetivo, !destino);
    return () => {
      tween?.kill();
    };
  }, [seleccionada, mostrada, proporcion, irA]);

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

  /** Vuelve al cuerpo completo, también cuando la cámara se movió con los dedos. */
  function volverAlCuerpo() {
    onClear?.();
    if (!seleccionada) irA(encuadreCompleto(proporcion()), true);
  }

  function alPulsarFondo(evento: MouseEvent<SVGSVGElement>) {
    if (evento.target === evento.currentTarget) volverAlCuerpo();
  }

  // Gestos táctiles: un dedo arrastra, dos dedos hacen pellizco. El ratón conserva
  // solo clic. Un toque corto elige la región; un arrastre no debe elegirla.
  function alBajarDedo(e: PointerEvent<SVGSVGElement>) {
    if (e.pointerType === 'mouse') return;
    const punto = { x: e.clientX, y: e.clientY };
    if (dedos.current.size === 0) {
      gsap.killTweensOf(camara.current);
      if (svg.current?.getAttribute('viewBox') === VIEWBOX_REPOSO) {
        Object.assign(camara.current, encuadreCompleto(proporcion()));
      }
      arrastrando.current = false;
    }
    dedos.current.set(e.pointerId, punto);
    inicios.current.set(e.pointerId, punto);
    if (dedos.current.size > 1) arrastrando.current = true;
  }

  function alMoverDedo(e: PointerEvent<SVGSVGElement>) {
    const anterior = dedos.current.get(e.pointerId);
    const el = svg.current;
    if (!anterior || !el) return;
    const actual = { x: e.clientX, y: e.clientY };
    if (!arrastrando.current && !esToque(inicios.current.get(e.pointerId)!, actual)) {
      arrastrando.current = true;
    }
    const antes: Punto[] = [...dedos.current.values()];
    dedos.current.set(e.pointerId, actual);
    if (!arrastrando.current) return;
    const despues: Punto[] = [...dedos.current.values()];
    const r = el.getBoundingClientRect();
    const rect = { left: r.left, top: r.top, width: r.width, height: r.height };
    Object.assign(
      camara.current,
      moverGesto(
        { ...camara.current },
        antes.slice(0, 2),
        despues.slice(0, 2),
        rect,
        encuadreCompleto(proporcion()),
      ),
    );
    aplicar();
  }

  function alSoltarDedo(e: PointerEvent<SVGSVGElement>) {
    if (!dedos.current.delete(e.pointerId)) return;
    inicios.current.delete(e.pointerId);
    if (dedos.current.size > 0) return;
    // El clic que sigue a un arrastre se descarta; después se vuelve a permitir.
    setTimeout(() => {
      arrastrando.current = false;
    }, 0);
    // Un pellizco que alcanza el cuerpo completo devuelve al reposo.
    if (arrastrando.current && camara.current.h >= BODY_VIEWBOX.h * 0.98) {
      volverAlCuerpo();
    }
  }

  function alCapturarClic(e: MouseEvent<SVGSVGElement>) {
    if (arrastrando.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  return (
    <svg
      ref={svg}
      viewBox={VIEWBOX_REPOSO}
      role="group"
      aria-label={`Cuerpo humano, ${NOMBRE_VISTA[mostrada]}. Elige una región.`}
      data-zoom={seleccionada ? 'si' : 'no'}
      onClick={alPulsarFondo}
      onClickCapture={alCapturarClic}
      onPointerDown={alBajarDedo}
      onPointerMove={alMoverDedo}
      onPointerUp={alSoltarDedo}
      onPointerCancel={alSoltarDedo}
      className={`touch-none select-none ${className ?? ''}`}
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
