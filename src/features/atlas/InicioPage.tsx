import { useEffect, useRef, useState } from 'react';
import type { Categoria, Region } from '@/lib/api';
import { prefersReducedMotion } from '@/lib/motion';
import { esPantallaAncha } from '@/lib/viewport';
import { useCategorias, useEjercicios, useRegiones } from './api/hooks';
import { BodyAtlas } from './body/BodyAtlas';
import type { VistaId } from './body/geometry';
import { VistaToggle } from './body/VistaToggle';
import { EstadoError } from './EstadoError';
import { mensajeDeErrorAtlas } from './mensajes';
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
  const categoriaId = categoria?.id;
  useEffect(() => {
    if (categoriaId === undefined || esPantallaAncha()) return;
    panel.current?.scrollIntoView?.({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [categoriaId]);

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
        {regiones.isPending ? (
          <p role="status" className="text-tinta-2">
            Cargando regiones…
          </p>
        ) : null}
        {regiones.isError ? (
          <EstadoError
            mensaje={mensajeDeErrorAtlas(regiones.error)}
            onReintentar={() => void regiones.refetch()}
          />
        ) : null}
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
          className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
            regiones.isPending ? 'opacity-40' : ''
          }`}
        />
        {elegida ? (
          <CategoriaMenu
            region={elegida.nombre}
            categorias={categorias.data ?? []}
            estado={
              categorias.isError ? 'error' : categorias.isPending ? 'cargando' : 'listo'
            }
            activaId={categoria?.id ?? null}
            onElegir={setCategoria}
            onVolver={() => elegirRegion(null)}
            ventana={ventana}
          />
        ) : null}
      </div>
      {elegida && categorias.isError ? (
        <div className="pb-6 md:col-start-1 md:row-start-2">
          <EstadoError
            mensaje={`No pudimos cargar las categorías. ${mensajeDeErrorAtlas(categorias.error)}`}
            onReintentar={() => void categorias.refetch()}
          />
        </div>
      ) : null}
      {elegida && categoria ? (
        <div className="pb-6 md:col-start-1 md:row-start-2 md:overflow-y-auto md:pr-2">
          <EjerciciosPanel
            ref={panel}
            region={elegida.nombre}
            categoria={categoria.nombre}
            estado={
              ejercicios.isError ? 'error' : ejercicios.isPending ? 'cargando' : 'listo'
            }
            ejercicios={ejercicios.data}
            mensajeError={
              ejercicios.isError ? mensajeDeErrorAtlas(ejercicios.error) : undefined
            }
            onCerrar={() => setCategoria(null)}
            onReintentar={() => void ejercicios.refetch()}
          />
        </div>
      ) : null}
    </div>
  );
}
