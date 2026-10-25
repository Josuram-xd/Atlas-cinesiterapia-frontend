import { useState } from 'react';
import { ConfirmarAccion } from '@/components/ConfirmarAccion';
import type { Comentario } from '@/lib/api';
import { ROLES_PERFIL } from '../auth/roles';
import { fechaLarga } from '../atlas/ficha/texto';
import { useAccionesComentario } from './api/hooks';
import { mensajeErrorComentario } from './errores';
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
  const [editando, setEditando] = useState(false);
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState<string>();
  const [aviso, setAviso] = useState<string>();

  const esRespuesta = c.padreId !== null;
  const puedeResponder = !c.eliminado && !c.enRevision;

  async function responder(texto: string) {
    await acciones.responder.mutateAsync({ id: c.id, texto });
    setRespondiendo(false);
    setAviso('Respuesta publicada.');
  }

  async function editar(texto: string) {
    await acciones.editar.mutateAsync({ id: c.id, texto });
    setEditando(false);
    setAviso('Comentario actualizado.');
  }

  async function eliminar() {
    setErrorBorrado(undefined);
    try {
      await acciones.eliminar.mutateAsync(c.id);
      setConfirmandoBorrado(false);
    } catch (fallo) {
      setErrorBorrado(mensajeErrorComentario(fallo));
    }
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
          {editando ? (
            <div className="max-w-[68ch]">
              <FormularioComentario
                etiqueta="Editar tu comentario"
                textoBoton="Guardar cambios"
                inicial={c.texto ?? ''}
                autoFocus
                onEnviar={editar}
                onCancelar={() => setEditando(false)}
              />
            </div>
          ) : (
            <p className="max-w-[68ch] break-words whitespace-pre-wrap">{c.texto}</p>
          )}
        </>
      )}

      {!editando && (puedeResponder || c.propio) ? (
        <div className="flex flex-wrap gap-x-4">
          {puedeResponder ? (
            <button
              type="button"
              className={ACCION}
              onClick={() => setRespondiendo(true)}
            >
              Responder
              <span className="sr-only"> a {c.autor?.nombre}</span>
            </button>
          ) : null}
          {c.propio ? (
            <>
              <button
                type="button"
                className={ACCION}
                onClick={() => {
                  setAviso(undefined);
                  setEditando(true);
                }}
              >
                Editar
                <span className="sr-only"> tu comentario</span>
              </button>
              <button
                type="button"
                className={ACCION}
                onClick={() => setConfirmandoBorrado(true)}
              >
                Eliminar
                <span className="sr-only"> tu comentario</span>
              </button>
            </>
          ) : null}
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

      {confirmandoBorrado ? (
        <ConfirmarAccion
          titulo="¿Eliminar tu comentario?"
          confirmar="Eliminar comentario"
          error={errorBorrado}
          cargando={acciones.eliminar.isPending}
          onConfirmar={() => void eliminar()}
          onCancelar={() => setConfirmandoBorrado(false)}
        >
          <p>
            El texto se borrará para todas las personas. Si tiene respuestas, se mostrará
            como «Comentario eliminado». No se puede deshacer.
          </p>
        </ConfirmarAccion>
      ) : null}
    </article>
  );
}
