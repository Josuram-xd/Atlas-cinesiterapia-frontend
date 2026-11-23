const VARIACION = new Intl.NumberFormat('es-CO', {
  signDisplay: 'exceptZero',
  maximumFractionDigits: 1,
});

/** "512" segundos → "8 min 32 s"; bajo el minuto, solo segundos. */
export function formatearDuracion(segundos: number): string {
  const total = Math.round(segundos);
  const min = Math.floor(total / 60);
  const seg = total % 60;
  if (min === 0) return `${seg} s`;
  return seg === 0 ? `${min} min` : `${min} min ${seg} s`;
}

/** "+12,5 %": signo y una decimal, como la devuelve la API. */
export function formatearVariacion(porcentaje: number): string {
  return `${VARIACION.format(porcentaje)} %`;
}
