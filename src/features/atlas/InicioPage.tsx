import { useEffect, useRef, useState } from 'react';
import type { Categoria, Region } from '@/lib/api';
import { prefersReducedMotion } from '@/lib/motion';
import { esPantallaAncha } from '@/lib/viewport';
import { useCategorias, useEjercicios, useRegiones } from './api/hooks';
import { BodyAtlas } from './body/BodyAtlas';
import type { VistaId } from './body/geometry';
import { VistaToggle } from './body/VistaToggle';
import { CategoriaMenu } from './menu/CategoriaMenu';
import { EjerciciosPanel } from './panel/EjerciciosPanel';

const SIN_REGIONES: Region[] = [];

export function InicioPage() {
  const [vista, setVista] = useState<VistaId>('anterior');
  const [elegida, setElegida] = useState<Region | null>(null);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [apuntada, setApuntada] = useState<Region | null>(null);
  const ventana = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);

  const regiones = useRegiones();
  const categorias = useCategorias(elegida?.id ?? null);
  const ejercicios = useEjercicios(elegida?.id ?? null, categoria?.id ?? null);
  const nombre = (apuntada ?? elegida)?.nombre ?? 'Ninguna todavía';

  // En móvil el listado queda debajo del cuerpo: al elegir una categoría se lleva a la vista.
  const hayListado = Boolean(categoria && ejercicios.data);
  useEffect(() => {
    if (!hayListado || esPantallaAncha()) return;
    panel.current?.scrollIntoView?.({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [hayListado, categoria?.id]);

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
    <div className="flex flex-1 flex-col gap-4 md:grid md:h-[calc(100dvh-8rem)] md:flex-none md:grid-cols-[minmax(0,26rem)_1fr] md:grid-rows-[auto_minmax(0,1fr)] md:gap-x-8 md:gap-y-6">
      <div className="flex flex-col gap-3 md:gap-6">
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
      <div className="relative min-h-[28rem] flex-1 md:col-start-2 md:row-span-2 md:row-start-1 md:min-h-0">
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
      {categoria && ejercicios.data && elegida ? (
        <div className="pb-6 md:col-start-1 md:row-start-2 md:overflow-y-auto md:pr-2">
          <EjerciciosPanel
            ref={panel}
            region={elegida.nombre}
            categoria={categoria.nombre}
            ejercicios={ejercicios.data}
            onCerrar={() => setCategoria(null)}
          />
        </div>
      ) : null}
    </div>
  );
}
