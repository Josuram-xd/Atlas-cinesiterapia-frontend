import { useState } from 'react';
import type { Comentario } from '@/lib/api';
import { ROLES_PERFIL } from '../auth/roles';
import { fechaLarga } from '../atlas/ficha/texto';
import { useAccionesComentario } from './api/hooks';
import { FormularioComentario } from './FormularioComentario';

const NOMBRE_ROL = Object.fromEntries(ROLES_PERFIL.map((r) => [r.valor, r.nombre]));

const ACCION =
  'text-acento hover:text-tinta min-h-11 cursor-pointer px-1 font-semibold underline underline-offset-4';

interface ComentarioItemProps {
  comentario: Comentario;
  ejercicioId: number;
}

/** Un comentario o una respuesta. El texto se muestra siempre como texto, nunca como HTML. */
export function ComentarioItem({ comentario: c, ejercicioId }: ComentarioItemProps) {
  const acciones = useAccionesComentario(ejercicioId);
  const [respondiendo, setRespondiendo] = useState(false);
  const [aviso, setAviso] = useState<string>();

  const esRespuesta = c.padreId !== null;
  const puedeResponder = !c.eliminado && !c.enRevision;

  async function responder(texto: string) {
    await acciones.responder.mutateAsync({ id: c.id, texto });
    setRespondiendo(false);
    setAviso('Respuesta publicada.');
  }

  return (
    <article
      id={`comentario-${c.id}`}
      aria-label={
        c.eliminado
          ? 'Comentario eliminado'
          : `${esRespuesta ? 'Respuesta' : 'Comentario'} de ${c.autor?.nombre ?? ''}`
      }
      className="flex flex-col gap-2"
    >
      {c.eliminado || !c.autor ? (
        <p className="text-tinta-2 italic">Comentario eliminado</p>
      ) : (
        <>
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-display text-lg font-semibold">{c.autor.nombre}</span>
            <span className="text-tinta-2">
              {NOMBRE_ROL[c.autor.rolPerfil] ?? c.autor.rolPerfil} ·{' '}
              {fechaLarga(c.createdAt)}
              {c.editadoAt ? ' · editado' : ''}
            </span>
          </p>
          <p className="max-w-[68ch] break-words whitespace-pre-wrap">{c.texto}</p>
        </>
      )}

      {puedeResponder ? (
        <div className="flex flex-wrap gap-x-4">
          <button type="button" className={ACCION} onClick={() => setRespondiendo(true)}>
            Responder
            <span className="sr-only"> a {c.autor?.nombre}</span>
          </button>
        </div>
      ) : null}

      {aviso ? (
        <p role="status" className="text-tinta-2">
          {aviso}
        </p>
      ) : null}

      {respondiendo ? (
        <div className="max-w-[68ch]">
          <FormularioComentario
            etiqueta={`Tu respuesta a ${c.autor?.nombre ?? ''}`}
            textoBoton="Publicar respuesta"
            inicial={esRespuesta && c.autor ? `@${c.autor.nombre} ` : ''}
            autoFocus
            onEnviar={responder}
            onCancelar={() => setRespondiendo(false)}
          />
        </div>
      ) : null}
    </article>
  );
}
