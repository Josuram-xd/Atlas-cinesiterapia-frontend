import { useEffect, useRef, useState } from 'react';
import type { Categoria, Region } from '@/lib/api';
import { prefersReducedMotion } from '@/lib/motion';
import { esPantallaAncha } from '@/lib/viewport';
import { useAtlasApi } from './api/contexto';
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
  const lectura = useRef<HTMLParagraphElement>(null);

  // Una visita al atlas por apertura de la página (RF_032); el backend absorbe dobles disparos.
  const atlasApi = useAtlasApi();
  useEffect(() => {
    void atlasApi.registrarVisitaAtlas().catch(() => {});
  }, [atlasApi]);

  const regiones = useRegiones();
  const categorias = useCategorias(elegida?.id ?? null);
  const ejercicios = useEjercicios(elegida?.id ?? null, categoria?.id ?? null);
  const nombre = (apuntada ?? elegida)?.nombre ?? 'Ninguna todavía';

  // El nombre de la región entra con un pequeño ascenso cada vez que cambia.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    lectura.current?.animate?.(
      [
        { opacity: 0.2, transform: 'translateY(6px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  }, [nombre]);

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
    <>
      <div className="flex flex-1 flex-col gap-4 lg:grid lg:h-[calc(100dvh-8rem)] lg:flex-none lg:grid-cols-[minmax(0,26rem)_1fr] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-8 lg:gap-y-6">
        <div className="revelar flex flex-col gap-4 lg:gap-7 lg:pt-4">
          <h1 className="font-display text-titulo max-w-[12ch]">
            Elige una región del cuerpo
          </h1>
          <VistaToggle vista={vista} onChange={cambiarVista} />
          <p
            ref={lectura}
            className={`font-display flex min-h-9 flex-wrap items-baseline gap-x-2 text-[1.75rem] leading-tight tracking-[-0.025em] lg:min-h-0 lg:flex-col lg:text-[2.5rem] ${
              (apuntada ?? elegida)
                ? 'text-tinta font-semibold'
                : 'text-tinta-2 font-light'
            }`}
            aria-live="polite"
          >
            <span className="text-tinta-2 text-base font-medium tracking-normal">
              Región:{' '}
            </span>
            {nombre}
          </p>
          <p className="text-tinta-2 max-w-[34ch] text-base max-lg:hidden">
            Pasa el cursor por el cuerpo y elige una región. Con teclado: Tab recorre,
            Enter elige y Escape vuelve al cuerpo completo.
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
        <div className="escenario rounded-escenario entrada relative min-h-[30rem] flex-1 overflow-hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:min-h-0">
          <BodyAtlas
            vista={vista}
            regiones={regiones.data ?? SIN_REGIONES}
            seleccionada={elegida?.svgId}
            onSelect={elegirRegion}
            onClear={() => elegirRegion(null)}
            onHover={setApuntada}
            ventana={ventana}
            className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
              regiones.isPending ? 'opacity-30' : ''
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
          <div className="pb-6 lg:col-start-1 lg:row-start-2">
            <EstadoError
              mensaje={`No pudimos cargar las categorías. ${mensajeDeErrorAtlas(categorias.error)}`}
              onReintentar={() => void categorias.refetch()}
            />
          </div>
        ) : null}
        {elegida && categoria ? (
          <div className="pb-6 lg:col-start-1 lg:row-start-2 lg:overflow-y-auto lg:pr-2">
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
      <Creditos />
    </>
  );
}

const CONTENIDO_TEMATICO = [
  'Yaneth Amanda Cajigas Cabrera',
  'Claudia Ximena Chaves Paz',
  'Beatriz Eugenia Ramirez',
];

function Creditos() {
  return (
    <footer
      aria-label="Créditos"
      className="border-tinta/10 text-tinta-2 mt-6 grid gap-6 border-t pt-6 pb-2 text-sm sm:grid-cols-[auto_auto] sm:justify-start sm:gap-x-16"
    >
      <dl>
        <dt className="text-tinta mb-1 font-semibold">Contenido temático</dt>
        {CONTENIDO_TEMATICO.map((nombre) => (
          <dd key={nombre}>{nombre}</dd>
        ))}
      </dl>
      <dl>
        <dt className="text-tinta mb-1 font-semibold">Desarrollador multimedia</dt>
        <dd>Joseph Herrera Cajigas</dd>
      </dl>
    </footer>
  );
}
