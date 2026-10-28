import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
  /** Zona derecha de la cabecera (sesión, acciones). */
  actions?: ReactNode;
  /** Zona central de la cabecera (búsqueda). En pantallas angostas pasa a su propia fila. */
  centro?: ReactNode;
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-display leading-none tracking-tight whitespace-nowrap ${className}`}
    >
      <span className="font-extrabold">Atlas</span>{' '}
      <span className="font-light">de cinesiterapia</span>
    </span>
  );
}

export function AppLayout({ children, actions, centro }: AppLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="bg-tinta text-fondo absolute top-2 left-2 z-50 -translate-y-20 px-4 py-2 focus:translate-y-0"
      >
        Saltar al contenido
      </a>
      <header className="px-gutter flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-4">
        <Link
          to="/"
          className="text-tinta no-underline hover:text-acento"
          aria-label="Atlas de cinesiterapia, inicio"
        >
          <Wordmark className="text-lg sm:text-xl" />
        </Link>
        {centro ? (
          <div className="order-last w-full lg:order-none lg:max-w-md lg:flex-1">
            {centro}
          </div>
        ) : null}
        <div className="flex items-center gap-4">{actions}</div>
      </header>
      <main
        id="contenido"
        tabIndex={-1}
        className="px-gutter flex flex-1 flex-col pb-8 outline-none"
      >
        {children}
      </main>
    </div>
  );
}
