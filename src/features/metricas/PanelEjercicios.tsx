import { EstadoError } from '@/features/atlas/EstadoError';
import { mensajeDeErrorAtlas } from '@/features/atlas/mensajes';
import type { Rango } from '@/lib/api';
import { useEjerciciosMasConsultados } from './api/hooks';

/** Fichas publicadas más visualizadas en el periodo (HU-32). */
export function PanelEjercicios({ rango }: { rango: Rango | null }) {
  const top = useEjerciciosMasConsultados(rango);

  let contenido;
  if (!rango) {
    contenido = <p className="text-tinta-2">Corrige las fechas para ver el ranking.</p>;
  } else if (top.isPending) {
    contenido = (
      <p role="status" className="text-tinta-2">
        Cargando ranking…
      </p>
    );
  } else if (top.isError) {
    contenido = (
      <EstadoError
        mensaje={mensajeDeErrorAtlas(top.error)}
        onReintentar={() => void top.refetch()}
      />
    );
  } else if (top.data.items.length === 0) {
    contenido = (
      <p role="status" className="bg-fondo-2 px-4 py-5">
        Ninguna ficha publicada tiene visualizaciones en este periodo.
      </p>
    );
  } else {
    contenido = (
      <ol className="flex flex-col gap-2">
        {top.data.items.map((e) => (
          <li
            key={e.ejercicioId}
            className="bg-fondo-2 grid gap-x-6 gap-y-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto]"
          >
            <span className="font-display text-lg font-semibold">{e.nombre}</span>
            <span className="font-display text-lg font-semibold tabular-nums sm:row-span-2 sm:self-center">
              {e.visitas} {e.visitas === 1 ? 'visualización' : 'visualizaciones'}
            </span>
            <span className="text-tinta-2">
              {e.region.nombre} · {e.categoria.nombre}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <section aria-labelledby="ejercicios-titulo" className="flex flex-col gap-4">
      <h2 id="ejercicios-titulo" className="font-display text-2xl font-semibold">
        Ejercicios más consultados
      </h2>
      {contenido}
    </section>
  );
}
