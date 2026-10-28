import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { Notice } from '@/components/Notice';
import { TextField } from '@/components/TextField';
import { ApiError } from '@/lib/api';
import { authApi } from './api';
import { mensajeDeError } from './messages';
import { validarCorreo } from './validation';

export function RecuperarPage() {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState<string>();

  const recuperar = useMutation({ mutationFn: authApi.recuperar });

  // Mensaje genérico: nunca revela si el correo existe. Solo se tratan como fallo
  // los problemas de red, el límite de intentos y los errores del servidor.
  const confirmado =
    recuperar.isSuccess ||
    (recuperar.error instanceof ApiError &&
      recuperar.error.status >= 400 &&
      recuperar.error.status < 500 &&
      recuperar.error.status !== 429);

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const invalido = validarCorreo(correo);
    setError(invalido);
    if (invalido) return;
    recuperar.mutate({ correo: correo.trim() });
  }

  if (confirmado) {
    return (
      <AuthLayout
        titulo="Revisa tu correo"
        pie={
          <p>
            <Link to="/login">Volver a iniciar sesión</Link>
          </p>
        }
      >
        <Notice tipo="info">
          Si ese correo está registrado, te enviamos un enlace para crear una contraseña
          nueva. Puede tardar unos minutos.
        </Notice>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      titulo="Recupera tu contraseña"
      descripcion="Escribe tu correo y te enviamos un enlace para crear una contraseña nueva."
      pie={
        <p>
          ¿La recordaste? <Link to="/login">Inicia sesión</Link>
        </p>
      }
    >
      <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
        {recuperar.isError ? (
          <Notice tipo="error">{mensajeDeError(recuperar.error)}</Notice>
        ) : null}
        <TextField
          label="Correo"
          type="email"
          name="correo"
          autoComplete="email"
          inputMode="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          error={error}
        />
        <Button type="submit" cargando={recuperar.isPending}>
          {recuperar.isPending ? 'Enviando…' : 'Enviar enlace'}
        </Button>
      </form>
    </AuthLayout>
  );
}
