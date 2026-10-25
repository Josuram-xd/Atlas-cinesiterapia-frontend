import { useState } from 'react';
import { Button } from '@/components/Button';
import { EstadoError } from '../atlas/EstadoError';
import { Seccion } from '../atlas/ficha/Seccion';
import { mensajeDeErrorAtlas } from '../atlas/mensajes';
import { useAccionesComentario, useComentarios } from './api/hooks';
import { ComentarioItem } from './ComentarioItem';
import { FormularioComentario } from './FormularioComentario';

/** Comentarios de una ficha: formulario, hilos de un nivel y "Ver más". */
export function SeccionComentarios({ ejercicioId }: { ejercicioId: number }) {
  const comentarios = useComentarios(ejercicioId);
  const acciones = useAccionesComentario(ejercicioId);
  const [aviso, setAviso] = useState<string>();

  async function comentar(texto: string) {
    await acciones.crear.mutateAsync(texto);
    setAviso('Comentario publicado.');
  }

  const paginas = comentarios.data?.pages ?? [];
  const lista = paginas.flatMap((p) => p.content);
  const total = paginas[0]?.totalElements ?? 0;

  return (
    <Seccion id="comentarios" titulo="Comentarios">
      <div className="max-w-[68ch]">
        <FormularioComentario
          etiqueta="Escribe un comentario"
          textoBoton="Publicar comentario"
          onEnviar={comentar}
        />
        {aviso ? (
          <p role="status" className="text-tinta-2 mt-3">
            {aviso}
          </p>
        ) : null}
      </div>

      {comentarios.isPending ? (
        <div role="status" className="flex flex-col gap-2">
          <p className="text-tinta-2">Cargando comentarios…</p>
          <div aria-hidden className="bg-fondo-2 h-20 max-w-[68ch]" />
        </div>
      ) : null}

      {comentarios.isError ? (
        <EstadoError
          mensaje={mensajeDeErrorAtlas(comentarios.error)}
          onReintentar={() => void comentarios.refetch()}
        />
      ) : null}

      {comentarios.isSuccess && lista.length === 0 ? (
        <p className="bg-fondo-2 max-w-[68ch] px-4 py-5">
          Aún no hay comentarios. Sé la primera persona en comentar.
        </p>
      ) : null}

      {lista.length > 0 ? (
        <div>
          <p className="text-tinta-2 mb-3" aria-live="polite">
            {total} {total === 1 ? 'comentario' : 'comentarios'}
          </p>
          <ul className="flex flex-col gap-4">
            {lista.map((c) => (
              <li key={c.id} className="bg-fondo-2 flex flex-col gap-4 px-5 py-4">
                <ComentarioItem comentario={c} ejercicioId={ejercicioId} />
                {c.respuestas.length > 0 ? (
                  <ul
                    aria-label={`Respuestas a ${c.autor?.nombre ?? 'un comentario eliminado'}`}
                    className="flex flex-col gap-4 sm:ml-8"
                  >
                    {c.respuestas.map((r) => (
                      <li key={r.id} className="bg-fondo px-4 py-3">
                        <ComentarioItem comentario={r} ejercicioId={ejercicioId} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          {comentarios.hasNextPage ? (
            <Button
              variante="secundario"
              className="mt-6"
              cargando={comentarios.isFetchingNextPage}
              onClick={() => void comentarios.fetchNextPage()}
            >
              Ver más comentarios
            </Button>
          ) : null}
        </div>
      ) : null}
    </Seccion>
  );
}
