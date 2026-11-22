import { useState } from 'react';
import { BotonTexto } from '@/components/BotonTexto';
import { ConfirmarAccion } from '@/components/ConfirmarAccion';
import { IconoAdvertencia } from '@/components/IconoAdvertencia';
import { ApiError, type Comentario } from '@/lib/api';
import { ROLES_PERFIL } from '../auth/roles';
import { useSession } from '../auth/sessionStore';
import { fechaLarga } from '../atlas/ficha/texto';
import { useAccionesComentario } from './api/hooks';
import { mensajeErrorComentario } from './errores';
import { FormularioComentario } from './FormularioComentario';
import { avisoDeResultado } from './avisos';

const NOMBRE_ROL = Object.fromEntries(ROLES_PERFIL.map((r) => [r.valor, r.nombre]));

interface ComentarioItemProps {
  comentario: Comentario;
  ejercicioId: number;
}

/** Un comentario o una respuesta. El texto se muestra siempre como texto, nunca como HTML. */
export function ComentarioItem({ comentario: c, ejercicioId }: ComentarioItemProps) {
  const acciones = useAccionesComentario(ejercicioId);
  const esAdmin = useSession((s) => s.usuario?.rolSistema === 'ADMIN');
  const [respondiendo, setRespondiendo] = useState(false);
  const [editando, setEditando] = useState(false);
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState<string>();
  const [aviso, setAviso] = useState<string>();
  const [confirmandoReporte, setConfirmandoReporte] = useState(false);
  const [errorReporte, setErrorReporte] = useState<string>();
  const [reportado, setReportado] = useState(false);

  const esRespuesta = c.padreId !== null;
  const puedeResponder = !c.eliminado && !c.enRevision;
  const puedeReportar = !c.propio && !c.eliminado && !reportado;
  // HU-28: el admin elimina cualquier comentario; el ajeno va por la ruta de moderación.
  const puedeEliminar = c.propio || (esAdmin && !c.eliminado);
  const deQuien = c.propio ? 'tu comentario' : `comentario de ${c.autor?.nombre ?? ''}`;

  async function responder(texto: string) {
    const creada = await acciones.responder.mutateAsync({ id: c.id, texto });
    setRespondiendo(false);
    setAviso(avisoDeResultado(creada, 'Respuesta publicada.'));
  }

  async function editar(texto: string) {
    const editado = await acciones.editar.mutateAsync({ id: c.id, texto });
    setEditando(false);
    setAviso(avisoDeResultado(editado, 'Comentario actualizado.'));
  }

  async function eliminar() {
    setErrorBorrado(undefined);
    try {
      await acciones.eliminar.mutateAsync({ id: c.id, comoAdmin: !c.propio });
      setConfirmandoBorrado(false);
    } catch (fallo) {
      setErrorBorrado(mensajeErrorComentario(fallo));
    }
  }

  async function reportar() {
    setErrorReporte(undefined);
    try {
      await acciones.reportar.mutateAsync(c.id);
      setAviso('Gracias. Seguirá visible mientras un administrador lo revisa.');
    } catch (fallo) {
      // Ya reportado acaba igual que un reporte nuevo: se cierra y se explica.
      if (!(fallo instanceof ApiError && fallo.code === 'YA_REPORTADO')) {
        setErrorReporte(mensajeErrorComentario(fallo));
        return;
      }
      setAviso(mensajeErrorComentario(fallo));
    }
    setConfirmandoReporte(false);
    setReportado(true);
  }

  return (
    <article
      id={`comentario-${c.id}`}
      aria-label={
        c.eliminado
          ? 'Comentario eliminado'
          : `${esRespuesta ? 'Respuesta' : 'Comentario'} de ${c.autor?.nombre ?? ''}${c.enRevision ? ', esperando revisión' : ''}`
      }
      className={`flex flex-col gap-2 ${c.enRevision ? 'bg-fondo-2 text-tinta-2 px-4 py-3' : ''}`}
    >
      {c.eliminado || !c.autor ? (
        <p className="text-tinta-2 italic">Comentario eliminado</p>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-lg font-semibold">{c.autor.nombre}</span>
              <span className="text-tinta-2">
                {NOMBRE_ROL[c.autor.rolPerfil] ?? c.autor.rolPerfil} ·{' '}
                {fechaLarga(c.createdAt)}
                {c.editadoAt ? ' · editado' : ''}
              </span>
            </p>
            {c.enRevision ? (
              <p className="flex shrink-0 items-center gap-2 font-semibold">
                <span>Esperando revisión</span>
                <IconoAdvertencia />
              </p>
            ) : null}
          </div>
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

      {!editando && (puedeResponder || puedeReportar || puedeEliminar) ? (
        <div className="flex flex-wrap gap-x-4">
          {puedeResponder ? (
            <BotonTexto soloEnLinea onClick={() => setRespondiendo(true)}>
              Responder <span className="sr-only">a {c.autor?.nombre}</span>
            </BotonTexto>
          ) : null}
          {puedeReportar ? (
            <BotonTexto soloEnLinea onClick={() => setConfirmandoReporte(true)}>
              Reportar <span className="sr-only">a {c.autor?.nombre}</span>
            </BotonTexto>
          ) : null}
          {c.propio ? (
            <BotonTexto
              soloEnLinea
              onClick={() => {
                setAviso(undefined);
                setEditando(true);
              }}
            >
              Editar <span className="sr-only">tu comentario</span>
            </BotonTexto>
          ) : null}
          {puedeEliminar ? (
            <BotonTexto soloEnLinea onClick={() => setConfirmandoBorrado(true)}>
              Eliminar <span className="sr-only">{deQuien}</span>
            </BotonTexto>
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
          titulo={`¿Eliminar ${c.propio ? 'tu comentario' : 'este comentario'}?`}
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

      {confirmandoReporte ? (
        <ConfirmarAccion
          titulo="¿Reportar este comentario?"
          confirmar="Reportar comentario"
          error={errorReporte}
          cargando={acciones.reportar.isPending}
          onConfirmar={() => void reportar()}
          onCancelar={() => setConfirmandoReporte(false)}
        >
          <p>
            Una persona administradora lo revisará. Mientras tanto seguirá visible para
            todas las personas.
          </p>
        </ConfirmarAccion>
      ) : null}
    </article>
  );
}
