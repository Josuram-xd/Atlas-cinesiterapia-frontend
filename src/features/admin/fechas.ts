const CORTA = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "20 oct 2026"; cadena vacía si la fecha no se entiende. */
export function fechaCorta(iso: string): string {
  const f = new Date(iso);
  return Number.isNaN(f.getTime()) ? '' : CORTA.format(f);
}
