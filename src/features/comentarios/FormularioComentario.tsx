import { useState, type FormEvent } from 'react';
import { TextAreaField } from '@/components/Campos';
import { Button } from '@/components/Button';
import { mensajeErrorComentario } from './errores';

export const MAX_CARACTERES = 1000;

interface FormularioComentarioProps {
  etiqueta: string;
  textoBoton: string;
  inicial?: string;
  autoFocus?: boolean;
  /** Debe rechazar si el envío falla: el mensaje se muestra bajo el campo. */
  onEnviar: (texto: string) => Promise<void>;
  onCancelar?: () => void;
}

/** Área de texto con contador para comentar, responder o editar. El texto viaja tal cual, sin HTML. */
export function FormularioComentario({
  etiqueta,
  textoBoton,
  inicial = '',
  autoFocus = false,
  onEnviar,
  onCancelar,
}: FormularioComentarioProps) {
  const [texto, setTexto] = useState(inicial);
  const [error, setError] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  const limpio = texto.trim();
  const restantes = MAX_CARACTERES - texto.length;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (enviando) return;
    if (limpio.length === 0) {
      setError('Escribe algo antes de enviar.');
      return;
    }
    if (texto.length > MAX_CARACTERES) {
      setError(`El comentario no puede superar ${MAX_CARACTERES} caracteres.`);
      return;
    }
    setError(undefined);
    setEnviando(true);
    try {
      await onEnviar(limpio);
      setTexto('');
    } catch (fallo) {
      setError(mensajeErrorComentario(fallo));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={(e) => void enviar(e)} noValidate className="flex flex-col gap-3">
      <TextAreaField
        label={etiqueta}
        value={texto}
        rows={3}
        autoFocus={autoFocus}
        onChange={(e) => {
          setTexto(e.target.value);
          if (error) setError(undefined);
        }}
        error={error}
        ayuda={
          restantes >= 0
            ? `Texto simple, hasta ${MAX_CARACTERES} caracteres. Quedan ${restantes}.`
            : `Te pasaste por ${-restantes} caracteres.`
        }
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" cargando={enviando}>
          {textoBoton}
        </Button>
        {onCancelar ? (
          <Button variante="secundario" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
