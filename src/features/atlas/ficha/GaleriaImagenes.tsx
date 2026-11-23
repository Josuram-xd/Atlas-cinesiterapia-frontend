import { useRef, useState } from 'react';
import type { Media } from '@/lib/api';
import { urlSegura } from '@/lib/urlSegura';
import { etiquetaImagen } from './rolMedia';
import { VisorImagenes, type ImagenVisor } from './VisorImagenes';

/** Miniaturas de las imágenes de la ficha; cada una abre el visor ampliado. */
export function GaleriaImagenes({
  nombre,
  imagenes,
  className = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-2',
}: {
  nombre: string;
  imagenes: Media[];
  /** Columnas de la rejilla de miniaturas. */
  className?: string;
}) {
  const [abierta, setAbierta] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const visibles: ImagenVisor[] = imagenes
    .map((m, i) => ({ url: urlSegura(m.url), etiqueta: etiquetaImagen(m, i + 1) }))
    .filter((m): m is ImagenVisor => m.url !== null);
  if (visibles.length === 0) return null;

  return (
    <>
      <ul className={`revelar grid gap-3 ${className}`}>
        {visibles.map((m, i) => (
          <li key={`${m.url}-${i}`}>
            <button
              type="button"
              onClick={(e) => {
                opener.current = e.currentTarget;
                setAbierta(i);
              }}
              className="group superficie hover:bg-fondo-3 ease-atlas block w-full cursor-pointer overflow-hidden text-left transition-[background-color,transform] duration-300 active:scale-[0.98]"
            >
              <img
                src={m.url}
                alt={`${m.etiqueta} de ${nombre}`}
                loading="lazy"
                className="ease-atlas aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <span className="block px-4 py-2.5 font-semibold">{m.etiqueta}</span>
            </button>
          </li>
        ))}
      </ul>
      {abierta !== null ? (
        <VisorImagenes
          nombre={nombre}
          imagenes={visibles}
          inicial={abierta}
          onCerrar={() => {
            setAbierta(null);
            opener.current?.focus();
          }}
        />
      ) : null}
    </>
  );
}
