import { Notice } from '@/components/Notice';
import { TextField } from '@/components/TextField';
import type { Rango } from '@/lib/api';
import type { Periodo } from './rangos';

const OPCIONES: { id: Periodo; texto: string }[] = [
  // Distintos de «Agrupar por: Día/Semana/Mes» del gráfico: aquí se elige el rango.
  { id: 'DIA', texto: 'Hoy' },
  { id: 'SEMANA', texto: 'Esta semana' },
  { id: 'MES', texto: 'Este mes' },
  { id: 'FECHAS', texto: 'Fechas' },
];

interface SelectorRangoProps {
  periodo: Periodo;
  onPeriodo: (periodo: Periodo) => void;
  fechas: Rango;
  onFechas: (fechas: Rango) => void;
  /** Por qué el rango no se puede consultar; se anuncia a lectores de pantalla. */
  error: string | null;
}

/** Periodo del panel (día, semana, mes o fechas libres). Lo comparten todos los paneles. */
export function SelectorRango({
  periodo,
  onPeriodo,
  fechas,
  onFechas,
  error,
}: SelectorRangoProps) {
  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label="Periodo" className="flex flex-wrap gap-x-6 gap-y-2">
        {OPCIONES.map((op) => {
          const activa = periodo === op.id;
          return (
            <button
              key={op.id}
              type="button"
              aria-pressed={activa}
              onClick={() => onPeriodo(op.id)}
              className={`font-display cursor-pointer text-xl font-semibold underline decoration-4 underline-offset-8 transition-colors duration-150 ${
                activa
                  ? 'text-tinta decoration-acento'
                  : 'text-tinta-2 hover:text-tinta decoration-transparent'
              }`}
            >
              {op.texto}
            </button>
          );
        })}
      </div>
      {periodo === 'FECHAS' ? (
        <div className="grid max-w-xl gap-4 sm:grid-cols-2">
          <TextField
            label="Desde"
            type="date"
            value={fechas.desde}
            onChange={(e) => onFechas({ ...fechas, desde: e.target.value })}
          />
          <TextField
            label="Hasta"
            type="date"
            value={fechas.hasta}
            onChange={(e) => onFechas({ ...fechas, hasta: e.target.value })}
          />
        </div>
      ) : null}
      {error ? <Notice tipo="error">{error}</Notice> : null}
    </div>
  );
}
