import { EstadoError } from '@/features/atlas/EstadoError';
import { mensajeDeErrorAtlas } from '@/features/atlas/mensajes';
import type { Rango } from '@/lib/api';
import { useTiempoPromedio } from './api/hooks';
import { formatearDuracion, formatearVariacion } from './formato';

/** Tiempo promedio por sesión y su tendencia frente al periodo anterior (HU-34). */
export function PanelTiempo({ rango }: { rango: Rango | null }) {
  const tiempo = useTiempoPromedio(rango);

  let contenido;
  if (!rango) {
    contenido = (
      <p className="text-tinta-2">Corrige las fechas para ver el tiempo de uso.</p>
    );
  } else if (tiempo.isPending) {
    contenido = (
      <p role="status" className="text-tinta-2">
        Cargando tiempo de uso…
      </p>
    );
  } else if (tiempo.isError) {
    contenido = (
      <EstadoError
        mensaje={mensajeDeErrorAtlas(tiempo.error)}
        onReintentar={() => void tiempo.refetch()}
      />
    );
  } else if (tiempo.data.promedioSegundos === undefined) {
    contenido = (
      <p role="status" className="bg-fondo-2 px-4 py-5">
        No hay datos suficientes en este periodo.
      </p>
    );
  } else {
    const { promedioSegundos, sesiones, variacionPorcentaje, anterior } = tiempo.data;
    contenido = (
      <div className="flex flex-col gap-2">
        <p className="font-display text-4xl font-semibold tabular-nums">
          {formatearDuracion(promedioSegundos)}
        </p>
        <p className="text-tinta-2">
          Promedio de {sesiones} {sesiones === 1 ? 'sesión' : 'sesiones'}
        </p>
        {variacionPorcentaje !== undefined && anterior.promedioSegundos !== undefined ? (
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
    );
  }

  return (
    <section aria-labelledby="tiempo-titulo" className="flex flex-col gap-4">
      <div>
        <h2 id="tiempo-titulo" className="font-display text-2xl font-semibold">
          Tiempo promedio por sesión
        </h2>
        <p className="text-tinta-2 mt-1">
          Solo cuentan las sesiones con al menos dos avisos de actividad.
        </p>
      </div>
      {contenido}
    </section>
  );
}
