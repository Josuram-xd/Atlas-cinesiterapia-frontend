import { useRef, useState } from 'react';
import type { Categoria, Region } from '@/lib/api';
import { useCategorias, useRegiones } from './api/hooks';
import { BodyAtlas } from './body/BodyAtlas';
import type { VistaId } from './body/geometry';
import { VistaToggle } from './body/VistaToggle';
import { CategoriaMenu } from './menu/CategoriaMenu';

const SIN_REGIONES: Region[] = [];

export function InicioPage() {
  const [vista, setVista] = useState<VistaId>('anterior');
  const [elegida, setElegida] = useState<Region | null>(null);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [apuntada, setApuntada] = useState<Region | null>(null);
  const ventana = useRef<HTMLDivElement>(null);

  const regiones = useRegiones();
  const categorias = useCategorias(elegida?.id ?? null);
  const nombre = (apuntada ?? elegida)?.nombre ?? 'Ninguna todavía';

  function elegirRegion(region: Region | null) {
    setElegida(region);
    setCategoria(null);
  }

  function cambiarVista(nueva: VistaId) {
    setVista(nueva);
    elegirRegion(null);
    setApuntada(null);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:grid md:grid-cols-[minmax(0,26rem)_1fr] md:items-center md:gap-8">
      <div className="flex flex-col gap-3 md:gap-8">
        <h1 className="font-display text-titulo">Elige una región del cuerpo</h1>
        <VistaToggle vista={vista} onChange={cambiarVista} />
        <p
          className="font-display min-h-12 text-xl md:min-h-0 md:text-titulo"
          aria-live="polite"
        >
          <span className="text-tinta-2 font-light">Región: </span>
          {nombre}
        </p>
      </div>
      <div className="relative min-h-[28rem] flex-1 md:h-[calc(100dvh-8rem)] md:flex-none">
        <BodyAtlas
          vista={vista}
          regiones={regiones.data ?? SIN_REGIONES}
          seleccionada={elegida?.svgId}
          onSelect={elegirRegion}
          onClear={() => elegirRegion(null)}
          onHover={setApuntada}
          ventana={ventana}
          className="absolute inset-0 h-full w-full"
        />
        {elegida ? (
          <CategoriaMenu
            region={elegida.nombre}
            categorias={categorias.data ?? []}
            activaId={categoria?.id ?? null}
            onElegir={setCategoria}
            onVolver={() => elegirRegion(null)}
            ventana={ventana}
          />
        ) : null}
      </div>
    </div>
  );
}
