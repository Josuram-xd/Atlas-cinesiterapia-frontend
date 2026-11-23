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
      className={`border-l-4 py-2 pl-4 font-medium ${
        esError ? 'border-error text-error' : 'border-acento text-tinta'
      }`}
    >
      {children}
    </div>
  );
}
