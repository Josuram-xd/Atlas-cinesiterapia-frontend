import { Button } from '@/components/Button';
import { useActualizacion } from './actualizacion';

/** Franja plana sobre el contenido para avisos del sistema (versión nueva, sin conexión). */
export function AvisosSistema() {
  const disponible = useActualizacion((s) => s.disponible);
  const aplicar = useActualizacion((s) => s.aplicar);
  const descartar = useActualizacion((s) => s.descartar);

  if (!disponible) return null;
  return (
    <div className="px-gutter bg-acento-claro text-tinta flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
      <p role="status" className="font-medium">
        Hay una versión nueva del atlas lista para usar.
      </p>
      <div className="flex gap-3">
        <Button className="min-h-10 px-4 py-1.5" onClick={() => aplicar?.()}>
          Actualizar ahora
        </Button>
        <Button
          variante="secundario"
          className="min-h-10 px-4 py-1.5"
          onClick={descartar}
        >
          Más tarde
        </Button>
      </div>
    </div>
  );
}
