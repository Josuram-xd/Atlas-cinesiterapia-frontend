import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from './Button';

interface ConfirmarAccionProps {
  titulo: string;
  /** Detalle de lo que ocurrirá. */
  children?: ReactNode;
  /** Texto del botón que confirma, con el verbo de la acción ("Eliminar ficha"). */
  confirmar: string;
  /** Error de la última tentativa, para no cerrar el diálogo en silencio. */
  error?: string;
  cargando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/** Diálogo de confirmación modal: el foco inicial cae en Cancelar (seguro), Escape cancela, foco atrapado. */
export function ConfirmarAccion({
  titulo,
  children,
  confirmar,
  error,
  cargando = false,
  onConfirmar,
  onCancelar,
}: ConfirmarAccionProps) {
  const cancelar = useRef<HTMLButtonElement>(null);
  const raiz = useRef<HTMLDivElement>(null);
  const previo = useRef<Element | null>(null);

  useEffect(() => {
    previo.current = document.activeElement;
    cancelar.current?.focus();
    return () => {
      if (previo.current instanceof HTMLElement) previo.current.focus();
    };
  }, []);

  useEffect(() => {
    function alTeclear(e: KeyboardEvent) {
      if (e.key === 'Escape' && !cargando) {
        e.stopPropagation();
        onCancelar();
      } else if (e.key === 'Tab') {
        const items = [
          ...(raiz.current?.querySelectorAll<HTMLElement>('button:not([disabled])') ??
            []),
        ];
        if (items.length === 0) return;
        const activo = document.activeElement;
        const dentro = raiz.current?.contains(activo) ?? false;
        if (e.shiftKey && (activo === items[0] || !dentro)) {
          e.preventDefault();
          items[items.length - 1].focus();
        } else if (!e.shiftKey && (activo === items[items.length - 1] || !dentro)) {
          e.preventDefault();
          items[0].focus();
        }
      }
    }
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [cargando, onCancelar]);

  return (
    <div className="bg-tinta/70 fixed inset-0 z-50 grid place-items-center p-4">
      <div
        ref={raiz}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmar-titulo"
        aria-describedby={children ? 'confirmar-detalle' : undefined}
        className="rounded-campo bg-fondo w-full max-w-md p-6"
      >
        <h2 id="confirmar-titulo" className="font-display text-2xl">
          {titulo}
        </h2>
        {children ? (
          <div id="confirmar-detalle" className="mt-3">
            {children}
          </div>
        ) : null}
        {error ? (
          <p role="alert" className="text-error mt-3 font-medium">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <Button onClick={onConfirmar} cargando={cargando}>
            {confirmar}
          </Button>
          <Button
            ref={cancelar}
            variante="secundario"
            onClick={onCancelar}
            disabled={cargando}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
