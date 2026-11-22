import type { ButtonHTMLAttributes } from 'react';
import { useEnLinea } from '@/hooks/useEnLinea';

interface BotonTextoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Acción que cambia datos: se deshabilita sin conexión. */
  soloEnLinea?: boolean;
}

/** Acción secundaria con aspecto de enlace (Responder, Reportar, Eliminar...). */
export function BotonTexto({ soloEnLinea = false, disabled, ...props }: BotonTextoProps) {
  const enLinea = useEnLinea();
  return (
    <button
      type="button"
      disabled={disabled || (soloEnLinea && !enLinea)}
      className="text-acento hover:text-tinta min-h-11 cursor-pointer px-1 font-semibold underline underline-offset-4"
      {...props}
    />
  );
}
