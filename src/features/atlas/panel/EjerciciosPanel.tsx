import { forwardRef } from 'react';
import type { EjercicioResumen } from '@/lib/api';

interface EjerciciosPanelProps {
  region: string;
  /** Nombre completo de la categoría elegida. */
  categoria: string;
  ejercicios: EjercicioResumen[];
  onCerrar: () => void;
}

/**
 * Listado de los ejercicios publicados de la región y la categoría elegidas.
 * Superficies planas separadas por un cambio de tono; sin tarjetas ni iconos.
 * La cantidad se anuncia a los lectores de pantalla cuando cambia el listado.
 */
export const EjerciciosPanel = forwardRef<HTMLElement, EjerciciosPanelProps>(
  function EjerciciosPanel({ region, categoria, ejercicios, onCerrar }, ref) {
    const cantidad = `${ejercicios.length} ${ejercicios.length === 1 ? 'ejercicio' : 'ejercicios'}`;
    return (
      <section ref={ref} aria-labelledby="panel-titulo" className="flex flex-col gap-4">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-tinta-2">{region}</p>
            <h2 id="panel-titulo" className="font-display text-2xl leading-tight">
              {categoria}
            </h2>
            <p className="text-tinta-2" aria-live="polite">
              {cantidad}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="text-acento hover:text-tinta min-h-12 shrink-0 cursor-pointer px-1 font-semibold underline underline-offset-4"
          >
            Cerrar listado
          </button>
        </header>
        <ul className="flex flex-col gap-2">
          {ejercicios.map((e) => (
            <li key={e.id} className="bg-fondo-2 flex flex-col gap-1 px-4 py-3">
              <span className="font-display text-lg leading-snug font-semibold">
                {e.nombre}
              </span>
              <span className="text-tinta-2">{e.resumen}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  },
);
