import { forwardRef } from 'react';
import type { EjercicioResumen } from '@/lib/api';
import { EstadoError } from '../EstadoError';

interface EjerciciosPanelProps {
  region: string;
  /** Nombre completo de la categoría elegida. */
  categoria: string;
  estado: 'cargando' | 'error' | 'listo';
  ejercicios?: EjercicioResumen[];
  mensajeError?: string;
  onCerrar: () => void;
  onReintentar: () => void;
}

/**
 * Listado de los ejercicios publicados de la región y la categoría elegidas.
 * Superficies planas separadas por un cambio de tono; sin tarjetas ni iconos.
 * Tres estados además del listado: cargando, vacío (sin fichas) y error con reintento.
 */
export const EjerciciosPanel = forwardRef<HTMLElement, EjerciciosPanelProps>(
  function EjerciciosPanel(
    { region, categoria, estado, ejercicios = [], mensajeError, onCerrar, onReintentar },
    ref,
  ) {
    const vacio = estado === 'listo' && ejercicios.length === 0;
    return (
      <section
        ref={ref}
        aria-labelledby="panel-titulo"
        aria-busy={estado === 'cargando'}
        className="flex flex-col gap-4"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-tinta-2">{region}</p>
            <h2 id="panel-titulo" className="font-display text-2xl leading-tight">
              {categoria}
            </h2>
            {estado === 'listo' && !vacio ? (
              <p className="text-tinta-2" aria-live="polite">
                {ejercicios.length} {ejercicios.length === 1 ? 'ejercicio' : 'ejercicios'}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="text-acento hover:text-tinta min-h-12 shrink-0 cursor-pointer px-1 font-semibold underline underline-offset-4"
          >
            Cerrar listado
          </button>
        </header>

        {estado === 'cargando' ? (
          <div role="status" className="flex flex-col gap-2">
            <p className="text-tinta-2">Cargando ejercicios…</p>
            {[0, 1, 2].map((i) => (
              <div key={i} aria-hidden className="bg-fondo-2 h-20" />
            ))}
          </div>
        ) : null}

        {estado === 'error' ? (
          <EstadoError
            mensaje={mensajeError ?? 'No pudimos cargar los ejercicios.'}
            onReintentar={onReintentar}
          />
        ) : null}

        {vacio ? (
          <div role="status" className="bg-fondo-2 flex flex-col gap-1 px-4 py-4">
            <p className="font-display text-lg font-semibold">
              Todavía no hay ejercicios publicados para esta categoría.
            </p>
            <p className="text-tinta-2">
              Prueba con otra categoría de {region.toLowerCase()} o con otra región.
            </p>
          </div>
        ) : null}

        {estado === 'listo' && !vacio ? (
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
        ) : null}
      </section>
    );
  },
);
