import type { ButtonHTMLAttributes } from 'react';

/** Acción secundaria con aspecto de enlace (Responder, Reportar, Eliminar...). */
export function BotonTexto(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="text-acento hover:text-tinta min-h-11 cursor-pointer px-1 font-semibold underline underline-offset-4"
      {...props}
    />
  );
}
