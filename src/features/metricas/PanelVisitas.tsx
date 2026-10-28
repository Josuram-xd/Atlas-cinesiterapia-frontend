import { useState } from 'react';
import { SelectField } from '@/components/Campos';
import { EstadoError } from '@/features/atlas/EstadoError';
import { mensajeDeErrorAtlas } from '@/features/atlas/mensajes';
import type { Agrupacion, Rango } from '@/lib/api';
import { useVisitasPeriodo } from './api/hooks';
import { GraficoVisitas } from './GraficoVisitas';

const ETIQUETA: Record<Agrupacion, string> = { DIA: 'Día', SEMANA: 'Semana', MES: 'Mes' };

/** Gráfico de visitas por periodo (HU-31). El rango lo elige la página; la agrupación, aquí. */
export function PanelVisitas({ rango }: { rango: Rango | null }) {
  const [agrupacion, setAgrupacion] = useState<Agrupacion>('DIA');
  const visitas = useVisitasPeriodo(rango, agrupacion);

  let contenido;
  if (!rango) {
    contenido = <p className="text-tinta-2">Corrige las fechas para ver el gráfico.</p>;
  } else if (visitas.isPending) {
    contenido = (
      <p role="status" className="text-tinta-2">
        Cargando visitas…
      </p>
    );
  } else if (visitas.isError) {
    contenido = (
      <EstadoError
        mensaje={mensajeDeErrorAtlas(visitas.error)}
        onReintentar={() => void visitas.refetch()}
      />
    );
  } else if (visitas.data.total === 0) {
    contenido = (
      <p role="status" className="bg-fondo-2 px-4 py-5">
        No hay visitas en este periodo.
      </p>
    );
  } else {
    contenido = <GraficoVisitas datos={visitas.data} />;
  }

  return (
    <section aria-labelledby="visitas-titulo" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="visitas-titulo" className="font-display text-2xl font-semibold">
          Visitas por periodo
        </h2>
        <SelectField
          label="Agrupar por"
          value={agrupacion}
          onChange={(e) => setAgrupacion(e.target.value as Agrupacion)}
          className="w-40"
        >
          {(Object.keys(ETIQUETA) as Agrupacion[]).map((a) => (
            <option key={a} value={a}>
              {ETIQUETA[a]}
            </option>
          ))}
        </SelectField>
      </div>
      {contenido}
    </section>
  );
}
