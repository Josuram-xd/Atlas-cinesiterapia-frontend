import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { EstadoError } from '@/features/atlas/EstadoError';
import { mensajeDeErrorAtlas } from '@/features/atlas/mensajes';
import type { Rango } from '@/lib/api';
import { useMetricasApi } from './api/contexto';
import type { MetricasApi } from './api/metricasApi';

interface PanelMetricaProps<T> {
  /** Id del título y parte de la clave de la consulta. */
  id: string;
  titulo: string;
  /** Lo que se muestra, para «Cargando el ranking…» y «Corrige las fechas para ver el ranking.». */
  que: string;
  /** Con `null` (fechas no válidas) no consulta. */
  rango: Rango | null;
  /** Lo que, además del rango, cambia la consulta (p. ej. la agrupación). */
  clave?: unknown[];
  pedir: (api: MetricasApi, rango: Rango, signal: AbortSignal) => Promise<T>;
  /** Texto si la respuesta no tiene nada que mostrar; `null` si sí. */
  vacio: (datos: T) => string | null;
  /** Junto al título: ayuda o controles del panel. */
  extra?: ReactNode;
  children: (datos: T) => ReactNode;
}

/** Sección de métricas: título, consulta y sus estados (sin rango, cargando, error, vacío, datos). */
export function PanelMetrica<T>({
  id,
  titulo,
  que,
  rango,
  clave = [],
  pedir,
  vacio,
  extra,
  children,
}: PanelMetricaProps<T>) {
  const api = useMetricasApi();
  const consulta = useQuery({
    queryKey: ['metricas', id, ...clave, rango],
    queryFn: ({ signal }) => pedir(api, rango!, signal),
    enabled: rango !== null,
  });

  function contenido() {
    if (!rango) return <p className="text-tinta-2">Corrige las fechas para ver {que}.</p>;
    if (consulta.isPending) {
      return (
        <p role="status" className="text-tinta-2">
          Cargando {que}…
        </p>
      );
    }
    if (consulta.isError) {
      return (
        <EstadoError
          mensaje={mensajeDeErrorAtlas(consulta.error)}
          onReintentar={() => void consulta.refetch()}
        />
      );
    }
    const textoVacio = vacio(consulta.data);
    if (textoVacio) {
      return (
        <p role="status" className="bg-fondo-2 px-4 py-5">
          {textoVacio}
        </p>
      );
    }
    return children(consulta.data);
  }

  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <h2 id={id} className="font-display text-2xl font-semibold">
          {titulo}
        </h2>
        {extra}
      </div>
      {contenido()}
    </section>
  );
}
