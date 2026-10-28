import type { Rango } from '@/lib/api';
import { PanelMetrica } from './PanelMetrica';

/** Fichas publicadas más visualizadas en el periodo (HU-32). */
export function PanelEjercicios({ rango }: { rango: Rango | null }) {
  return (
    <PanelMetrica
      id="ejercicios"
      titulo="Ejercicios más consultados"
      que="el ranking"
      rango={rango}
      pedir={(api, r, signal) => api.ejerciciosMasConsultados(r, signal)}
      vacio={(d) =>
        d.items.length === 0
          ? 'Ninguna ficha publicada tiene visualizaciones en este periodo.'
          : null
      }
    >
      {({ items }) => (
        <ol className="flex flex-col gap-2">
          {items.map((e) => (
            <li
              key={e.ejercicioId}
              className="bg-fondo-2 grid gap-x-6 gap-y-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <span className="font-display text-lg font-semibold">{e.nombre}</span>
              <span className="text-tinta-2 font-semibold tabular-nums sm:row-span-2 sm:self-center">
                {e.visitas} {e.visitas === 1 ? 'visualización' : 'visualizaciones'}
              </span>
              <span className="text-tinta-2">
                {e.region.nombre} · {e.categoria.nombre}
              </span>
            </li>
          ))}
        </ol>
      )}
    </PanelMetrica>
  );
}
