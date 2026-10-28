import { useEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import type { Categoria } from '@/lib/api';
import { prefersReducedMotion } from '@/lib/motion';
import { etiquetaCorta } from './etiquetas';

interface CategoriaMenuProps {
  /** Nombre de la región ampliada, para el nombre accesible del menú. */
  region: string;
  categorias: Categoria[];
  /** `cargando` dibuja 9 huecos; `error` deja solo el botón de volver. */
  estado?: 'cargando' | 'error' | 'listo';
  activaId: number | null;
  onElegir: (categoria: Categoria) => void;
  onVolver: () => void;
  /** Hueco central: ahí queda la región ampliada; el cuerpo se encuadra dentro de él. */
  ventana: RefObject<HTMLDivElement | null>;
}

const BOTON =
  'rounded-campo pointer-events-auto flex min-h-12 cursor-pointer items-center justify-center border-2 border-tinta px-2 py-1.5 text-center text-sm leading-tight font-semibold transition-colors duration-150 sm:text-base';

/**
 * Las categorías rodean la región ampliada: tres arriba, dos a cada lado y dos abajo, con el
 * botón para volver al cuerpo completo en medio de la fila inferior. El centro es un hueco
 * transparente por el que se sigue viendo y tocando el cuerpo.
 * Orden de tabulación: de arriba abajo y de izquierda a derecha.
 */
export function CategoriaMenu({
  region,
  categorias,
  estado = 'listo',
  activaId,
  onElegir,
  onVolver,
  ventana,
}: CategoriaMenuProps) {
  const raiz = useRef<HTMLElement>(null);

  // Entrada: los botones aparecen desde el centro con un pequeño escalonado.
  useEffect(() => {
    const el = raiz.current;
    if (!el || prefersReducedMotion()) return;
    const botones = el.querySelectorAll('button');
    const tween = gsap.from(botones, {
      opacity: 0,
      y: 12,
      duration: 0.35,
      ease: 'power2.out',
      stagger: 0.04,
      delay: 0.25,
      clearProps: 'opacity,transform',
    });
    return () => {
      tween.kill();
      gsap.set(botones, { clearProps: 'opacity,transform' });
    };
  }, []);

  const boton = (c: Categoria, posicion = '') => {
    const activa = activaId === c.id;
    return (
      <button
        key={c.id}
        type="button"
        aria-label={c.nombre}
        aria-pressed={activa}
        onClick={() => onElegir(c)}
        className={`${BOTON} ${posicion} ${
          activa ? 'bg-tinta text-fondo' : 'bg-fondo text-tinta hover:bg-acento-claro'
        }`}
      >
        {etiquetaCorta(c.nombre)}
      </button>
    );
  };

  const hueco = (i: number, posicion = '') => (
    <div
      key={`hueco-${i}`}
      aria-hidden
      className={`bg-fondo-2 rounded-campo min-h-12 ${posicion}`}
    />
  );
  const fila = (c: Categoria | undefined, i: number, posicion = '') =>
    c ? boton(c, posicion) : estado === 'cargando' ? hueco(i, posicion) : null;
  const celda = (indice: number) => categorias[indice];
  const arriba = [0, 1, 2, 3];
  const abajo = [4, 5, 6, 7];

  return (
    <nav
      ref={raiz}
      aria-label={`Categorías terapéuticas de ${region}`}
      className="pointer-events-none absolute inset-0 mx-auto grid max-w-3xl grid-cols-[minmax(5.5rem,1fr)_minmax(0,2fr)_minmax(5.5rem,1fr)] grid-rows-[auto_1fr_1fr_auto] gap-2 sm:grid-cols-[minmax(7rem,1fr)_minmax(0,3fr)_minmax(7rem,1fr)]"
    >
      {estado === 'cargando' ? (
        <p role="status" className="sr-only">
          Cargando categorías…
        </p>
      ) : null}
      {arriba.map((n, i) => fila(celda(n), n, i === 3 ? 'self-end' : ''))}
      <div ref={ventana} aria-hidden className="col-start-2 row-span-2 row-start-2" />
      {abajo.map((n, i) =>
        fila(celda(n), n, i === 0 ? 'self-end' : i < 3 ? 'self-start' : ''),
      )}
      <button
        type="button"
        onClick={onVolver}
        className={`${BOTON} col-start-2 row-start-4 bg-fondo text-tinta hover:bg-tinta hover:text-fondo`}
      >
        Cuerpo completo
      </button>
      {fila(celda(8), 8)}
    </nav>
  );
}
