import { useState } from 'react';
import type { Region } from '@/lib/api';
import { BodyAtlas } from './body/BodyAtlas';
import { REGIONES_MOCK } from './data/regiones';

export function InicioPage() {
  const [elegida, setElegida] = useState<Region | null>(null);
  const [apuntada, setApuntada] = useState<Region | null>(null);
  const nombre = (apuntada ?? elegida)?.nombre ?? 'Elige una región';

  return (
    <div className="grid flex-1 items-center gap-6 md:grid-cols-[1fr_minmax(0,28rem)]">
      <div>
        <h1 className="font-display text-gigante">Atlas de cinesiterapia</h1>
        <p className="font-display text-titulo mt-4" aria-live="polite">
          {nombre}
        </p>
      </div>
      <BodyAtlas
        vista="anterior"
        regiones={REGIONES_MOCK.filter((r) => r.vista === 'ANTERIOR')}
        seleccionada={elegida?.svgId}
        onSelect={setElegida}
        onHover={setApuntada}
        className="mx-auto max-h-[80dvh] w-full"
      />
    </div>
  );
}
