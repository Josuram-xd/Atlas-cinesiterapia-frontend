import type { ButtonHTMLAttributes } from 'react';

type Variante = 'primario' | 'secundario';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  cargando?: boolean;
}

const estilos: Record<Variante, string> = {
  primario: 'bg-tinta text-fondo border-tinta hover:bg-acento hover:border-acento',
  secundario: 'bg-transparent text-tinta border-tinta hover:bg-tinta hover:text-fondo',
};

export function Button({
  variante = 'primario',
  cargando = false,
  className = '',
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`rounded-campo inline-flex min-h-12 cursor-pointer items-center justify-center border-2 px-6 py-2.5 font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${estilos[variante]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
