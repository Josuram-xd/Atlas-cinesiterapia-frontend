import { useState } from 'react';
import { PanelEjercicios } from './PanelEjercicios';
import { PanelTiempo } from './PanelTiempo';
import { PanelUsuarios } from './PanelUsuarios';
import { PanelVisitas } from './PanelVisitas';
import { SelectorRango } from './SelectorRango';
import { hoyUtc, rangoDePeriodo, validarRango, type Periodo } from './rangos';

/**
 * Métricas de uso (HU-30 a HU-34). La ruta ya exige rol ADMIN. El periodo elegido aquí
 * alimenta a todos los paneles; con fechas no válidas, ninguno consulta.
 */
export function MetricasPage() {
  const [hoy] = useState(() => hoyUtc());
  const [periodo, setPeriodo] = useState<Periodo>('MES');
  const [fechas, setFechas] = useState(() => rangoDePeriodo('MES', hoy));
  const rango = periodo === 'FECHAS' ? fechas : rangoDePeriodo(periodo, hoy);
  const error = validarRango(rango);
  const rangoValido = error ? null : rango;

  return (
    <section className="flex flex-col gap-10 pt-4 pb-16">
      <header>
        <h1 className="font-display text-titulo">Métricas de uso</h1>
        <p className="text-tinta-2 mt-1">
          Totales de visitas, ejercicios consultados, usuarios activos y tiempo de uso. No
          se muestran datos de personas concretas.
        </p>
      </header>
      <SelectorRango
        periodo={periodo}
        onPeriodo={setPeriodo}
        fechas={fechas}
        onFechas={setFechas}
        error={error}
      />
      <PanelVisitas rango={rangoValido} />
      <PanelEjercicios rango={rangoValido} />
      <PanelUsuarios rango={rangoValido} />
      <PanelTiempo rango={rangoValido} />
    </section>
  );
}
