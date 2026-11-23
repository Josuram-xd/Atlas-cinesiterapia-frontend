import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
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
        className="entrada flex flex-col gap-4"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-tinta-2">{region}</p>
            <h2 id="panel-titulo" className="font-display text-[1.75rem] leading-tight">
              {categoria}
            </h2>
            {estado === 'listo' && !vacio ? (
              <p className="text-tinta-2 tabular-nums" aria-live="polite">
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
              <div key={i} aria-hidden className="superficie h-20 animate-pulse" />
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
          <div role="status" className="superficie flex flex-col gap-1 px-5 py-5">
            <p className="font-display text-lg font-semibold">
              Todavía no hay ejercicios publicados para esta categoría.
            </p>
            <p className="text-tinta-2">
              Prueba con otra categoría de {region.toLowerCase()} o con otra región.
            </p>
          </div>
        ) : null}

        {estado === 'listo' && !vacio ? (
          <ul className="revelar flex flex-col gap-2">
            {ejercicios.map((e) => (
              <li key={e.id}>
                <Link
                  to={`/ejercicios/${e.id}`}
                  className="superficie fila-enlace text-tinta flex items-center justify-between gap-4 px-5 py-4 no-underline"
                >
                  <span className="font-display text-lg leading-snug font-semibold">
                    {e.nombre}
                  </span>
                  <span className="text-acento shrink-0 font-semibold">
                    Ver ficha{' '}
                    <span aria-hidden className="flecha">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    );
  },
);
