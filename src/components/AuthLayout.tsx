import type { ReactNode } from 'react';
import { FiguraVitrina } from '@/features/atlas/body/FiguraVitrina';
import { Marca, Wordmark } from './AppLayout';

interface AuthLayoutProps {
  titulo: string;
  /** Frase breve bajo el título, en el panel del formulario. */
  descripcion?: string;
  children: ReactNode;
  /** Enlaces secundarios bajo el formulario. */
  pie?: ReactNode;
}

/**
 * Pantallas de acceso: el escenario oscuro con el cuerpo iluminado y la idea del producto y, al
 * lado, el formulario sobre papel. En móvil el escenario se reduce a una franja superior.
 */
export function AuthLayout({ titulo, descripcion, children, pie }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="superficie-oscura escenario px-gutter relative isolate flex flex-col gap-8 overflow-hidden py-6 lg:justify-between lg:py-10">
        <div className="flex items-center gap-2.5">
          <Marca className="size-8" />
          <Wordmark className="text-xl" />
        </div>
        <FiguraVitrina className="entrada pointer-events-none absolute top-[5%] right-[5%] -z-10 h-[54%] max-lg:hidden" />
        <div className="revelar flex flex-col gap-5">
          <p className="font-display text-gigante max-w-[8ch] font-extrabold tracking-[-0.04em] max-lg:text-[2.6rem] max-lg:leading-none">
            El cuerpo es el menú.
          </p>
          <p className="text-fondo/80 max-w-[34ch] max-lg:hidden">
            Elige una región, elige un tipo de tratamiento y llega al ejercicio que
            necesitas.
          </p>
        </div>
      </aside>
      <main
        id="contenido"
        className="px-gutter flex flex-col justify-center py-10 lg:py-16 xl:pl-[8vw]"
      >
        <div className="revelar w-full max-w-md">
          <h1 className="font-display text-titulo">{titulo}</h1>
          {descripcion ? <p className="text-tinta-2 mt-3">{descripcion}</p> : null}
          <div className="mt-8">{children}</div>
          {pie ? <div className="mt-8 flex flex-col gap-2">{pie}</div> : null}
        </div>
      </main>
    </div>
  );
}
