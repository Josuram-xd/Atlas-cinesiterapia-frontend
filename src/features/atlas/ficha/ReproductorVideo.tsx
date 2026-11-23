import { useState } from 'react';
import type { Media } from '@/lib/api';
import { urlSegura } from '@/lib/urlSegura';

/**
 * Video de la ficha con el reproductor nativo del navegador (controles y teclado incluidos).
 * No arranca solo. Un GIF (permitido como "video" por el backend) se muestra como imagen.
 */
export function ReproductorVideo({ nombre, video }: { nombre: string; video: Media }) {
  const [fallo, setFallo] = useState(false);
  const url = urlSegura(video.url);
  if (!url) return null;

  if (video.contentType === 'image/gif') {
    return (
      <img
        src={url}
        alt={`Video de ${nombre} (animación)`}
        className="bg-fondo-2 aspect-video w-full object-contain"
      />
    );
  }

  return (
    <div className="bg-tinta aspect-video w-full">
      {fallo ? (
        <p
          role="status"
          className="text-fondo grid h-full place-items-center p-6 text-center"
        >
          No se pudo cargar el video. Recarga la página para intentarlo de nuevo.
        </p>
      ) : (
        <video
          src={url}
          controls
          playsInline
          preload="metadata"
          aria-label={`Video de ${nombre}`}
          onError={() => setFallo(true)}
          className="h-full w-full"
        />
      )}
    </div>
  );
}
