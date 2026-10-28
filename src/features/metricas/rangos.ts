import type { Agrupacion, Rango } from '@/lib/api';

/** Lo que el selector de la página ofrece: día, semana o mes en curso, o fechas libres. */
export type Periodo = 'DIA' | 'SEMANA' | 'MES' | 'FECHAS';

const DIA_MS = 86_400_000;
/** Máximo de días por consulta (docs/API.md, sección 9). */
const MAX_DIAS = 366;

/** Día UTC actual en `AAAA-MM-DD`, como lo espera la API. */
export function hoyUtc(ahora: Date = new Date()): string {
  return ahora.toISOString().slice(0, 10);
}

function sumarDias(dia: string, dias: number): string {
  return new Date(Date.parse(dia) + dias * DIA_MS).toISOString().slice(0, 10);
}

/** Día con el que empieza su cubo: el mismo día, el lunes de su semana o el día 1 de su mes. */
export function inicioCubo(dia: string, agrupacion: Agrupacion): string {
  if (agrupacion === 'MES') return `${dia.slice(0, 8)}01`;
  if (agrupacion === 'SEMANA') {
    const lunesOffset = (new Date(Date.parse(dia)).getUTCDay() + 6) % 7;
    return sumarDias(dia, -lunesOffset);
  }
  return dia;
}

/** Rango desde el inicio del periodo hasta hoy (día, semana desde el lunes, mes en curso). */
export function rangoDePeriodo(periodo: Exclude<Periodo, 'FECHAS'>, hoy: string): Rango {
  return { desde: inicioCubo(hoy, periodo), hasta: hoy };
}

/** Motivo por el que la API rechazaría el rango (RANGO_INVALIDO), o `null` si sirve. */
export function validarRango({ desde, hasta }: Rango): string | null {
  const inicio = Date.parse(desde);
  const fin = Date.parse(hasta);
  if (Number.isNaN(inicio) || Number.isNaN(fin))
    return 'Indica la fecha inicial y la final.';
  if (inicio > fin) return 'La fecha inicial no puede ser posterior a la final.';
  if ((fin - inicio) / DIA_MS + 1 > MAX_DIAS) {
    return `El rango máximo es de ${MAX_DIAS} días.`;
  }
  return null;
}
