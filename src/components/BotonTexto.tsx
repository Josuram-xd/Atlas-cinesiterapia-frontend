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
      className="text-acento hover:text-tinta decoration-acento/40 hover:decoration-tinta min-h-11 cursor-pointer rounded-full px-1 font-semibold underline decoration-[0.08em] underline-offset-[0.22em] transition-colors duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
      {...props}
    />
  );
}
