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
      <div
        role="group"
        aria-label="Periodo"
        className="bg-fondo-2 flex w-fit max-w-full flex-wrap gap-1 rounded-[1.6rem] p-1"
      >
        {OPCIONES.map((op) => {
          return (
            <button
              key={op.id}
              type="button"
              aria-pressed={periodo === op.id}
              onClick={() => onPeriodo(op.id)}
              className="chip font-display cursor-pointer px-5 text-lg"
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
