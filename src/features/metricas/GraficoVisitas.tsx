import { fechaCorta } from '@/features/admin/fechas';
import type { Agrupacion, VisitasPeriodo } from '@/lib/api';

const UNIDAD: Record<Agrupacion, string> = { DIA: 'día', SEMANA: 'semana', MES: 'mes' };
const ANCHO = 100;
const ALTO = 100;

/** Barra más ancha, en unidades del viewBox: con uno o pocos cubos no se vuelve una losa. */
const ANCHO_MAX_BARRA = 8;

/**
 * Barras de visitas dibujadas en SVG propio, con su escala (máximo y 0) y las fechas de los
 * extremos a la vista. Accesible: el SVG se anuncia con su total y máximo, y la tabla de
 * debajo tiene cada valor, para quien no ve el gráfico.
 */
export function GraficoVisitas({ datos }: { datos: VisitasPeriodo }) {
  const { serie, total, desde, hasta, agrupacion } = datos;
  const maximo = Math.max(1, ...serie.map((c) => c.visitas));
  const paso = ANCHO / serie.length;
  const ancho = Math.min(paso * 0.8, ANCHO_MAX_BARRA);
  const primero = fechaCorta(serie[0].inicio);
  const ultimo = fechaCorta(serie[serie.length - 1].inicio);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-tinta-2">
        {total} {total === 1 ? 'visita' : 'visitas'} · del {fechaCorta(desde)} al{' '}
        {fechaCorta(hasta)}
      </p>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1">
        {/* Escala y fechas: a la vista; el lector de pantalla ya las tiene en el aria-label. */}
        <div
          aria-hidden
          className="text-tinta-2 flex flex-col justify-between text-right tabular-nums"
        >
          <span>{maximo}</span>
          <span>0</span>
        </div>
        <svg
          role="img"
          aria-label={`Visitas por ${UNIDAD[agrupacion]}, ${total} en total, máximo ${maximo} por ${UNIDAD[agrupacion]}`}
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          preserveAspectRatio="none"
          className="h-56 w-full overflow-visible"
        >
          {serie.map((c, i) => {
            const alto = (c.visitas / maximo) * ALTO;
            return (
              <rect
                key={c.inicio}
                x={i * paso + (paso - ancho) / 2}
                y={ALTO - alto}
                width={ancho}
                height={alto}
                className="fill-acento"
              >
                <title>{`${fechaCorta(c.inicio)}: ${c.visitas}`}</title>
              </rect>
            );
          })}
          <line
            x1={0}
            x2={ANCHO}
            y1={ALTO}
            y2={ALTO}
            className="stroke-tinta"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <p aria-hidden className="text-tinta-2 col-start-2 flex justify-between gap-4">
          <span>{primero}</span>
          {serie.length > 1 ? <span>{ultimo}</span> : null}
        </p>
      </div>
      <details className="text-tinta-2">
        <summary className="text-acento cursor-pointer font-semibold underline underline-offset-4">
          Ver los datos en tabla
        </summary>
        <table className="mt-3 w-full text-left">
          <caption className="sr-only">Visitas por {UNIDAD[agrupacion]}</caption>
          <thead>
            <tr className="border-tinta border-b-2">
              <th scope="col" className="py-2 font-semibold">
                Inicio del periodo
              </th>
              <th scope="col" className="py-2 text-right font-semibold">
                Visitas
              </th>
            </tr>
          </thead>
          <tbody>
            {serie.map((c) => (
              <tr key={c.inicio} className="border-fondo-3 border-b">
                <th scope="row" className="py-2 font-normal">
                  {fechaCorta(c.inicio)}
                </th>
                <td className="py-2 text-right">{c.visitas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
