import { Button } from '@/components/Button';
import { useEnLinea } from '@/hooks/useEnLinea';
import { useActualizacion } from './actualizacion';

const FRANJA =
  'px-gutter bg-acento-claro text-tinta flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3';

/** Franjas planas sobre el contenido para avisos del sistema (sin conexión, versión nueva). */
export function AvisosSistema() {
  return (
    <>
      <AvisoSinConexion />
      <AvisoVersionNueva />
    </>
  );
}

function AvisoSinConexion() {
  const enLinea = useEnLinea();
  if (enLinea) return null;
  return (
    <div className={FRANJA}>
      <p role="status" className="font-medium">
        Sin conexión: puedes seguir leyendo lo que ya abriste. Las acciones que cambian
        datos se habilitan cuando vuelva la conexión.
      </p>
    </div>
  );
}

function AvisoVersionNueva() {
  const aplicar = useActualizacion((s) => s.aplicar);
  const descartar = useActualizacion((s) => s.descartar);

  if (!aplicar) return null;
  return (
    <div className={FRANJA}>
      <p role="status" className="font-medium">
        Hay una versión nueva del atlas lista para usar.
      </p>
      <div className="flex gap-3">
        <Button className="min-h-10 px-4 py-1.5" onClick={aplicar}>
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
