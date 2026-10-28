/**
 * Métricas de uso (HU-30 a HU-34). La ruta ya exige rol ADMIN; aquí solo se muestran totales.
 */
export function MetricasPage() {
  return (
    <section className="flex flex-col gap-8 pt-4 pb-16">
      <header>
        <h1 className="font-display text-titulo">Métricas de uso</h1>
        <p className="text-tinta-2 mt-1">
          Totales de visitas, ejercicios consultados, usuarios activos y tiempo de uso. No
          se muestran datos de personas concretas.
        </p>
      </header>
    </section>
  );
}
