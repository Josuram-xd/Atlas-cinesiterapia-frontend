import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Notice } from '@/components/Notice';
import { EstadoError } from '../atlas/EstadoError';
import { mensajeDeErrorAtlas } from '../atlas/mensajes';
import { useColaModeracion } from './api/hooks';
import { ComentarioRevisionItem } from './ComentarioRevisionItem';

/** Cola de moderación (solo ADMIN): comentarios ocultados por el filtro o reportados. */
export function ModeracionPage() {
  const cola = useColaModeracion();
  // Objeto: el mismo texto dos veces vuelve a mover el foco.
  const [aviso, setAviso] = useState<{ texto: string }>();
  const titulo = useRef<HTMLHeadingElement>(null);
  // La fila resuelta desaparece con su botón: el foco vuelve al título, no a <body>.
  useEffect(() => {
    if (aviso) titulo.current?.focus();
  }, [aviso]);

  const paginas = cola.data?.pages ?? [];
  const lista = paginas.flatMap((p) => p.content);
  const total = paginas[0]?.totalElements ?? 0;

  return (
    <section className="flex flex-col gap-8 pt-4 pb-16">
      <header>
        <h1 ref={titulo} tabIndex={-1} className="font-display text-titulo">
          Moderación de comentarios
        </h1>
        <p className="text-tinta-2 mt-1">
          Comentarios ocultados por el filtro automático o reportados por personas
          usuarias. Los más antiguos van primero.
        </p>
      </header>

      {aviso ? <Notice tipo="info">{aviso.texto}</Notice> : null}

      {cola.isPending ? (
        <p role="status" className="text-tinta-2">
          Cargando comentarios…
        </p>
      ) : null}

      {cola.isError ? (
        <EstadoError
          mensaje={mensajeDeErrorAtlas(cola.error)}
          onReintentar={() => void cola.refetch()}
        />
      ) : null}

      {cola.isSuccess && lista.length === 0 ? (
        <p role="status" className="superficie px-5 py-5">
          No hay comentarios pendientes de revisión.
        </p>
      ) : null}

      {lista.length > 0 ? (
        <div>
          <p className="text-tinta-2 mb-3" aria-live="polite">
            {total} {total === 1 ? 'comentario pendiente' : 'comentarios pendientes'}
          </p>
          <ul className="revelar flex flex-col gap-2">
            {lista.map((c) => (
              <li key={c.id}>
                <ComentarioRevisionItem
                  comentario={c}
                  onHecho={(texto) => setAviso({ texto })}
                />
              </li>
            ))}
          </ul>
          {cola.hasNextPage ? (
            <Button
              variante="secundario"
              className="mt-6"
              cargando={cola.isFetchingNextPage}
              onClick={() => void cola.fetchNextPage()}
            >
              Ver más comentarios
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
