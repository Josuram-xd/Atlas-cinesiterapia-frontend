import { useEffect, useRef } from 'react';
import type { Blocker } from 'react-router-dom';
import { MENSAJE_CAMBIOS_SIN_GUARDAR } from '@/hooks/useUnsavedChanges';
import { Button } from './Button';

/** Confirmación al navegar con cambios sin guardar. No muestra nada si no hay bloqueo. */
export function ConfirmarSalida({ blocker }: { blocker: Blocker }) {
  const seguir = useRef<HTMLButtonElement>(null);
  const bloqueado = blocker.state === 'blocked';

  useEffect(() => {
    if (bloqueado) seguir.current?.focus();
  }, [bloqueado]);

  if (!bloqueado) return null;
  return (
    <div className="bg-tinta/70 fixed inset-0 z-50 grid place-items-center p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="salida-titulo"
        onKeyDown={(e) => e.key === 'Escape' && blocker.reset()}
        className="rounded-campo bg-fondo w-full max-w-md p-6"
      >
        <h2 id="salida-titulo" className="font-display text-2xl">
          {MENSAJE_CAMBIOS_SIN_GUARDAR}
        </h2>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <Button ref={seguir} onClick={() => blocker.reset()}>
            Seguir editando
          </Button>
          <Button variante="secundario" onClick={() => blocker.proceed()}>
            Salir sin guardar
          </Button>
        </div>
      </div>
    </div>
  );
}
