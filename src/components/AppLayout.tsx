import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
  /** Zona derecha de la cabecera (sesión, acciones). */
  actions?: ReactNode;
  /** Zona central de la cabecera (búsqueda). En pantallas angostas pasa a su propia fila. */
  centro?: ReactNode;
  /** Navegación secundaria (administración): fila de chips bajo la cabecera, o dentro en xl. */
  navegacion?: ReactNode;
}

/** Marca: una cabeza y un eje sobre la peana oscura, el mismo gesto que el atlas. */
export function Marca({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={`shrink-0 ${className}`}>
      <rect width="32" height="32" rx="9" fill="var(--color-escenario)" />
      <circle cx="16" cy="9.5" r="3.6" fill="var(--color-marfil)" />
      <path
        d="M16 15v10M10.5 17.5 16 15l5.5 2.5"
        stroke="var(--color-acento-vivo)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
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

export function AppLayout({ children, actions, centro, navegacion }: AppLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="bg-tinta text-fondo absolute top-2 left-2 z-50 -translate-y-20 rounded-full px-4 py-2 transition-transform focus:translate-y-0"
      >
        Saltar al contenido
      </a>
      <header className="px-gutter flex flex-wrap items-center justify-between gap-x-5 gap-y-2 py-3 sm:py-4">
        <Link
          to="/"
          className="group text-tinta hover:text-tinta flex min-h-11 items-center gap-2.5 no-underline"
          aria-label="Atlas de cinesiterapia, inicio"
        >
          <Marca className="size-8 transition-transform duration-300 ease-resorte group-hover:-rotate-6 group-active:scale-95" />
          <Wordmark className="text-lg sm:text-xl [&>span:last-child]:max-[25rem]:hidden" />
        </Link>
        {centro ? (
          <div className="order-last w-full lg:order-none lg:max-w-sm lg:flex-1 xl:max-w-xs 2xl:max-w-md">
            {centro}
          </div>
        ) : null}
        {navegacion ? (
          <div className="-mx-gutter px-gutter order-last w-[calc(100%+2*var(--spacing-gutter))] overflow-x-auto xl:order-none xl:mx-0 xl:w-auto xl:px-0">
            {navegacion}
          </div>
        ) : null}
        <div className="flex items-center gap-x-4 gap-y-2">{actions}</div>
      </header>
      <main
        id="contenido"
        tabIndex={-1}
        className="px-gutter transicion-ruta flex flex-1 flex-col pb-10 outline-none"
      >
        {children}
      </main>
    </div>
  );
}
