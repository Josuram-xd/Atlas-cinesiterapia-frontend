import type { Rango } from '@/lib/api';
import { formatearDuracion, formatearVariacion } from './formato';
import { PanelMetrica } from './PanelMetrica';

/** Tiempo promedio por sesión y su tendencia frente al periodo anterior (HU-34). */
export function PanelTiempo({ rango }: { rango: Rango | null }) {
  return (
    <PanelMetrica
      id="tiempo"
      titulo="Tiempo promedio por sesión"
      que="el tiempo de uso"
      rango={rango}
      pedir={(api, r, signal) => api.tiempoPromedio(r, signal)}
      vacio={(d) =>
        d.promedioSegundos === undefined
          ? 'No hay datos suficientes en este periodo.'
          : null
      }
      extra={
        <p className="text-tinta-2 w-full">
          Solo cuentan las sesiones con al menos dos avisos de actividad.
        </p>
      }
    >
      {({ promedioSegundos, sesiones, variacionPorcentaje, anterior }) => (
        <div className="flex flex-col gap-2">
          <p className="font-display text-[clamp(2.75rem,1.8rem+3.6vw,5rem)] leading-none font-bold tracking-[-0.04em] tabular-nums">
            {formatearDuracion(promedioSegundos!)}
          </p>
          <p className="text-tinta-2">
            Promedio de {sesiones} {sesiones === 1 ? 'sesión' : 'sesiones'}
          </p>
          {/* El backend solo manda la variación si hay ambos promedios; el segundo test es para TS. */}
          {variacionPorcentaje !== undefined &&
          anterior.promedioSegundos !== undefined ? (
            <p>
              {formatearVariacion(variacionPorcentaje)} frente al periodo anterior (
              {formatearDuracion(anterior.promedioSegundos)} por sesión)
            </p>
          ) : (
            <p className="text-tinta-2">
              Sin datos suficientes en el periodo anterior para comparar.
            </p>
          )}
        </div>
      )}
    </PanelMetrica>
  );
}
