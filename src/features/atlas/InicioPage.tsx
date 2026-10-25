import { useState } from 'react';
import { Button } from '@/components/Button';
import type { Region } from '@/lib/api';
import { BodyAtlas } from './body/BodyAtlas';
import type { VistaId } from './body/geometry';
import { VistaToggle } from './body/VistaToggle';
import { REGIONES_MOCK } from './data/regiones';

export function InicioPage() {
  const [vista, setVista] = useState<VistaId>('anterior');
  const [elegida, setElegida] = useState<Region | null>(null);
  const [apuntada, setApuntada] = useState<Region | null>(null);
  const nombre = (apuntada ?? elegida)?.nombre ?? 'Ninguna todavía';

  function cambiarVista(nueva: VistaId) {
    setVista(nueva);
    setElegida(null);
    setApuntada(null);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:grid md:grid-cols-[1fr_minmax(0,30rem)] md:items-center md:gap-8">
      <div className="flex flex-col gap-3 md:gap-8">
        <h1 className="font-display text-titulo md:text-gigante md:max-w-[12ch]">
          Elige una región del cuerpo
        </h1>
        <VistaToggle vista={vista} onChange={cambiarVista} />
        <div className="flex min-h-12 items-center justify-between gap-3 md:min-h-0 md:flex-col md:items-start md:gap-8">
          <p className="font-display text-xl md:text-titulo" aria-live="polite">
            <span className="text-tinta-2 font-light">Región: </span>
            {nombre}
          </p>
          {elegida ? (
            <Button
              variante="secundario"
              onClick={() => setElegida(null)}
              className="min-h-10 px-4 py-1.5 md:min-h-12 md:px-6 md:py-2.5"
            >
              Volver al cuerpo completo
            </Button>
          ) : null}
        </div>
      </div>
      <div className="relative min-h-[26rem] flex-1 md:h-[calc(100dvh-8rem)] md:flex-none">
        <BodyAtlas
          vista={vista}
          regiones={REGIONES_MOCK}
          seleccionada={elegida?.svgId}
          onSelect={setElegida}
          onClear={() => setElegida(null)}
          onHover={setApuntada}
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
