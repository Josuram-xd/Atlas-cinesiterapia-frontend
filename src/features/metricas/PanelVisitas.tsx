import { useState } from 'react';
import { SelectField } from '@/components/Campos';
import type { Agrupacion, Rango } from '@/lib/api';
import { GraficoVisitas } from './GraficoVisitas';
import { PanelMetrica } from './PanelMetrica';

const ETIQUETA: Record<Agrupacion, string> = { DIA: 'Día', SEMANA: 'Semana', MES: 'Mes' };

/** Gráfico de visitas por periodo (HU-31). El rango lo elige la página; la agrupación, aquí. */
export function PanelVisitas({ rango }: { rango: Rango | null }) {
  const [agrupacion, setAgrupacion] = useState<Agrupacion>('DIA');
  return (
    <PanelMetrica
      id="visitas"
      titulo="Visitas por periodo"
      que="el gráfico"
      rango={rango}
      clave={[agrupacion]}
      pedir={(api, r, signal) => api.visitasPorPeriodo(r, agrupacion, signal)}
      vacio={(d) => (d.total === 0 ? 'No hay visitas en este periodo.' : null)}
      extra={
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
      }
    >
      {(datos) => <GraficoVisitas datos={datos} />}
    </PanelMetrica>
  );
}
