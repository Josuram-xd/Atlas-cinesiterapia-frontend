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
      <ul className={`grid gap-2 ${className}`}>
        {visibles.map((m, i) => (
          <li key={`${m.url}-${i}`}>
            <button
              type="button"
              onClick={(e) => {
                opener.current = e.currentTarget;
                setAbierta(i);
              }}
              className="bg-fondo-2 hover:bg-fondo-3 block w-full cursor-pointer text-left transition-colors duration-150"
            >
              <img
                src={m.url}
                alt={`${m.etiqueta} de ${nombre}`}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <span className="block px-3 py-2 font-semibold">{m.etiqueta}</span>
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
