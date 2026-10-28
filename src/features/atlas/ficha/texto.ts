/** Divide un texto libre en párrafos (líneas en blanco) sin tocar su contenido. */
export function aParrafos(texto: string | null | undefined): string[] {
  if (!texto) return [];
  return texto
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Fecha ISO-8601 a "20 de octubre de 2026"; si no se entiende, devuelve cadena vacía. */
export function fechaLarga(iso: string): string {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? '' : FORMATO_FECHA.format(fecha);
}

/** "2025-1" a "2025, periodo 1". Si no cumple el formato se devuelve tal cual. */
export function cohorteLegible(cohorte: string): string {
  const m = /^(\d{4})-(\d{1,2})$/.exec(cohorte);
  return m ? `${m[1]}, periodo ${m[2]}` : cohorte;
}
