import type { ButtonHTMLAttributes, Ref } from 'react';
import { useEnLinea } from '@/hooks/useEnLinea';

type Variante = 'primario' | 'secundario';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  cargando?: boolean;
  /** Acción que cambia datos: se deshabilita sin conexión. */
  soloEnLinea?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const estilos: Record<Variante, string> = {
  primario: 'bg-tinta text-fondo border-tinta hover:bg-acento hover:border-acento',
  secundario:
    'bg-transparent text-tinta border-tinta/30 hover:bg-tinta hover:text-fondo hover:border-tinta',
};

export function Button({
  variante = 'primario',
  cargando = false,
  soloEnLinea = false,
  className = '',
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const enLinea = useEnLinea();
  return (
    <button
      type={type}
      disabled={disabled || cargando || (soloEnLinea && !enLinea)}
      aria-busy={cargando || undefined}
      className={`inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border-[1.5px] px-6 py-2.5 font-semibold transition-[background-color,border-color,color,transform] duration-200 ease-atlas select-none enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 aria-busy:animate-pulse ${estilos[variante]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
