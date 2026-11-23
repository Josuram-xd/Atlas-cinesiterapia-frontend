import { useEffect, useRef, useState } from 'react';

export interface ImagenVisor {
  url: string;
  etiqueta: string;
}

const FOCALIZABLES = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

const BOTON =
  'min-h-12 min-w-12 cursor-pointer px-4 py-2 font-semibold text-fondo underline underline-offset-4 hover:text-acento-claro disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline';

/**
 * Visor ampliado de imágenes: diálogo modal con foco atrapado, cierre con Escape,
 * flechas para pasar de imagen y contador anunciado a lectores de pantalla.
 * Quien lo abre devuelve el foco al cerrarlo (ver GaleriaImagenes).
 */
export function VisorImagenes({
  nombre,
  imagenes,
  inicial,
  onCerrar,
}: {
  nombre: string;
  imagenes: ImagenVisor[];
  inicial: number;
  onCerrar: () => void;
}) {
  const [indice, setIndice] = useState(inicial);
  const raiz = useRef<HTMLDivElement>(null);
  const cerrar = useRef<HTMLButtonElement>(null);
  const actual = imagenes[indice];
  const total = imagenes.length;

  useEffect(() => {
    cerrar.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  // El teclado se escucha en el documento: al llegar a un extremo el botón activo se
  // deshabilita y el navegador suelta el foco, y las flechas y Escape deben seguir funcionando.
  useEffect(() => {
    const cerrarVisor = onCerrar;
    function alTeclear(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        cerrarVisor();
      } else if (e.key === 'ArrowRight') {
        setIndice((i) => Math.min(i + 1, total - 1));
      } else if (e.key === 'ArrowLeft') {
        setIndice((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Tab') {
        const items = [
          ...(raiz.current?.querySelectorAll<HTMLElement>(FOCALIZABLES) ?? []),
        ];
        if (items.length === 0) return;
        const primero = items[0];
        const ultimo = items[items.length - 1];
        const activo = document.activeElement;
        const dentro = raiz.current?.contains(activo) ?? false;
        if (e.shiftKey && (activo === primero || !dentro)) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && (activo === ultimo || !dentro)) {
          e.preventDefault();
          primero.focus();
        }
      }
    }
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [onCerrar, total]);

  return (
    <div
      ref={raiz}
      role="dialog"
      aria-modal="true"
      aria-label={`Visor de imágenes de ${nombre}`}
      className="superficie-oscura fixed inset-0 z-50 flex flex-col"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-2">
        <p aria-live="polite" className="font-semibold">
          {actual.etiqueta}
          <span className="font-light"> · </span>
          <span className="font-light">
            {indice + 1} de {imagenes.length}
          </span>
        </p>
        <button ref={cerrar} type="button" onClick={onCerrar} className={BOTON}>
          Cerrar visor
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center px-4">
        <img
          src={actual.url}
          alt={`${actual.etiqueta} de ${nombre}`}
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <div className="flex items-center justify-between gap-4 px-4 py-2">
        <button
          type="button"
          onClick={() => setIndice((i) => i - 1)}
          disabled={indice === 0}
          className={BOTON}
        >
          Imagen anterior
        </button>
        <button
          type="button"
          onClick={() => setIndice((i) => i + 1)}
          disabled={indice === imagenes.length - 1}
          className={BOTON}
        >
          Imagen siguiente
        </button>
      </div>
    </div>
  );
}
