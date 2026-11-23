import type { ReactNode } from 'react';

interface NoticeProps {
  tipo: 'error' | 'info';
  children: ReactNode;
}

/** Aviso plano con una barra lateral de color; los errores se anuncian al lector de pantalla. */
export function Notice({ tipo, children }: NoticeProps) {
  const esError = tipo === 'error';
  return (
    <div
      role={esError ? 'alert' : 'status'}
      className={`entrada rounded-campo border-l-4 py-3 pr-4 pl-4 font-medium ${
        esError
          ? 'border-error text-error bg-[#f3e3df]'
          : 'border-acento text-tinta bg-fondo-2'
      }`}
    >
      {children}
    </div>
  );
}
