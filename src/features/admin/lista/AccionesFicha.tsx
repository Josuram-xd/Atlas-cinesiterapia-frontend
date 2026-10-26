import { useState } from 'react';
import { Button } from '@/components/Button';
import { ConfirmarAccion } from '@/components/ConfirmarAccion';
import type { EjercicioAdmin, EstadoFicha } from '@/lib/api';
import { useAccionesFicha } from '../api/hooks';
import { describirError } from '../erroresAdmin';

type Accion = 'archivar' | 'restaurar' | 'eliminar';

interface AccionesFichaProps {
  ficha: { id: number; nombre: string; estado: EstadoFicha };
  /** `compacto` dibuja enlaces de texto (listas); si no, botones. */
  compacto?: boolean;
  /** Se llama tras una acción lograda; `actualizada` es `null` si la ficha se eliminó. */
  onHecho: (accion: Accion, actualizada: EjercicioAdmin | null) => void;
}

const TEXTOS: Record<
  Accion,
  { titulo: (n: string) => string; detalle: string; boton: string }
> = {
  archivar: {
    titulo: (n) => `¿Archivar «${n}»?`,
    detalle: 'Dejará de verse en el atlas. Podrás restaurarla cuando quieras.',
    boton: 'Archivar ficha',
  },
  restaurar: {
    titulo: (n) => `¿Restaurar «${n}»?`,
    detalle: 'Volverá a publicarse y se verá de nuevo en el atlas.',
    boton: 'Restaurar ficha',
  },
  eliminar: {
    titulo: (n) => `¿Eliminar «${n}»?`,
    detalle:
      'La ficha dejará de aparecer en toda la aplicación, también para los demás administradores. No se puede deshacer desde aquí.',
    boton: 'Eliminar ficha',
  },
};

/**
 * Archivar, restaurar y eliminar una ficha. Cada acción pide confirmación en un diálogo
 * antes de llamar al backend (HU-13 y HU-14). Archivar solo aplica a fichas publicadas y
 * restaurar a archivadas; eliminar, a cualquiera.
 */
export function AccionesFicha({ ficha, compacto = false, onHecho }: AccionesFichaProps) {
  const acciones = useAccionesFicha();
  const [pendiente, setPendiente] = useState<Accion | null>(null);
  const [error, setError] = useState<string>();
  const [cargando, setCargando] = useState(false);

  const disponibles: Accion[] = [
    ...(ficha.estado === 'PUBLICADO' ? (['archivar'] as const) : []),
    ...(ficha.estado === 'ARCHIVADO' ? (['restaurar'] as const) : []),
    'eliminar',
  ];

  async function ejecutar(accion: Accion) {
    setCargando(true);
    setError(undefined);
    try {
      if (accion === 'eliminar') {
        await acciones.eliminar.mutateAsync(ficha.id);
        onHecho(accion, null);
      } else {
        const m = accion === 'archivar' ? acciones.archivar : acciones.restaurar;
        const actualizada = await m.mutateAsync(ficha.id);
        onHecho(accion, actualizada);
      }
      setPendiente(null);
    } catch (e) {
      setError(describirError(e).mensaje);
    } finally {
      setCargando(false);
    }
  }

  const etiqueta = (a: Accion) => TEXTOS[a].boton.replace(' ficha', '');

  return (
    <>
      {disponibles.map((a) =>
        compacto ? (
          <button
            key={a}
            type="button"
            onClick={() => setPendiente(a)}
            aria-label={`${etiqueta(a)} ${ficha.nombre}`}
            className="text-acento min-h-11 cursor-pointer px-1 font-semibold underline underline-offset-4"
          >
            {etiqueta(a)}
          </button>
        ) : (
          <Button key={a} variante="secundario" onClick={() => setPendiente(a)}>
            {etiqueta(a)}
          </Button>
        ),
      )}
      {pendiente ? (
        <ConfirmarAccion
          titulo={TEXTOS[pendiente].titulo(ficha.nombre)}
          confirmar={TEXTOS[pendiente].boton}
          cargando={cargando}
          error={error}
          onConfirmar={() => void ejecutar(pendiente)}
          onCancelar={() => {
            setPendiente(null);
            setError(undefined);
          }}
        >
          <p>{TEXTOS[pendiente].detalle}</p>
        </ConfirmarAccion>
      ) : null}
    </>
  );
}
