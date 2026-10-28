import { useState } from 'react';
import { BotonTexto } from '@/components/BotonTexto';
import { Button } from '@/components/Button';
import { ConfirmarAccion } from '@/components/ConfirmarAccion';
import { Notice } from '@/components/Notice';
import type { ComentarioRevision } from '@/lib/api';
import { ROLES_PERFIL } from '../auth/roles';
import { fechaLarga } from '../atlas/ficha/texto';
import { mensajeErrorComentario } from '../comentarios/errores';
import { useAccionesCola } from './api/hooks';

const NOMBRE_ROL = Object.fromEntries(ROLES_PERFIL.map((r) => [r.valor, r.nombre]));

interface ComentarioRevisionItemProps {
  comentario: ComentarioRevision;
  /** Avisa a la página del resultado; la cola se vuelve a pedir sola. */
  onHecho: (aviso: string) => void;
}

/** Un comentario de la cola: por qué está ahí, su texto y las acciones de moderación. */
export function ComentarioRevisionItem({
  comentario: c,
  onHecho,
}: ComentarioRevisionItemProps) {
  const acciones = useAccionesCola();
  const [confirmando, setConfirmando] = useState(false);
  const [errorAceptar, setErrorAceptar] = useState<string>();
  const [errorEliminar, setErrorEliminar] = useState<string>();

  async function aceptar() {
    setErrorAceptar(undefined);
    try {
      await acciones.aceptar.mutateAsync(c.id);
      onHecho(`Comentario de ${c.autor.correo} publicado.`);
    } catch (fallo) {
      setErrorAceptar(mensajeErrorComentario(fallo));
    }
  }

  async function eliminar() {
    setErrorEliminar(undefined);
    try {
      await acciones.eliminar.mutateAsync(c.id);
      setConfirmando(false);
      onHecho('Comentario eliminado.');
    } catch (fallo) {
      setErrorEliminar(mensajeErrorComentario(fallo));
    }
  }

  return (
    <article
      aria-label={`Comentario de ${c.autor.correo}`}
      className="bg-fondo-2 flex flex-col gap-3 px-5 py-4"
    >
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-display text-lg font-semibold break-all">
          {c.autor.correo}
        </span>
        <span className="text-tinta-2">
          {NOMBRE_ROL[c.autor.rolPerfil] ?? c.autor.rolPerfil} · {fechaLarga(c.createdAt)}
        </span>
      </p>
      <p className="text-tinta-2">Ficha: {c.ejercicio.nombre ?? 'eliminada'}</p>
      <p className="flex flex-wrap gap-x-4 font-semibold">
        {c.ocultadoAutomaticamente ? (
          <span>Ocultado por el filtro automático</span>
        ) : null}
        {c.totalReportes > 0 ? (
          <span>
            Reportado por {c.totalReportes}{' '}
            {c.totalReportes === 1 ? 'persona' : 'personas'}
          </span>
        ) : null}
      </p>
      <p className="max-w-[68ch] break-words whitespace-pre-wrap">{c.texto}</p>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variante="secundario"
          cargando={acciones.aceptar.isPending}
          onClick={() => void aceptar()}
        >
          Aceptar <span className="sr-only">comentario de {c.autor.correo}</span>
        </Button>
        <BotonTexto onClick={() => setConfirmando(true)}>
          Eliminar <span className="sr-only">comentario de {c.autor.correo}</span>
        </BotonTexto>
      </div>
      {errorAceptar ? <Notice tipo="error">{errorAceptar}</Notice> : null}

      {confirmando ? (
        <ConfirmarAccion
          titulo="¿Eliminar este comentario?"
          confirmar="Eliminar comentario"
          error={errorEliminar}
          cargando={acciones.eliminar.isPending}
          onConfirmar={() => void eliminar()}
          onCancelar={() => setConfirmando(false)}
        >
          <p>
            El texto se borrará para todas las personas y se descartarán sus reportes. Si
            tiene respuestas, se mostrará como «Comentario eliminado».
          </p>
        </ConfirmarAccion>
      ) : null}
    </article>
  );
}
