import { useState } from 'react';
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
    <div className="grid flex-1 items-center gap-8 md:grid-cols-[1fr_minmax(0,30rem)]">
      <div className="flex flex-col gap-8">
        <h1 className="font-display text-gigante max-w-[12ch]">
          Elige una región del cuerpo
        </h1>
        <VistaToggle vista={vista} onChange={cambiarVista} />
        <p className="font-display text-titulo" aria-live="polite">
          <span className="text-tinta-2 font-light">Región: </span>
          {nombre}
        </p>
      </div>
      <BodyAtlas
        vista={vista}
        regiones={REGIONES_MOCK}
        seleccionada={elegida?.svgId}
        onSelect={setElegida}
        onHover={setApuntada}
        className="mx-auto max-h-[78dvh] w-full"
      />
    </div>
  );
}
