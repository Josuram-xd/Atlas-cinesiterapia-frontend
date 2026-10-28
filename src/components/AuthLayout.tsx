import type { ReactNode } from 'react';
import { Wordmark } from './AppLayout';

interface AuthLayoutProps {
  titulo: string;
  /** Frase breve bajo el título, en el panel del formulario. */
  descripcion?: string;
  children: ReactNode;
  /** Enlaces secundarios bajo el formulario. */
  pie?: ReactNode;
}

/**
 * Pantallas de acceso: panel oscuro con la idea del producto y, al lado, el formulario.
 * En móvil el panel se reduce a una franja superior.
 */
export function AuthLayout({ titulo, descripcion, children, pie }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="superficie-oscura px-gutter flex flex-col justify-between gap-10 py-6 lg:py-10">
        <Wordmark className="text-xl" />
        <p className="font-display text-gigante max-w-[11ch] font-extrabold tracking-[-0.03em] max-lg:text-[2.6rem] max-lg:leading-none">
          El cuerpo es el menú.
        </p>
        <p className="text-fondo/80 max-w-[34ch] max-lg:hidden">
          Elige una región, elige un tipo de tratamiento y llega al ejercicio que
          necesitas.
        </p>
      </aside>
      <main
        id="contenido"
        className="px-gutter flex flex-col justify-center py-10 lg:py-16"
      >
        <div className="w-full max-w-md">
          <h1 className="font-display text-titulo">{titulo}</h1>
          {descripcion ? <p className="text-tinta-2 mt-3">{descripcion}</p> : null}
          <div className="mt-8">{children}</div>
          {pie ? <div className="mt-8 flex flex-col gap-2">{pie}</div> : null}
        </div>
      </main>
    </div>
  );
}
